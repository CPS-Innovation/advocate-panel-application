const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash')
const { DateTime } = require('luxon')

module.exports = router => {
  // Step 1: Task description (GET)
  router.get("/cases/:caseId/tasks/new", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: {
          include: { charges: true }
        }
      }
    })

    res.render("cases/tasks/new/index", { _case })
  })

  // Step 1: Task description (POST)
  router.post("/cases/:caseId/tasks/new", (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/tasks/new/asset-recovery`)
  })

  // Step 2: Asset recovery (GET)
  router.get("/cases/:caseId/tasks/new/asset-recovery", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: {
          include: { charges: true }
        }
      }
    })

    res.render("cases/tasks/new/asset-recovery", { _case })
  })

  // Step 2: Asset recovery (POST)
  router.post("/cases/:caseId/tasks/new/asset-recovery", (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/tasks/new/dates`)
  })

  // Step 3: Dates (GET)
  router.get("/cases/:caseId/tasks/new/dates", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: {
          include: { charges: true }
        }
      }
    })

    res.render("cases/tasks/new/dates", { _case })
  })

  // Step 3: Dates (POST)
  router.post("/cases/:caseId/tasks/new/dates", (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/tasks/new/owner`)
  })

  // Step 4: Owner (GET)
  router.get("/cases/:caseId/tasks/new/owner", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: {
          include: { charges: true }
        },
        unit: true
      }
    })

    const currentUser = req.session.data.user

    const users = await prisma.user.findMany({
      where: {
        units: {
          some: { unitId: _case.unitId }
        }
      }
    })

    const teams = await prisma.team.findMany({
      where: { unitId: _case.unitId },
      include: { unit: true }
    })

    // Build mixed owner list
    let ownerItems = []

    // Add users with "user-{id}" prefix
    users.forEach(user => {
      if (currentUser && user.id === currentUser.id) {
        ownerItems.push({
          text: `${user.firstName} ${user.lastName} (you)`,
          value: `user-${user.id}`
        })
      } else {
        ownerItems.push({
          text: `${user.firstName} ${user.lastName}`,
          value: `user-${user.id}`
        })
      }
    })

    // Add teams with "team-{id}" prefix
    teams.forEach(team => {
      ownerItems.push({
        text: `${team.name} (${team.unit.name})`,
        value: `team-${team.id}`
      })
    })

    // Sort: current user "(you)" first
    ownerItems.sort((a, b) => {
      if (a.text.includes('(you)')) return -1
      if (b.text.includes('(you)')) return 1
      return 0
    })

    res.render("cases/tasks/new/owner", { _case, ownerItems })
  })

  // Step 4: Owner (POST)
  router.post("/cases/:caseId/tasks/new/owner", (req, res) => {
    const caseId = parseInt(req.params.caseId)
    res.redirect(`/cases/${caseId}/tasks/new/check`)
  })

  // Step 5: Check answers (GET)
  router.get("/cases/:caseId/tasks/new/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        defendants: {
          include: { charges: true }
        }
      }
    })

    // Fetch owner display name
    const ownerValue = req.session.data.addTask.owner
    let ownerDisplayName = ''

    if (ownerValue.startsWith('user-')) {
      const userId = parseInt(ownerValue.replace('user-', ''))
      const user = await prisma.user.findUnique({ where: { id: userId } })
      ownerDisplayName = `${user.firstName} ${user.lastName}`
    } else if (ownerValue.startsWith('team-')) {
      const teamId = parseInt(ownerValue.replace('team-', ''))
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { unit: true }
      })
      ownerDisplayName = `${team.name} (${team.unit.name})`
    }

    res.render("cases/tasks/new/check", { _case, ownerDisplayName })
  })

  // Step 5: Check answers (POST) - Create task
  router.post("/cases/:caseId/tasks/new/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const userId = req.session.data.user.id

    // Parse owner value
    const ownerValue = req.session.data.addTask.owner
    let assignedToUserId = null
    let assignedToTeamId = null

    if (ownerValue.startsWith('user-')) {
      assignedToUserId = parseInt(ownerValue.replace('user-', ''))
    } else if (ownerValue.startsWith('team-')) {
      assignedToTeamId = parseInt(ownerValue.replace('team-', ''))
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        name: req.session.data.addTask.description,
        reminderType: req.session.data.addTask.isAssetRecovery === 'yes' ? 'Asset recovery' : null,
        reminderDate: DateTime.fromObject({
          day: req.session.data.addTask.reminderDate.day,
          month: req.session.data.addTask.reminderDate.month,
          year: req.session.data.addTask.reminderDate.year
        }).toISO(),
        dueDate: DateTime.fromObject({
          day: req.session.data.addTask.dueDate.day,
          month: req.session.data.addTask.dueDate.month,
          year: req.session.data.addTask.dueDate.year
        }).toISO(),
        escalationDate: DateTime.fromObject({
          day: req.session.data.addTask.escalationDate.day,
          month: req.session.data.addTask.escalationDate.month,
          year: req.session.data.addTask.escalationDate.year
        }).toISO(),
        caseId: caseId,
        assignedToUserId,
        assignedToTeamId,
        isUrgent: false
      },
      include: {
        assignedToUser: true,
        assignedToTeam: { include: { unit: true } }
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        model: 'Task',
        recordId: task.id,
        action: 'CREATE',
        title: 'Task added',
        caseId,
        meta: {
          task: { id: task.id, name: task.name },
          assignedToUser: task.assignedToUser ? {
            id: task.assignedToUser.id,
            firstName: task.assignedToUser.firstName,
            lastName: task.assignedToUser.lastName
          } : null,
          assignedToTeam: task.assignedToTeam ? {
            id: task.assignedToTeam.id,
            name: task.assignedToTeam.name,
            unit: { name: task.assignedToTeam.unit.name }
          } : null
        }
      }
    })

    // Clear session data
    delete req.session.data.addTask

    // Flash message and redirect
    req.flash('success', 'Reminder added')
    res.redirect(`/cases/${caseId}/tasks/${task.id}`)
  })
}
