const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { addTimeLimitDates } = require('../helpers/timeLimit')

module.exports = router => {

  router.get("/cases/:caseId/notes", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    // Fetch case
    let _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: {
          include: {
            charges: true
          }
        },
        witnesses: true
      }
    })

    // Add time limit info
    _case = addTimeLimitDates(_case)

    // Fetch notes
    let notes = await prisma.note.findMany({
      where: { caseId: caseId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })

    // Search by note content
    let keywords = _.get(req.session.data.noteSearch, 'keywords')

    if(keywords) {
      keywords = keywords.toLowerCase()
      notes = notes.filter(note => {
        let noteContent = note.content.toLowerCase()
        return noteContent.indexOf(keywords) > -1
      })
    }

    // Attach notes to _case for template
    _case.notes = notes

    res.render("cases/notes/index", {
      _case
    })
  })

  router.get('/cases/:caseId/notes/clear-search', (req, res) => {
    _.set(req, 'session.data.noteSearch.keywords', '')
    res.redirect(`/cases/${req.params.caseId}/notes`)
  })

  router.get("/cases/:caseId/notes/:noteId", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: { defendants: true, witnesses: true }
    })

    const note = await prisma.note.findUnique({
      where: { id: parseInt(req.params.noteId) },
      include: { user: true }
    })

    res.render("cases/notes/show", {
      _case,
      note
    })
  })

}
