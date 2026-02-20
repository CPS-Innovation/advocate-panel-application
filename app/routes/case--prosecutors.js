const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {

  router.get("/cases/:caseId/prosecutors/:caseProsecutorId/remove", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const caseProsecutorId = parseInt(req.params.caseProsecutorId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId }
    })

    const caseProsecutor = await prisma.caseProsecutor.findUnique({
      where: { id: caseProsecutorId },
      include: { user: true }
    })

    res.render("cases/prosecutors/remove/index", { _case, caseProsecutor })
  })

  router.post("/cases/:caseId/prosecutors/:caseProsecutorId/remove", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const caseProsecutorId = parseInt(req.params.caseProsecutorId)

    const caseProsecutor = await prisma.caseProsecutor.findUnique({
      where: { id: caseProsecutorId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } }
    })

    await prisma.caseProsecutor.delete({
      where: { id: caseProsecutorId }
    })

    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Case',
        recordId: caseId,
        action: 'UPDATE',
        title: 'Prosecutor removed',
        caseId: caseId,
        meta: { prosecutor: caseProsecutor.user }
      }
    })

    req.flash('success', 'Prosecutor removed')
    res.redirect(`/cases/${caseId}`)
  })

}
