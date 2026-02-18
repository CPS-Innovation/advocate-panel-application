const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { asyncHandler } = require('../helpers/async-handler')
const Pagination = require('../helpers/pagination')
const types = require('../data/types')

module.exports = router => {

  router.get("/prosecutors", async (req, res) => {
    let prosecutors = await prisma.user.findMany({
      where: {
        role: 'Prosecutor'
      },
      include: {
        units: {
          include: {
            unit: true
          }
        },
        specialistAreas: true,
        preferredAreas: true,
        restrictedAreas: true,
        _count: {
          select: {
            caseProsecutors: true
          }
        }
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" }
      ]
    })

    let keywords = _.get(req.session.data.prosecutorSearch, 'keywords')

    if(keywords) {
      keywords = keywords.toLowerCase()
      prosecutors = prosecutors.filter(prosecutor => {
        let name = (prosecutor.firstName + ' ' + prosecutor.lastName).toLowerCase()
        return name.indexOf(keywords) > -1
      })
    }

    let totalProsecutors = prosecutors.length
    let pageSize = 25
    let pagination = new Pagination(prosecutors, req.query.page, pageSize)
    prosecutors = pagination.getData()


    res.render('prosecutors/index', {
      totalProsecutors,
      prosecutors,
      pagination
    })
  })

  router.get('/prosecutors/clear-search', (req, res) => {
    _.set(req, 'session.data.prosecutorSearch.keywords', '')
    res.redirect('/prosecutors')
  })

  router.get("/prosecutors/:prosecutorId", asyncHandler(async (req, res) => {
    const prosecutor = await prisma.user.findUnique({
      where: { id: parseInt(req.params.prosecutorId) },
      include: {
        units: {
          include: {
            unit: true
          }
        },
        specialistAreas: true,
        preferredAreas: true,
        restrictedAreas: true,
        _count: {
          select: {
            caseProsecutors: true
          }
        }
      }
    })

    res.render("prosecutors/show", { prosecutor })
  }))

}