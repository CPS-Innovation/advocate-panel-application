const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Pagination = require('../helpers/pagination')

module.exports = router => {

  router.get("/paralegal-officers", async (req, res) => {
    const userUnitIds = req.session.data.user.units.map(u => u.unitId)

    let paralegalOfficers = await prisma.user.findMany({
      where: {
        role: 'Paralegal officer',
        units: {
          some: {
            unitId: { in: userUnitIds }
          }
        }
      },
      include: {
        units: {
          include: {
            unit: true
          }
        },
        _count: {
          select: {
            caseParalegalOfficers: true
          }
        }
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" }
      ]
    })

    let keywords = _.get(req.session.data.paralegalOfficerSearch, 'keywords')

    if (keywords) {
      keywords = keywords.toLowerCase()
      paralegalOfficers = paralegalOfficers.filter(po => {
        let name = (po.firstName + ' ' + po.lastName).toLowerCase()
        return name.indexOf(keywords) > -1
      })
    }

    let totalParalegalOfficers = paralegalOfficers.length
    let pageSize = 25
    let pagination = new Pagination(paralegalOfficers, req.query.page, pageSize)
    paralegalOfficers = pagination.getData()

    res.render('paralegal-officers/index', {
      totalParalegalOfficers,
      paralegalOfficers,
      pagination
    })
  })

  router.get('/paralegal-officers/clear-search', (req, res) => {
    _.set(req, 'session.data.paralegalOfficerSearch.keywords', '')
    res.redirect('/paralegal-officers')
  })

}
