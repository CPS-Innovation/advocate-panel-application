const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getCompletionStatus, getDgaReportStatus } = require('../helpers/dgaReportStatus')
const Pagination = require('../helpers/pagination')

module.exports = router => {
  router.get('/dga-reporting', async (req, res) => {
    const currentUser = req.session.data.user

    // Get user's unit IDs for filtering
    const userUnitIds = currentUser?.units?.map(uu => uu.unitId) || []

    // Get all cases with DGA that have a reviewDate
    const dgaCases = await prisma.case.findMany({
      where: {
        AND: [
          { dga: { isNot: null } },
          { dga: { reviewDate: { not: null } } },
          { unitId: { in: userUnitIds } }
        ]
      },
      include: {
        dga: {
          include: {
            failureReasons: true
          }
        }
      }
    })

    // Group cases by month (YYYY-MM format)
    const monthsMap = new Map()

    dgaCases.forEach(_case => {
      if (!_case.dga?.reviewDate) return

      const date = new Date(_case.dga.reviewDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          key: monthKey,
          name: monthName,
          deadline: _case.dga.recordDisputeOutcomesDeadline,
          totalCases: 0,
          compliantCases: 0,
          nonCompliantCases: 0,
          completedCases: 0,
          date: date
        })
      }

      const monthData = monthsMap.get(monthKey)
      monthData.totalCases++

      const isNonCompliant = _case.dga.failureReasons.length > 0
      if (isNonCompliant) {
        monthData.nonCompliantCases++
        // Check if all failure reasons have outcomes
        const allCompleted = _case.dga.failureReasons.every(fr => fr.disputed !== null)
        if (allCompleted) {
          monthData.completedCases++
        }
      } else {
        monthData.compliantCases++
      }
    })

    // Convert to array, add status, and sort by date (most recent first)
    // Status is based on non-compliant cases only (compliant cases don't need outcomes recorded)
    const months = Array.from(monthsMap.values())
      .map(month => ({
        ...month,
        status: getCompletionStatus(month.completedCases, month.nonCompliantCases)
      }))
      .sort((a, b) => b.date - a.date)

    res.render('dga-reporting/index', {
      months
    })
  })

  // Show cases for a specific month, grouped by police unit
  router.get('/dga-reporting/:month', async (req, res) => {
    const monthKey = req.params.month // Expected format: YYYY-MM (e.g., "2024-10")
    const currentUser = req.session.data.user

    // Get user's unit IDs for filtering
    const userUnitIds = currentUser?.units?.map(uu => uu.unitId) || []

    // Parse the month key
    const [year, month] = monthKey.split('-').map(Number)

    if (!year || !month || month < 1 || month > 12) {
      return res.redirect('/dga-reporting')
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1) // First day of month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999) // Last day of month

    // Get all cases with DGA for this month
    const dgaCases = await prisma.case.findMany({
      where: {
        AND: [
          { dga: { isNot: null } },
          {
            dga: {
              reviewDate: {
                gte: startDate,
                lte: endDate
              }
            }
          },
          { unitId: { in: userUnitIds } }
        ]
      },
      include: {
        unit: true,
        policeUnit: true,
        defendants: {
          include: {
            charges: true
          }
        },
        dga: {
          include: {
            failureReasons: true
          }
        }
      },
      orderBy: {
        policeUnit: {
          name: 'asc'
        }
      }
    })

    if (dgaCases.length === 0) {
      return res.redirect('/dga-reporting')
    }

    // Group cases by police unit
    const policeUnitsMap = new Map()

    dgaCases.forEach(_case => {
      const policeUnitId = _case.policeUnitId || 0
      const policeUnitName = _case.policeUnit?.name || 'Not specified'

      if (!policeUnitsMap.has(policeUnitId)) {
        policeUnitsMap.set(policeUnitId, {
          id: policeUnitId,
          name: policeUnitName,
          cases: [],
          totalCases: 0,
          compliantCases: 0,
          nonCompliantCases: 0,
          completedCases: 0,
          hasAnyProgress: false,
          sentDate: null,
          hasSentToPolice: false
        })
      }

      const unitData = policeUnitsMap.get(policeUnitId)
      unitData.cases.push(_case)
      unitData.totalCases++

      // Check if this case has been sent to police (they all should have same date)
      if (_case.dga.sentToPoliceDate && !unitData.hasSentToPolice) {
        unitData.sentDate = _case.dga.sentToPoliceDate
        unitData.hasSentToPolice = true
      }

      // Check compliance: non-compliant if has failure reasons
      const isNonCompliant = _case.dga.failureReasons.length > 0
      if (isNonCompliant) {
        unitData.nonCompliantCases++

        // Check if all failure reasons have outcomes (case is fully complete)
        const allCompleted = _case.dga.failureReasons.every(fr => fr.disputed !== null)
        if (allCompleted) {
          unitData.completedCases++
        }

        // Check if any failure reason has an outcome (case has progress)
        const hasAnyOutcome = _case.dga.failureReasons.some(fr => fr.disputed !== null)
        if (hasAnyOutcome) {
          unitData.hasAnyProgress = true
        }
      } else {
        unitData.compliantCases++
      }
    })

    // Convert to array, add status, and sort alphabetically by police unit name
    // Status is based on non-compliant cases only (compliant cases don't need outcomes recorded)
    const policeUnits = Array.from(policeUnitsMap.values())
      .map(unit => {
        let status
        if (unit.nonCompliantCases === 0 || unit.completedCases === unit.nonCompliantCases) {
          status = 'Completed'
        } else if (unit.hasAnyProgress) {
          status = 'In progress'
        } else {
          status = 'Not started'
        }
        const casesNeedingOutcomes = unit.nonCompliantCases - unit.completedCases
        return { ...unit, status, casesNeedingOutcomes }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    // Get month details
    const monthName = startDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    const deadline = dgaCases.find(c => c.dga?.recordDisputeOutcomesDeadline)?.dga?.recordDisputeOutcomesDeadline

    res.render('dga-reporting/month', {
      monthKey,
      monthName,
      deadline,
      policeUnits,
      totalCases: dgaCases.length
    })
  })

  // Show cases for a specific police unit within a month
  router.get('/dga-reporting/:month/:policeUnitId', async (req, res) => {
    const monthKey = req.params.month // Expected format: YYYY-MM (e.g., "2024-10")
    const policeUnitId = parseInt(req.params.policeUnitId)
    const currentUser = req.session.data.user

    // Get user's unit IDs for filtering
    const userUnitIds = currentUser?.units?.map(uu => uu.unitId) || []

    // Parse the month key
    const [year, month] = monthKey.split('-').map(Number)

    if (!year || !month || month < 1 || month > 12) {
      return res.redirect('/dga-reporting')
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1) // First day of month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999) // Last day of month

    // Get all cases with DGA for this month
    const dgaCases = await prisma.case.findMany({
      where: {
        AND: [
          { dga: { isNot: null } },
          {
            dga: {
              reviewDate: {
                gte: startDate,
                lte: endDate
              }
            }
          },
          { unitId: { in: userUnitIds } }
        ]
      },
      include: {
        unit: true,
        policeUnit: true,
        defendants: {
          include: {
            charges: true
          }
        },
        dga: {
          include: {
            failureReasons: true
          }
        }
      },
      orderBy: {
        reference: 'asc'
      }
    })

    if (dgaCases.length === 0) {
      return res.redirect('/dga-reporting')
    }

    // Filter cases by police unit ID and only include non-compliant cases (those with failure reasons)
    let casesForPoliceUnit = dgaCases.filter(c => {
      return c.policeUnitId === policeUnitId && c.dga.failureReasons.length > 0
    })

    // Apply search filter if keywords provided
    const searchKeywords = req.session.data.dgaReportingSearch?.keywords
    if (searchKeywords) {
      const keywords = searchKeywords.toLowerCase().trim()
      casesForPoliceUnit = casesForPoliceUnit.filter(c => {
        return c.reference.toLowerCase().includes(keywords)
      })
    }

    if (casesForPoliceUnit.length === 0) {
      return res.redirect(`/dga-reporting/${monthKey}`)
    }

    // Calculate report status for each case
    const casesWithStatus = casesForPoliceUnit.map(_case => {
      const outcomesTotal = _case.dga.failureReasons.length
      const outcomesCompleted = _case.dga.failureReasons.filter(fr => fr.disputed !== null).length

      return {
        ..._case,
        reportStatus: getDgaReportStatus(_case),
        outcomesTotal,
        outcomesCompleted,
        outcomesNotRecorded: outcomesTotal - outcomesCompleted
      }
    })

    // Get police unit name from first case
    const policeUnitName = casesForPoliceUnit[0].policeUnit?.name || 'Not specified'
    const monthName = startDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    // Apply pagination
    const pagination = new Pagination(casesWithStatus, req.query.page, 25)
    const paginatedCases = pagination.getData()

    res.render('dga-reporting/police-cases', {
      monthKey,
      monthName,
      policeUnitId,
      policeUnitName,
      cases: paginatedCases,
      pagination,
      totalCases: casesForPoliceUnit.length
    })
  })

  // Clear search
  router.get('/dga-reporting/:month/:policeUnitId/clear-search', (req, res) => {
    delete req.session.data.dgaReportingSearch
    res.redirect(`/dga-reporting/${req.params.month}/${req.params.policeUnitId}`)
  })

  // View the failure reasons list for a specific case
  router.get('/dga-reporting/:month/:policeUnitId/:caseId', async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const monthKey = req.params.month // e.g., "2025-10"
    const policeUnitId = parseInt(req.params.policeUnitId)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        dga: {
          include: {
            failureReasons: true
          }
        }
      }
    })

    // Calculate month name from monthKey
    const [year, month] = monthKey.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    // Get police unit name from case
    const policeUnitName = caseData.policeUnit?.name || 'Not specified'

    // Calculate report status
    const reportStatus = getDgaReportStatus(caseData)

    // Calculate outcomes progress
    const outcomesTotal = caseData.dga.failureReasons.length
    const outcomesCompleted = caseData.dga.failureReasons.filter(fr => fr.disputed !== null).length
    const outcomesRemaining = outcomesTotal - outcomesCompleted

    res.render('dga-reporting/case-failures', {
      case: caseData,
      monthKey,
      monthName,
      policeUnitName,
      policeUnitId,
      reportStatus,
      outcomesTotal,
      outcomesCompleted,
      outcomesRemaining
    })
  })

}
