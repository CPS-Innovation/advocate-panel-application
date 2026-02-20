const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {
  
  router.get("/cases/:caseId/witnesses/:witnessId/mark-as-required-to-attend-court", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: { defendants: true, witnesses: true },
    })

    const witness = await prisma.witness.findUnique({
      where: { id: parseInt(req.params.witnessId )}
    })


    res.render("cases/witnesses/mark-as-required-to-attend-court/index", { 
      _case,
      witness
    })
  })

  router.post("/cases/:caseId/witnesses/:witnessId/mark-as-required-to-attend-court", async (req, res) => {
    let witness = await prisma.witness.update({
      where: { id: parseInt(req.params.witnessId) },
      data: {
        isAppearingInCourt: true
      }
    })

    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Witness',
        recordId: witness.id,
        action: 'UPDATE',
        title: 'Witness marked as required to attend court',
        caseId: parseInt(req.params.caseId),
        meta: { witness }
      }
    })

    // req.flash('success', `Witness marked as attending court (${witness.firstName} ${witness.lastName})`)
    // res.redirect(`/cases/${req.params.caseId}/witnesses`)

    req.flash('success', 'Witness marked as required to attend court')
    res.redirect(`/cases/${req.params.caseId}/witnesses/${req.params.witnessId}`)

  })

}