const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {
  router.get("/cases/:caseId/directions/:directionId/notes/new", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const directionId = parseInt(req.params.directionId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: true
      }
    })

    const direction = await prisma.direction.findUnique({
      where: { id: directionId }
    })

    const description = req.session.data.addDirectionNote?.description || ''

    res.render("cases/directions/notes/new/index", { _case, direction, description })
  })

  router.post("/cases/:caseId/directions/:directionId/notes/new", (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const directionId = parseInt(req.params.directionId)

    res.redirect(`/cases/${caseId}/directions/${directionId}/notes/new/check`)
  })

  router.get("/cases/:caseId/directions/:directionId/notes/new/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const directionId = parseInt(req.params.directionId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: true
      }
    })

    const direction = await prisma.direction.findUnique({
      where: { id: directionId }
    })

    const description = req.session.data.addDirectionNote?.description || ''

    res.render("cases/directions/notes/new/check", { _case, direction, description })
  })

  router.post("/cases/:caseId/directions/:directionId/notes/new/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const directionId = parseInt(req.params.directionId)
    const description = req.session.data.addDirectionNote.description
    const userId = req.session.data.user.id

    // Fetch direction details for activity log
    const direction = await prisma.direction.findUnique({
      where: { id: directionId }
    })

    // Create the direction note
    const directionNote = await prisma.directionNote.create({
      data: {
        description,
        directionId,
        userId
      }
    })

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        userId,
        model: 'DirectionNote',
        recordId: directionNote.id,
        action: 'CREATE',
        title: 'Direction note added',
        caseId,
        meta: {
          direction: {
            id: direction.id,
            description: direction.description
          },
          description: description
        }
      }
    })

    delete req.session.data.addDirectionNote

    req.flash('success', 'Note added')
    res.redirect(`/cases/${caseId}/directions/${directionId}`)
  })
}
