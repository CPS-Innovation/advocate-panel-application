const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Pagination = require('../helpers/pagination')
const { groupDirections } = require('../helpers/directionGrouping')
const { getDirectionStatus } = require('../helpers/directionState')

function resetFilters(req) {
  _.set(req, 'session.data.directionListFilters.prosecutors', null)
  _.set(req, 'session.data.directionListFilters.paralegalOfficers', null)
  _.set(req, 'session.data.directionListFilters.units', null)
  _.set(req, 'session.data.directionListFilters.dateStatus', null)
  _.set(req, 'session.data.directionListFilters.assignee', null)
}

module.exports = router => {

  router.get('/directions/shortcut/overdue', (req, res) => {
    const currentUser = req.session.data.user
    resetFilters(req)
    if (currentUser.role === 'Paralegal officer') {
      res.redirect(`/directions?directionListFilters[paralegalOfficers][]=${currentUser.id}&directionListFilters[dateStatus][]=Overdue&directionListFilters[assignee][]=Prosecution`)
    } else if (currentUser.role === 'Prosecutor') {
      res.redirect(`/directions?directionListFilters[prosecutors][]=${currentUser.id}&directionListFilters[dateStatus][]=Overdue&directionListFilters[assignee][]=Prosecution`)
    } else {
      res.redirect(`/directions?directionListFilters[dateStatus][]=Overdue&directionListFilters[assignee][]=Prosecution`)
    }
  })

  router.get('/directions/shortcut/due-today', (req, res) => {
    const currentUser = req.session.data.user
    resetFilters(req)
    if (currentUser.role === 'Paralegal officer') {
      res.redirect(`/directions?directionListFilters[paralegalOfficers][]=${currentUser.id}&directionListFilters[dateStatus][]=Due today&directionListFilters[assignee][]=Prosecution`)
    } else if (currentUser.role === 'Prosecutor') {
      res.redirect(`/directions?directionListFilters[prosecutors][]=${currentUser.id}&directionListFilters[dateStatus][]=Due today&directionListFilters[assignee][]=Prosecution`)
    } else {
      res.redirect(`/directions?directionListFilters[dateStatus][]=Due today&directionListFilters[assignee][]=Prosecution`)
    }
  })

  router.get('/directions/shortcut/due-tomorrow', (req, res) => {
    const currentUser = req.session.data.user
    resetFilters(req)
    if (currentUser.role === 'Paralegal officer') {
      res.redirect(`/directions?directionListFilters[paralegalOfficers][]=${currentUser.id}&directionListFilters[dateStatus][]=Due tomorrow&directionListFilters[assignee][]=Prosecution`)
    } else if (currentUser.role === 'Prosecutor') {
      res.redirect(`/directions?directionListFilters[prosecutors][]=${currentUser.id}&directionListFilters[dateStatus][]=Due tomorrow&directionListFilters[assignee][]=Prosecution`)
    } else {
      res.redirect(`/directions?directionListFilters[dateStatus][]=Due tomorrow&directionListFilters[assignee][]=Prosecution`)
    }
  })

  router.get('/directions/shortcut/due-this-week', (req, res) => {
    const currentUser = req.session.data.user
    resetFilters(req)
    if (currentUser.role === 'Paralegal officer') {
      res.redirect(`/directions?directionListFilters[paralegalOfficers][]=${currentUser.id}&directionListFilters[dateStatus][]=Due this week&directionListFilters[assignee][]=Prosecution`)
    } else if (currentUser.role === 'Prosecutor') {
      res.redirect(`/directions?directionListFilters[prosecutors][]=${currentUser.id}&directionListFilters[dateStatus][]=Due this week&directionListFilters[assignee][]=Prosecution`)
    } else {
      res.redirect(`/directions?directionListFilters[dateStatus][]=Due this week&directionListFilters[assignee][]=Prosecution`)
    }
  })

  router.get("/directions", async (req, res) => {
    const currentUser = req.session.data.user

    // Get user's unit IDs for filtering
    const userUnitIds = currentUser?.units?.map(uu => uu.unitId) || []

    // Track if this is the first visit (filters object doesn't exist)
    const isFirstVisit = !req.session.data.directionListFilters

    // Ensure directionListFilters object exists
    if (!req.session.data.directionListFilters) {
      req.session.data.directionListFilters = {}
    }

    // Only set default prosecutor to current user on first visit if they're a prosecutor
    if (isFirstVisit && currentUser.role === 'Prosecutor') {
      _.set(req.session.data.directionListFilters, 'prosecutors', [`${currentUser.id}`])
    }

    // Only set default paralegal officer to current user on first visit if they're a paralegal officer
    if (isFirstVisit && currentUser.role === 'Paralegal officer') {
      _.set(req.session.data.directionListFilters, 'paralegalOfficers', [`${currentUser.id}`])
    }

    let selectedProsecutorFilters = _.get(req.session.data.directionListFilters, 'prosecutors', [])
    let selectedParalegalOfficerFilters = _.get(req.session.data.directionListFilters, 'paralegalOfficers', [])
    let selectedUnitFilters = _.get(req.session.data.directionListFilters, 'units', [])
    let selectedDateStatusFilters = _.get(req.session.data.directionListFilters, 'dateStatus', [])
    let selectedAssigneeFilters = _.get(req.session.data.directionListFilters, 'assignee', [])

    let selectedFilters = { categories: [] }
    let selectedProsecutorItems = []
    let selectedParalegalOfficerItems = []
    let selectedUnitItems = []
    let selectedDateStatusItems = []

    let prosecutorIds
    let paralegalOfficerIds

    // Prosecutor filter display
    if (selectedProsecutorFilters?.length) {

      prosecutorIds = selectedProsecutorFilters.filter(function(l) { return l !== "Unassigned" }).map(Number)

      let fetchedProsecutors = []
      if (prosecutorIds.length) {
        fetchedProsecutors = await prisma.user.findMany({
          where: {
            id: { in: prosecutorIds },
            role: 'Prosecutor'
          },
          select: { id: true, firstName: true, lastName: true }
        })
      }

      selectedProsecutorItems = selectedProsecutorFilters.map(function(selectedProsecutor) {
        if (selectedProsecutor === "Unassigned") return { text: "Unassigned", href: '/directions/remove-prosecutor/' + selectedProsecutor }

        const prosecutor = fetchedProsecutors.find(p => p.id === Number(selectedProsecutor))
        let displayText = prosecutor ? `${prosecutor.firstName} ${prosecutor.lastName}` : selectedProsecutor

        if (currentUser && prosecutor && prosecutor.id === currentUser.id) {
          displayText += " (you)"
        }

        return { text: displayText, href: '/directions/remove-prosecutor/' + selectedProsecutor }
      })

      selectedFilters.categories.push({ heading: { text: 'Prosecutor' }, items: selectedProsecutorItems })
    }

    // Paralegal officer filter display
    if (selectedParalegalOfficerFilters?.length) {

      paralegalOfficerIds = selectedParalegalOfficerFilters.filter(function(l) { return l !== "Unassigned" }).map(Number)

      let fetchedParalegalOfficers = []
      if (paralegalOfficerIds.length) {
        fetchedParalegalOfficers = await prisma.user.findMany({
          where: {
            id: { in: paralegalOfficerIds },
            role: 'Paralegal officer'
          },
          select: { id: true, firstName: true, lastName: true }
        })
      }

      selectedParalegalOfficerItems = selectedParalegalOfficerFilters.map(function(selectedParalegalOfficer) {
        if (selectedParalegalOfficer === "Unassigned") return { text: "Unassigned", href: '/directions/remove-paralegal-officer/' + selectedParalegalOfficer }

        const paralegalOfficer = fetchedParalegalOfficers.find(po => po.id === Number(selectedParalegalOfficer))
        let displayText = paralegalOfficer ? `${paralegalOfficer.firstName} ${paralegalOfficer.lastName}` : selectedParalegalOfficer

        if (currentUser && paralegalOfficer && paralegalOfficer.id === currentUser.id) {
          displayText += " (you)"
        }

        return { text: displayText, href: '/directions/remove-paralegal-officer/' + selectedParalegalOfficer }
      })

      selectedFilters.categories.push({ heading: { text: 'Paralegal officer' }, items: selectedParalegalOfficerItems })
    }

    // Unit filter display
    if (selectedUnitFilters?.length) {
      const unitIds = selectedUnitFilters.map(Number)

      let fetchedUnits = await prisma.unit.findMany({
        where: { id: { in: unitIds } }
      })

      selectedUnitItems = selectedUnitFilters.map(function(selectedUnit) {
        let unit = fetchedUnits.find(function(u) { return u.id === Number(selectedUnit) })
        return { text: unit ? unit.name : selectedUnit, href: '/directions/remove-unit/' + selectedUnit }
      })

      selectedFilters.categories.push({ heading: { text: 'Unit' }, items: selectedUnitItems })
    }

    // Date status filter display
    if (selectedDateStatusFilters?.length) {
      selectedDateStatusItems = selectedDateStatusFilters.map(function(dateStatus) {
        return { text: dateStatus, href: '/directions/remove-date-status/' + encodeURIComponent(dateStatus) }
      })

      selectedFilters.categories.push({
        heading: { text: 'Due' },
        items: selectedDateStatusItems
      })
    }

    // Assignee filter display
    let selectedAssigneeItems = []
    if (selectedAssigneeFilters?.length) {
      selectedAssigneeItems = selectedAssigneeFilters.map(function(assignee) {
        return { text: assignee, href: '/directions/remove-assignee/' + encodeURIComponent(assignee) }
      })

      selectedFilters.categories.push({
        heading: { text: 'Assignee' },
        items: selectedAssigneeItems
      })
    }

    // Build Prisma where clause
    let where = { AND: [] }

    // MANDATORY: Exclude completed directions
    where.AND.push({ completedDate: null })

    // MANDATORY: Restrict to directions in user's units only
    if (userUnitIds.length) {
      where.AND.push({ case: { unitId: { in: userUnitIds } } })
    }

    // Prosecutor filter
    if (selectedProsecutorFilters?.length) {
      let prosecutorFilters = []

      if (selectedProsecutorFilters?.includes("Unassigned")) {
        prosecutorFilters.push({ case: { prosecutors: { none: {} } } })
      }

      if (prosecutorIds?.length) {
        prosecutorFilters.push({
          case: {
            prosecutors: {
              some: {
                userId: { in: prosecutorIds }
              }
            }
          }
        })
      }

      if (prosecutorFilters.length) {
        where.AND.push({ OR: prosecutorFilters })
      }
    }

    // Paralegal officer filter
    if (selectedParalegalOfficerFilters?.length) {
      let paralegalOfficerFilters = []

      if (selectedParalegalOfficerFilters?.includes("Unassigned")) {
        paralegalOfficerFilters.push({ case: { paralegalOfficers: { none: {} } } })
      }

      if (paralegalOfficerIds?.length) {
        paralegalOfficerFilters.push({
          case: {
            paralegalOfficers: {
              some: {
                userId: { in: paralegalOfficerIds }
              }
            }
          }
        })
      }

      if (paralegalOfficerFilters.length) {
        where.AND.push({ OR: paralegalOfficerFilters })
      }
    }

    // Assignee filter
    if (selectedAssigneeFilters?.length) {
      where.AND.push({ assignee: { in: selectedAssigneeFilters } })
    }

    if (selectedUnitFilters?.length) {
      const unitIds = selectedUnitFilters.map(Number)
      where.AND.push({ case: { unitId: { in: unitIds } } })
    }

    if (where.AND.length === 0) {
      where = {}
    }

    let directions = await prisma.direction.findMany({
      where: where,
      orderBy: [
        { dueDate: 'asc' }
      ],
      include: {
        defendant: true,
        notes: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        case: {
          include: {
            defendants: {
              include: {
                charges: true,
                defenceLawyer: true
              }
            },
            unit: true,
            prosecutors: {
              include: {
                user: true
              }
            },
            paralegalOfficers: {
              include: {
                user: true
              }
            },
            hearings: {
              orderBy: {
                startDate: 'asc'
              },
              take: 1
            }
          }
        }
      }
    })

    // Add CTL information and status to each direction
    directions = directions.map(direction => {
      let allCtlDates = []
      direction.case.defendants.forEach(defendant => {
        defendant.charges.forEach(charge => {
          if (charge.custodyTimeLimit) {
            allCtlDates.push(new Date(charge.custodyTimeLimit))
          }
        })
      })

      direction.case.hasCTL = allCtlDates.length > 0
      direction.case.soonestCTL = allCtlDates.length > 0 ? new Date(Math.min(...allCtlDates)) : null
      direction.case.ctlCount = allCtlDates.length

      // Add direction status (for tags)
      direction.status = getDirectionStatus(direction)

      return direction
    })

    let keywords = _.get(req.session.data.directionSearch, 'keywords')

    if(keywords) {
      keywords = keywords.toLowerCase()
      directions = directions.filter(direction => {
        let description = direction.description.toLowerCase()
        let caseReference = direction.case.reference.toLowerCase()
        let defendantName = (direction.case.defendants[0].firstName + ' ' + direction.case.defendants[0].lastName).toLowerCase()
        return description.indexOf(keywords) > -1 || caseReference.indexOf(keywords) > -1 || defendantName.indexOf(keywords) > -1
      })
    }

    // Fetch prosecutors from user's units for the filter
    let prosecutors = await prisma.user.findMany({
      where: {
        role: 'Prosecutor',
        units: {
          some: {
            unitId: { in: userUnitIds }
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    let prosecutorItems = prosecutors.map(prosecutor => {
      let text = `${prosecutor.firstName} ${prosecutor.lastName}`
      if (currentUser && prosecutor.id === currentUser.id) {
        text += ' (you)'
      }
      return {
        text: text,
        value: `${prosecutor.id}`
      }
    })

    // Put current user (you) first
    prosecutorItems.sort((a, b) => {
      if (a.text.includes('(you)')) return -1
      if (b.text.includes('(you)')) return 1
      return 0
    })

    // Add Unassigned at the beginning
    prosecutorItems.unshift({ text: 'Unassigned', value: 'Unassigned' })

    // Fetch paralegal officers from user's units for the filter
    let paralegalOfficers = await prisma.user.findMany({
      where: {
        role: 'Paralegal officer',
        units: {
          some: {
            unitId: { in: userUnitIds }
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    let paralegalOfficerItems = paralegalOfficers.map(po => {
      let text = `${po.firstName} ${po.lastName}`
      if (currentUser && po.id === currentUser.id) {
        text += ' (you)'
      }
      return {
        text: text,
        value: `${po.id}`
      }
    })

    // Put current user (you) first
    paralegalOfficerItems.sort((a, b) => {
      if (a.text.includes('(you)')) return -1
      if (b.text.includes('(you)')) return 1
      return 0
    })

    // Add Unassigned at the beginning
    paralegalOfficerItems.unshift({ text: 'Unassigned', value: 'Unassigned' })

    // Fetch only user's units for the filter
    let units = await prisma.unit.findMany({
      where: { id: { in: userUnitIds } }
    })

    let unitItems = units.map(unit => ({
      text: unit.name,
      value: `${unit.id}`
    }))

    // Date status items
    let dateStatusItems = [
      { text: 'Overdue', value: 'Overdue' },
      { text: 'Due today', value: 'Due today' },
      { text: 'Due tomorrow', value: 'Due tomorrow' },
      { text: 'Due this week', value: 'Due this week' },
      { text: 'Due later', value: 'Due later' }
    ]

    // Assignee items
    let assigneeItems = [
      { text: 'Defence', value: 'Defence' },
      { text: 'Prosecution', value: 'Prosecution' }
    ]

    // Add grouping metadata to directions based on due date
    directions = groupDirections(directions)

    // Filter by date status (after grouping)
    if (selectedDateStatusFilters?.length) {
      directions = directions.filter(direction => {
        return selectedDateStatusFilters.includes(direction.groupHeading)
      })
    }

    // Sort by date group, then by due date
    directions.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      return new Date(a.dueDate) - new Date(b.dueDate)
    })

    let totalDirections = directions.length
    let pageSize = 25
    let pagination = new Pagination(directions, req.query.page, pageSize)
    directions = pagination.getData()

    res.render('directions/index', {
      directions,
      pagination,
      totalDirections,
      prosecutorItems,
      selectedProsecutorFilters,
      selectedProsecutorItems,
      paralegalOfficerItems,
      selectedParalegalOfficerFilters,
      selectedParalegalOfficerItems,
      unitItems,
      selectedUnitFilters,
      selectedUnitItems,
      dateStatusItems,
      selectedDateStatusFilters,
      selectedDateStatusItems,
      assigneeItems,
      selectedAssigneeFilters,
      selectedAssigneeItems,
      selectedFilters
    })
  })

  router.get('/directions/remove-prosecutor/:prosecutorId', (req, res) => {
    const currentFilters = _.get(req, 'session.data.directionListFilters.prosecutors', [])
    _.set(req, 'session.data.directionListFilters.prosecutors', _.pull(currentFilters, req.params.prosecutorId))
    res.redirect('/directions')
  })

  router.get('/directions/remove-paralegal-officer/:paralegalOfficerId', (req, res) => {
    const currentFilters = _.get(req, 'session.data.directionListFilters.paralegalOfficers', [])
    _.set(req, 'session.data.directionListFilters.paralegalOfficers', _.pull(currentFilters, req.params.paralegalOfficerId))
    res.redirect('/directions')
  })

  router.get('/directions/remove-unit/:unitId', (req, res) => {
    const currentFilters = _.get(req, 'session.data.directionListFilters.units', [])
    _.set(req, 'session.data.directionListFilters.units', _.pull(currentFilters, req.params.unitId))
    res.redirect('/directions')
  })

  router.get('/directions/remove-date-status/:dateStatus', (req, res) => {
    const currentFilters = _.get(req, 'session.data.directionListFilters.dateStatus', [])
    const dateStatus = decodeURIComponent(req.params.dateStatus)
    _.set(req, 'session.data.directionListFilters.dateStatus', _.pull(currentFilters, dateStatus))
    res.redirect('/directions')
  })

  router.get('/directions/remove-assignee/:assignee', (req, res) => {
    const currentFilters = _.get(req, 'session.data.directionListFilters.assignee', [])
    const assignee = decodeURIComponent(req.params.assignee)
    _.set(req, 'session.data.directionListFilters.assignee', _.pull(currentFilters, assignee))
    res.redirect('/directions')
  })

  router.get('/directions/clear-filters', (req, res) => {
    resetFilters(req)
    res.redirect('/directions')
  })

  router.get('/directions/clear-search', (req, res) => {
    _.set(req, 'session.data.directionSearch.keywords', '')
    res.redirect('/directions')
  })

}
