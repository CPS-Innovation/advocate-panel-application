const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {
  router.get("/cases/:caseId/tasks/:taskId/complete", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
        defendants: true
      }
    })

    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) }
    })

    res.render("cases/tasks/complete/index", { _case, task })
  })

  router.post("/cases/:caseId/tasks/:taskId/complete", async (req, res) => {
    const taskId = parseInt(req.params.taskId)
    const caseId = parseInt(req.params.caseId)

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completedDate: new Date() },
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
        userId: req.session.data.user.id,
        model: 'Task',
        recordId: task.id,
        action: 'UPDATE',
        title: 'Task completed',
        caseId: caseId,
        meta: {
          task: {
            id: task.id,
            name: task.name,
            reminderType: task.reminderType
          },
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

    req.flash('success', 'Task completed')
    res.redirect(`/cases/${caseId}/tasks`)
  })
}
