const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {
  router.get("/cases/:caseId/tasks/:taskId/mark-as-not-urgent", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const taskId = parseInt(req.params.taskId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: true
      }
    })

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    res.render("cases/tasks/mark-as-not-urgent/index", { _case, task })
  })

  router.post("/cases/:caseId/tasks/:taskId/mark-as-not-urgent", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const taskId = parseInt(req.params.taskId)
    res.redirect(`/cases/${caseId}/tasks/${taskId}/mark-as-not-urgent/check`)
  })

  router.get("/cases/:caseId/tasks/:taskId/mark-as-not-urgent/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const taskId = parseInt(req.params.taskId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: true
      }
    })

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    res.render("cases/tasks/mark-as-not-urgent/check", { _case, task })
  })

  router.post("/cases/:caseId/tasks/:taskId/mark-as-not-urgent/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const taskId = parseInt(req.params.taskId)
    const userId = req.session.data.user.id

    const notUrgentNote = req.session.data.markAsNotUrgent.note

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        isUrgent: false,
        urgentNote: null,
        notUrgentNote
      },
      include: {
        assignedToUser: true,
        assignedToTeam: {
          include: {
            unit: true
          }
        }
      }
    })

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        userId,
        model: 'Task',
        recordId: task.id,
        action: 'UPDATE',
        title: 'Task marked as not urgent',
        caseId,
        meta: {
          task: {
            id: task.id,
            name: task.name,
            reminderType: task.reminderType
          },
          notUrgentNote,
          assignedToUser: task.assignedToUser ? {
            id: task.assignedToUser.id,
            firstName: task.assignedToUser.firstName,
            lastName: task.assignedToUser.lastName
          } : null,
          assignedToTeam: task.assignedToTeam ? {
            id: task.assignedToTeam.id,
            name: task.assignedToTeam.name,
            unit: {
              name: task.assignedToTeam.unit.name
            }
          } : null
        }
      }
    })

    // Clear session data
    req.session.data.markAsNotUrgent = null

    req.flash('success', 'Task marked as not urgent')
    res.redirect(`/cases/${caseId}/tasks/${taskId}`)
  })
}
