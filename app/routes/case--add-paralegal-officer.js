const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {

  router.get("/cases/:caseId/add-paralegal-officer", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
        unit: true,
        paralegalOfficers: {
          include: { user: { select: { id: true } } }
        }
      }
    })

    const assignedParalegalOfficers = _.get(req.session.data, 'editParalegalOfficers.paralegalOfficers') || _case.paralegalOfficers.map(cpo => `${cpo.user.id}`)

    // Get all users with role "Paralegal officer" from this case's unit
    let paralegalOfficers = await prisma.user.findMany({
      where: {
        role: 'Paralegal officer',
        units: {
          some: {
            unitId: _case.unitId
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
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

    let paralegalOfficerItems = paralegalOfficers.map(po => {
      const caseCount = po._count.caseParalegalOfficers
      let text = `${po.firstName} ${po.lastName}`

      return {
        text: text,
        value: `${po.id}`,
        hint: {
          text: caseCount === 0 ? "No cases" : `${caseCount} case${caseCount > 1 ? "s" : ""}`
        }
      }
    })

    res.render("cases/add-paralegal-officer/index", {
      _case,
      assignedParalegalOfficers,
      paralegalOfficerItems
    })
  })

  router.post("/cases/:caseId/add-paralegal-officer", async (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/add-paralegal-officer/check`)
  })

  router.get("/cases/:caseId/add-paralegal-officer/check", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
    })

    // get the paralegal officer being assigned
    let paralegalOfficer = await prisma.user.findUnique({
      where: { id: parseInt(req.session.data.assignParalegalOfficer.paralegalOfficer) },
      include: {
        caseParalegalOfficers: {
          include: {
            case: { select: { id: true, reference: true } }
          }
        },
        _count: { select: { caseParalegalOfficers: true } },
      },
    })

    res.render("cases/add-paralegal-officer/check", {
      _case,
      paralegalOfficer
    })
  })

  router.post("/cases/:caseId/add-paralegal-officer/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const paralegalOfficerId = parseInt(req.session.data.assignParalegalOfficer.paralegalOfficer)

    // Create CaseParalegalOfficer record
    await prisma.caseParalegalOfficer.create({
      data: {
        caseId: caseId,
        userId: paralegalOfficerId
      }
    })

    const paralegalOfficer = await prisma.user.findUnique({
      where: { id: paralegalOfficerId },
      select: { id: true, firstName: true, lastName: true }
    })

    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Case',
        recordId: caseId,
        action: 'UPDATE',
        title: 'Paralegal officer assigned',
        caseId: caseId,
        meta: { paralegalOfficer }
      }
    })

    delete req.session.data.assignParalegalOfficer

    req.flash('success', 'Paralegal officer assigned')
    res.redirect(`/cases/${req.params.caseId}`)
  })

}
