const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { groupTasks } = require('../helpers/taskGrouping')
const { addTimeLimitDates } = require('../helpers/timeLimit')

module.exports = router => {
  router.get("/cases/:caseId/tasks", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
        tasks: {
          where: { completedDate: null },
          orderBy: [
            { reminderDate: 'asc' },
            { dueDate: 'asc' }
          ],
          include: {
            assignedToUser: true,
            assignedToTeam: {
              include: {
                unit: true
              }
            },
            notes: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        },
        unit: true,
        prosecutors: {
          include: {
            user: true
          }
        },
        paralegalOfficers: {
          include: {
            user: true
          }
        },
        defendants: {
          include: {
            charges: true,
            defenceLawyer: true
          }
        },
        hearings: {
          orderBy: {
            startDate: 'asc'
          },
          take: 1
        },
        location: true,
        dga: true
      },
    })

    // Add time limit dates to the case
    addTimeLimitDates(_case)

    // Add severity information to tasks (no sortBy parameter = default severity-based grouping)
    _case.tasks = groupTasks(_case.tasks)

    // Sort by severity priority
    _case.tasks.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      return new Date(a.reminderDate) - new Date(b.reminderDate)
    })

    res.render("cases/tasks/index", { _case })
  })

}