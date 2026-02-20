const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getTaskSeverity } = require('../helpers/taskState')
const { addTimeLimitDates } = require('../helpers/timeLimit')
const { getDateGroup, getPaceClockGroup } = require('../helpers/taskGrouping')

module.exports = router => {

  router.get("/overview", async (req, res) => {
    const currentUser = req.session.data.user
    const userUnitIds = currentUser?.units?.map(uu => uu.unitId) || []

    const unassignedCaseCount = await prisma.case.count({
      where: {
        prosecutors: {
          none: {}
        }
      }
    })

    // Count prosecutors with incomplete profiles (no specialist, preferred, or restricted areas)
    const allProsecutors = await prisma.user.findMany({
      where: {
        role: 'Prosecutor'
      },
      include: {
        specialistAreas: true,
        preferredAreas: true,
        restrictedAreas: true
      }
    })

    const incompleteProfileCount = allProsecutors.filter(prosecutor =>
      prosecutor.specialistAreas.length === 0 &&
      prosecutor.preferredAreas.length === 0 &&
      prosecutor.restrictedAreas.length === 0
    ).length

    const needsDGAReviewCount = await prisma.case.count({
      where: {
        dga: {
          failureReasons: {
            some: {
              disputed: null
            }
          }
        }
      }
    })

    // Find the latest DGA month with cases needing outcomes
    const dgaCasesNeedingOutcomes = await prisma.dGA.findMany({
      where: {
        reviewDate: { not: null },
        failureReasons: {
          some: {
            disputed: null
          }
        }
      },
      include: {
        failureReasons: true
      }
    })

    // Group by month and find the latest one
    let latestDGAMonth = null
    if (dgaCasesNeedingOutcomes.length > 0) {
      const monthGroups = {}
      dgaCasesNeedingOutcomes.forEach(dga => {
        const date = new Date(dga.reviewDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = {
            key: monthKey,
            deadline: dga.recordDisputeOutcomesDeadline,
            count: 0
          }
        }
        monthGroups[monthKey].count++
      })

      const sortedMonths = Object.values(monthGroups).sort((a, b) => b.key.localeCompare(a.key))
      if (sortedMonths.length > 0) {
        const latest = sortedMonths[0]
        const [year, month] = latest.key.split('-')
        const monthName = new Date(year, parseInt(month) - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
        latestDGAMonth = {
          key: latest.key,
          name: monthName,
          deadline: latest.deadline,
          count: latest.count
        }
      }
    }

    // Count urgent tasks assigned to current user
    const urgentTaskCount = await prisma.task.count({
      where: {
        AND: [
          { completedDate: null },
          { assignedToUserId: currentUser.id },
          { case: { unitId: { in: userUnitIds } } },
          { isUrgent: true }
        ]
      }
    })

    // Count priority charging tasks assigned to current user
    const priorityChargingTaskCount = await prisma.task.count({
      where: {
        AND: [
          { completedDate: null },
          { assignedToUserId: currentUser.id },
          { case: { unitId: { in: userUnitIds } } },
          {
            OR: [
              { name: 'Priority PCD review' },
              { name: 'Priority resubmitted PCD case' }
            ]
          }
        ]
      }
    })

    const adminPoolTaskCount = await prisma.task.count({
      where: {
        AND: [
          { completedDate: null },
          { case: { unitId: { in: userUnitIds } } },
          { assignedToTeam: { name: 'Admin pool' } }
        ]
      }
    })

    const unitPriorityChargingTaskCount = await prisma.task.count({
      where: {
        AND: [
          { completedDate: null },
          { case: { unitId: { in: userUnitIds } } },
          {
            OR: [
              { name: 'Priority PCD review' },
              { name: 'Priority resubmitted PCD case' }
            ]
          }
        ]
      }
    })

    // Fetch tasks assigned to current user with case and defendant info for time limit calculation
    let tasks = await prisma.task.findMany({
      where: {
        AND: [
          { completedDate: null },
          { assignedToUserId: currentUser.id },
          { case: { unitId: { in: userUnitIds } } }
        ]
      },
      include: {
        case: {
          include: {
            defendants: {
              include: {
                charges: true
              }
            }
          }
        }
      }
    })

    // Calculate severity for each task and group by severity
    const tasksBySeverity = {
      'Critically overdue': [],
      'Overdue': [],
      'Due soon': [],
      'Not due yet': []
    }

    // Initialize counters for each time limit type and range
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const ctlCountsByRange = {
      overdue: 0,
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      nextWeek: 0,
      later: 0
    }

    const stlCountsByRange = {
      overdue: 0,
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      nextWeek: 0,
      later: 0
    }

    const paceClockCountsByRange = {
      expired: 0,
      lessThan1Hour: 0,
      lessThan2Hours: 0,
      lessThan3Hours: 0,
      moreThan3Hours: 0
    }

    tasks.forEach(task => {
      const severity = getTaskSeverity(task)
      if (tasksBySeverity[severity]) {
        tasksBySeverity[severity].push(task)
      }

      // Calculate time limit info for this task's case
      addTimeLimitDates(task.case)

      // Count by CTL date range
      if (task.case.custodyTimeLimit) {
        const ctlGroupKey = getDateGroup(task.case.custodyTimeLimit, today)
        if (ctlGroupKey !== 'noDate' && ctlCountsByRange[ctlGroupKey] !== undefined) {
          ctlCountsByRange[ctlGroupKey]++
        }
      }

      // Count by STL date range
      if (task.case.statutoryTimeLimit) {
        const stlGroupKey = getDateGroup(task.case.statutoryTimeLimit, today)
        if (stlGroupKey !== 'noDate' && stlCountsByRange[stlGroupKey] !== undefined) {
          stlCountsByRange[stlGroupKey]++
        }
      }

      // Count by PACE clock time range
      if (task.case.paceClock) {
        const paceGroupKey = getPaceClockGroup(task.case.paceClock)
        if (paceGroupKey !== 'noPaceClock' && paceClockCountsByRange[paceGroupKey] !== undefined) {
          paceClockCountsByRange[paceGroupKey]++
        }
      }
    })

    // Fetch directions for cases assigned to current user (as prosecutor or paralegal officer)
    // Only include directions assigned to Prosecution
    const directionWhere = {
      AND: [
        { completedDate: null },
        { assignee: 'Prosecution' },
        {
          case: {
            unitId: { in: userUnitIds }
          }
        }
      ]
    }

    // Filter by current user's role
    if (currentUser.role === 'Prosecutor') {
      directionWhere.AND.push({
        case: {
          prosecutors: {
            some: { userId: currentUser.id }
          }
        }
      })
    } else if (currentUser.role === 'Paralegal officer') {
      directionWhere.AND.push({
        case: {
          paralegalOfficers: {
            some: { userId: currentUser.id }
          }
        }
      })
    }

    let directions = await prisma.direction.findMany({
      where: directionWhere
    })

    // Categorize directions by due date (reuse today from above)
    // const today is already defined earlier for time limit grouping

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dueTodayDirectionCount = 0
    let dueTomorrowDirectionCount = 0
    let overdueDirectionCount = 0

    directions.forEach(direction => {
      const dueDate = new Date(direction.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        overdueDirectionCount++
      } else if (dueDate.getTime() === today.getTime()) {
        dueTodayDirectionCount++
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        dueTomorrowDirectionCount++
      }
    })

    // Count cases assigned to current user as prosecutor
    let prosecutorCaseCount = 0
    if (currentUser.role === 'Prosecutor') {
      prosecutorCaseCount = await prisma.case.count({
        where: {
          prosecutors: {
            some: {
              userId: currentUser.id
            }
          }
        }
      })
    }

    // Count cases assigned to current user as paralegal officer
    let paralegalOfficerCaseCount = 0
    if (currentUser.role === 'Paralegal officer') {
      paralegalOfficerCaseCount = await prisma.case.count({
        where: {
          paralegalOfficers: {
            some: {
              userId: currentUser.id
            }
          }
        }
      })
    }

    const recentCases = await prisma.recentCase.findMany({
      where: { userId: currentUser.id },
      orderBy: { openedAt: 'desc' },
      take: 5,
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render('overview/index', {
      unassignedCaseCount,
      incompleteProfileCount,
      needsDGAReviewCount,
      latestDGAMonth,
      urgentTaskCount,
      priorityChargingTaskCount,
      adminPoolTaskCount,
      unitPriorityChargingTaskCount,
      ctlCountsByRange,
      stlCountsByRange,
      paceClockCountsByRange,
      criticallyOverdueTaskCount: tasksBySeverity['Critically overdue'].length,
      overdueTaskCount: tasksBySeverity['Overdue'].length,
      dueSoonTaskCount: tasksBySeverity['Due soon'].length,
      notDueYetTaskCount: tasksBySeverity['Not due yet'].length,
      dueTodayDirectionCount,
      dueTomorrowDirectionCount,
      overdueDirectionCount,
      prosecutorCaseCount,
      paralegalOfficerCaseCount,
      recentCases
    })
  })

}