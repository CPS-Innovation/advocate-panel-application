const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function getWeeksForMonth (year, month) {
  const lastDay = new Date(year, month, 0).getDate()
  const weeks = []
  let weekNum = 1
  let startDay = 1

  while (startDay <= lastDay) {
    const endDay = Math.min(startDay + 6, lastDay)
    const endDate = new Date(year, month - 1, endDay)
    weeks.push({
      value: weekNum.toString(),
      startDay,
      endDay,
      endDate,
      label: `Week ${weekNum} - ending ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    })
    weekNum++
    startDay = endDay + 1
  }
  return weeks
}

module.exports = router => {
  // Show week selection page for export
  router.get('/dga-reporting/:month/:policeUnitId/export', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const [year, month] = monthKey.split('-').map(Number)

    const weeks = getWeeksForMonth(year, month)
    const policeUnit = await prisma.policeUnit.findUnique({ where: { id: policeUnitId } })
    const monthName = new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    const weekItems = weeks.map(week => ({
      value: week.value,
      text: week.label
    }))

    res.render('dga-reporting/export/index', {
      monthKey,
      monthName,
      policeUnitId,
      policeUnit,
      weeks,
      weekItems
    })
  })

  // Export cases for selected weeks
  router.post('/dga-reporting/:month/:policeUnitId/export', async (req, res) => {
    const ExcelJS = require('exceljs')
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const currentUser = req.session.data.user

    // Get user's unit IDs for filtering
    const userUnitIds = currentUser?.units?.map(uu => uu.unitId) || []

    // Parse the month key
    const [year, month] = monthKey.split('-').map(Number)

    // Get selected weeks
    const selectedWeeks = req.body.export.weeks

    // Build date ranges from selected weeks
    const weeks = getWeeksForMonth(year, month)
    const selectedWeekData = weeks.filter(w => selectedWeeks.includes(w.value))

    // Build date filter conditions for selected weeks
    const dateConditions = selectedWeekData.map(week => ({
      dga: {
        reviewDate: {
          gte: new Date(year, month - 1, week.startDay),
          lte: new Date(year, month - 1, week.endDay, 23, 59, 59, 999)
        }
      }
    }))

    // Get all cases with DGA for this month and police unit, filtered by selected weeks
    const cases = await prisma.case.findMany({
      where: {
        AND: [
          { dga: { isNot: null } },
          { OR: dateConditions },
          { unitId: { in: userUnitIds } },
          { policeUnitId: policeUnitId }
        ]
      },
      include: {
        unit: true,
        policeUnit: true,
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

    // Get police unit name for filename
    const policeUnitName = cases[0].policeUnit?.name || 'unknown'

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('DGA Outcomes Report')

    // Define columns
    worksheet.columns = [
      { header: 'URN', key: 'urn', width: 15 },
      { header: 'Casework Type', key: 'caseworkType', width: 20 },
      { header: 'Unit', key: 'unit', width: 20 },
      { header: 'Police Unit Name', key: 'policeUnitName', width: 20 },
      { header: 'Police unit', key: 'policeUnit', width: 15 },
      { header: 'Reviewing group', key: 'reviewingGroup', width: 20 },
      { header: 'Review Type All', key: 'reviewTypeAll', width: 20 },
      { header: 'Review', key: 'review', width: 15 },
      { header: 'Prosecutor\'s Declaration', key: 'prosecutorDeclaration', width: 25 },
      { header: 'Rape', key: 'rape', width: 10 },
      { header: 'Domestic violence', key: 'domesticViolence', width: 20 },
      { header: 'Hate Crime Flag', key: 'hateCrimeFlag', width: 20 },
      { header: 'Failure types', key: 'failureTypes', width: 30 },
      { header: 'Did the police dispute this failure?', key: 'disputed', width: 35 },
      { header: 'Did CPS accept the dispute?', key: 'cpsAccepted', width: 30 },
      { header: 'Contact methods', key: 'contactMethods', width: 20 },
      { header: 'Comments', key: 'comments', width: 30 }
    ]

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }

    // Add data rows - one row per failure reason
    cases.forEach(_case => {
      if (_case.dga && _case.dga.failureReasons && _case.dga.failureReasons.length > 0) {
        _case.dga.failureReasons.forEach(failureReason => {
          worksheet.addRow({
            urn: _case.reference,
            caseworkType: _case.type || '',
            unit: _case.unit?.name || '',
            policeUnitName: _case.policeUnit?.name || '',
            policeUnit: _case.policeUnitId || '',
            reviewingGroup: '',
            reviewTypeAll: '',
            review: '',
            prosecutorDeclaration: '',
            rape: '',
            domesticViolence: '',
            hateCrimeFlag: '',
            failureTypes: failureReason.reason,
            disputed: failureReason.disputed || '',
            cpsAccepted: failureReason.cpsAccepted || '',
            contactMethods: failureReason.methods || '',
            comments: failureReason.details || ''
          })
        })
      }
    })

    // Generate filename with month and police unit name
    const monthName = new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      .toLowerCase()
      .replace(' ', '-')
    const safePoliceUnitName = policeUnitName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const filename = `dga-outcomes-${monthName}-${safePoliceUnitName}.xlsx`

    // Set response headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)

    // Write to response
    await workbook.xlsx.write(res)
    res.end()
  })
}
