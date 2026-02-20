const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {

  router.get("/cases/:caseId/paralegal-officers/:caseParalegalOfficerId/remove", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const caseParalegalOfficerId = parseInt(req.params.caseParalegalOfficerId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId }
    })

    const caseParalegalOfficer = await prisma.caseParalegalOfficer.findUnique({
      where: { id: caseParalegalOfficerId },
      include: { user: true }
    })

    res.render("cases/paralegal-officers/remove/index", { _case, caseParalegalOfficer })
  })

  router.post("/cases/:caseId/paralegal-officers/:caseParalegalOfficerId/remove", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const caseParalegalOfficerId = parseInt(req.params.caseParalegalOfficerId)

    const caseParalegalOfficer = await prisma.caseParalegalOfficer.findUnique({
      where: { id: caseParalegalOfficerId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } }
    })

    await prisma.caseParalegalOfficer.delete({
      where: { id: caseParalegalOfficerId }
    })

    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Case',
        recordId: caseId,
        action: 'UPDATE',
        title: 'Paralegal officer removed',
        caseId: caseId,
        meta: { paralegalOfficer: caseParalegalOfficer.user }
      }
    })

    req.flash('success', 'Paralegal officer removed')
    res.redirect(`/cases/${caseId}`)
  })

}
