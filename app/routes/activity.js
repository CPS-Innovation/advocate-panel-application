const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Pagination = require('../helpers/pagination')
const eventTypes = require('../data/event-types')

function resetFilters(req) {
  _.set(req, 'session.data.activityListFilters.eventTypes', null)
}

module.exports = router => {

  router.get("/activity", async (req, res) => {
    let selectedEventTypeFilters = _.get(req.session.data.activityListFilters, 'eventTypes', [])

    let selectedFilters = { categories: [] }

    // Event type filter display
    if (selectedEventTypeFilters?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Event' },
        items: selectedEventTypeFilters.map(function(label) {
          return { text: label, href: '/activity/remove-type/' + label }
        })
      })
    }

    // Build Prisma where clause
    let where = { AND: [] }

    if (selectedEventTypeFilters?.length) {
      where.AND.push({ title: { in: selectedEventTypeFilters } })
    }

    if (where.AND.length === 0) {
      where = {}
    }

    let events = await prisma.activityLog.findMany({
      where: where,
      include: {
        user: true,
        case: {
          include: {
            defendants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Search by event title or case reference
    let keywords = _.get(req.session.data.activitySearch, 'keywords')

    if(keywords) {
      keywords = keywords.toLowerCase()
      events = events.filter(event => {
        let eventTitle = event.title.toLowerCase()
        let caseReference = event.case ? event.case.reference.toLowerCase() : ''
        return eventTitle.indexOf(keywords) > -1 || caseReference.indexOf(keywords) > -1
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

    res.render('activity/index', {
      events,
      eventTypeItems,
      selectedFilters,
      totalEvents,
      pagination
    })
  })

  router.get('/activity/remove-type/:type', (req, res) => {
    const currentFilters = _.get(req, 'session.data.activityListFilters.eventTypes', [])
    _.set(req, 'session.data.activityListFilters.eventTypes', _.pull(currentFilters, req.params.type))
    res.redirect('/activity')
  })

  router.get('/activity/clear-filters', (req, res) => {
    resetFilters(req)
    res.redirect('/activity')
  })

  router.get('/activity/clear-search', (req, res) => {
    _.set(req, 'session.data.activitySearch.keywords', '')
    res.redirect('/activity')
  })

}