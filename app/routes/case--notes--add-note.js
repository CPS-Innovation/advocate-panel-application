const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { addTimeLimitDates } = require('../helpers/timeLimit')

module.exports = router => {

  router.get("/cases/:caseId/notes/new", async (req, res) => {
    let _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
        defendants: {
          include: {
            charges: true
          }
        },
        witnesses: true
      }
    })

    _case = addTimeLimitDates(_case)

    res.render("cases/notes/new/index", { _case })
  })

  router.post("/cases/:caseId/notes/new", (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/notes/new/check`)
  })

  router.get("/cases/:caseId/notes/new/check", async (req, res) => {
    let _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
        defendants: {
          include: {
            charges: true
          }
        },
        witnesses: true
      }
    })

    _case = addTimeLimitDates(_case)

    const content = req.session.data.addNote?.content || ''

    res.render("cases/notes/new/check", { _case, content })
  })

  router.post("/cases/:caseId/notes/new/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const content = req.session.data.addNote.content
    const userId = req.session.data.user.id

    const note = await prisma.note.create({
      data: {
        content,
        caseId,
        userId
      }
    })

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        userId,
        model: 'Note',
        recordId: note.id,
        action: 'CREATE',
        title: 'Case note added',
        caseId,
        meta: {
          content: content
        }
      }
    })

    delete req.session.data.addNote

    req.flash('success', 'Note added')
    res.redirect(`/cases/${caseId}/notes`)
  })

}
