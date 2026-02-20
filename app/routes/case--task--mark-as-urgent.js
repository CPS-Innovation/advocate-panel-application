const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {
  router.get("/cases/:caseId/tasks/:taskId/mark-as-urgent", async (req, res) => {
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

    res.render("cases/tasks/mark-as-urgent/index", { _case, task })
  })

  router.post("/cases/:caseId/tasks/:taskId/mark-as-urgent", async (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/tasks/${req.params.taskId}/mark-as-urgent/check`)
  })

  router.get("/cases/:caseId/tasks/:taskId/mark-as-urgent/check", async (req, res) => {
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

    res.render("cases/tasks/mark-as-urgent/check", { _case, task })
  })

  router.post("/cases/:caseId/tasks/:taskId/mark-as-urgent/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const taskId = parseInt(req.params.taskId)
    const userId = req.session.data.user.id

    const urgentNote = req.session.data.markAsUrgent.note

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        isUrgent: true,
        urgentNote,
        notUrgentNote: null
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
        title: 'Task marked as urgent',
        caseId,
        meta: {
          task: {
            id: task.id,
            name: task.name,
            reminderType: task.reminderType
          },
          urgentNote,
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


    delete req.session.data.markAsUrgent


    req.flash('success', 'Task marked as urgent')
    res.redirect(`/cases/${caseId}/tasks/${taskId}`)
  })
}
