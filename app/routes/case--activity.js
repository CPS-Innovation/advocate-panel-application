const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Pagination = require('../helpers/pagination')
const eventTypes = require('../data/event-types')
const { addTimeLimitDates } = require('../helpers/timeLimit')

function resetFilters(req) {
  _.set(req, 'session.data.caseActivityListFilters.eventTypes', null)
}

module.exports = router => {
  router.get("/cases/:caseId/activity", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    let selectedEventTypeFilters = _.get(req.session.data.caseActivityListFilters, 'eventTypes', [])

    let selectedFilters = { categories: [] }

    // Event type filter display
    if (selectedEventTypeFilters?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Event' },
        items: selectedEventTypeFilters.map(function(label) {
          return { text: label, href: `/cases/${caseId}/activity/remove-type/${label}` }
        })
      })
    }

    // Fetch case
    let _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        witnesses: { include: { statements: true } },
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
        defendants: {
          include: {
            charges: true
          }
        },
        location: true,
        tasks: true,
        dga: true
      }
    })

    _case = addTimeLimitDates(_case)

    // Build Prisma where clause for events
    let where = { caseId: caseId, AND: [] }

    if (selectedEventTypeFilters?.length) {
      where.AND.push({ title: { in: selectedEventTypeFilters } })
    }

    if (where.AND.length === 0) {
      delete where.AND
    }

    let events = await prisma.activityLog.findMany({
      where: where,
      include: {
        user: true,
        case: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Search by event title
    let keywords = _.get(req.session.data.caseActivitySearch, 'keywords')

    if(keywords) {
      keywords = keywords.toLowerCase()
      events = events.filter(event => {
        let eventTitle = event.title.toLowerCase()
        return eventTitle.indexOf(keywords) > -1
      })
    }

    let eventTypeItems = eventTypes.map(eventType => ({
      text: eventType,
      value: eventType
    }))

    let totalEvents = events.length
    let pageSize = 25
    let pagination = new Pagination(events, req.query.page, pageSize)
    events = pagination.getData()

    res.render("cases/activity/index", {
      _case,
      events,
      eventTypeItems,
      selectedFilters,
      totalEvents,
      pagination
    })
  })

  router.get('/cases/:caseId/activity/remove-type/:type', (req, res) => {
    const currentFilters = _.get(req, 'session.data.caseActivityListFilters.eventTypes', [])
    _.set(req, 'session.data.caseActivityListFilters.eventTypes', _.pull(currentFilters, req.params.type))
    res.redirect(`/cases/${req.params.caseId}/activity`)
  })

  router.get('/cases/:caseId/activity/clear-filters', (req, res) => {
    resetFilters(req)
    res.redirect(`/cases/${req.params.caseId}/activity`)
  })

  router.get('/cases/:caseId/activity/clear-search', (req, res) => {
    _.set(req, 'session.data.caseActivitySearch.keywords', '')
    res.redirect(`/cases/${req.params.caseId}/activity`)
  })

}