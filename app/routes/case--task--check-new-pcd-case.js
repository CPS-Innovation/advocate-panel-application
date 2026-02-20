const _ = require('lodash')
const { DateTime } = require('luxon')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getAreaForUnit, getAllAreas, getUnitsForArea } = require('../helpers/unitAreaMapping')
const { handlePost } = require('../helpers/form-flow')

const flow = {
  name: 'check-new-pcd-case',
  sessionKey: 'completeCheckNewPcdCase',
  collects: {
    '': ['decision'],
    'reasons-for-rejection': ['rejectionReasons', 'rejectionDetails'],
    'review-task-type': ['reviewTaskType'],
    'case-type': ['caseType'],
    'transfer-case': ['transferCase'],
    'area': ['changeArea', 'area'],
    'unit': ['unitId'],
    'task-owner': ['taskOwner'],
    'prosecutor': ['prosecutorId'],
    'police-response-date': ['policeResponseDate'],
    'create-reminder-task': ['createReminderTask', 'reminderDueDate'],
  },
  requires: [
    { field: 'decision' },
    { field: 'rejectionReasons', when: { decision: 'Reject' } },
    { field: 'reviewTaskType' },
    { field: 'caseType' },
    { field: 'transferCase', when: { decision: 'Accept' } },
    { field: 'changeArea', when: { decision: 'Accept', transferCase: 'Yes' } },
    { field: 'unitId', when: { decision: 'Accept', transferCase: 'Yes' } },
    { field: 'taskOwner', when: { decision: 'Accept', reviewTaskType: 'Early advice', caseType: 'RASSO' } },
    { field: 'prosecutorId', when: { decision: 'Accept', reviewTaskType: 'Early advice', caseType: { not: 'RASSO' } } },
    { field: 'policeResponseDate', when: { decision: 'Reject' } },
    { field: 'createReminderTask', when: { decision: 'Reject' } },
    { field: 'reminderDueDate', when: { decision: 'Reject', createReminderTask: 'Yes' } },
  ]
}

module.exports = router => {

  // POST handlers for form steps
  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/reasons-for-rejection`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/review-task-type`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/case-type`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/transfer-case`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/area`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/unit`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/task-owner`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/prosecutor`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/police-response-date`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/create-reminder-task`, (req, res) => {
    handlePost({ req, res, flow })
  })

  // GET: Decision (index page)
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/index", { task })
  })

  // GET: Review task type
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/review-task-type`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/review-task-type", { task })
  })

  // GET: Transfer case
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/transfer-case`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true,
            unit: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/transfer-case", { task })
  })

  // GET: Area
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/area`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true,
            unit: true
          }
        }
      }
    })

    const data = _.get(req, 'session.data.completeCheckNewPcdCase')

    // Fetch all areas from database
    const areas = await getAllAreas(prisma)

    // Get current area for the case's unit
    const currentAreaName = await getAreaForUnit(prisma, task.case.unitId)

    // Format areas for select component
    const areaItems = areas.map(area => ({
      value: area.name,
      text: area.name,
      selected: area.name === data.area
    }))

    res.render("cases/tasks/check-new-pcd-case/area", { task, areaItems, area: currentAreaName })
  })

  // GET: Unit
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/unit`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true,
            unit: true
          }
        }
      }
    })

    const data = _.get(req, 'session.data.completeCheckNewPcdCase')

    // Determine which area to use for filtering
    let areaToFilterBy
    if (data.changeArea === "Yes" && data.area) {
      // User changed the area - use the selected area
      areaToFilterBy = data.area
    } else {
      // User didn't change the area - use the current case's unit's area
      areaToFilterBy = await getAreaForUnit(prisma, task.case.unitId)
    }

    // Get units filtered by area
    const units = await getUnitsForArea(prisma, areaToFilterBy)

    const unitItems = units.map(unit => ({
      value: unit.id,
      text: unit.name
    }))

    res.render("cases/tasks/check-new-pcd-case/unit", { task, unitItems })
  })

  // GET: Case type
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/case-type`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/case-type", { task })
  })

  // GET: Task owner
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/task-owner`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    const data = _.get(req, 'session.data.completeCheckNewPcdCase')

    // Determine unit ID to filter by
    const unitId = data.transferCase === "Yes" && data.unitId
      ? parseInt(data.unitId)
      : task.case.unitId

    // Fetch users
    const users = await prisma.user.findMany({
      where: {
        units: {
          some: { unitId: unitId }
        }
      },
      include: {
        units: {
          include: { unit: true }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Fetch teams
    const teams = await prisma.team.findMany({
      where: { unitId: unitId },
      include: {
        unit: true
      },
      orderBy: { name: 'asc' }
    })

    // Transform users to items (includes role in parentheses)
    const userItems = users.map(user => ({
      value: `user-${user.id}`,
      text: `${user.firstName} ${user.lastName} (${user.role})`
    }))

    // Transform teams to items
    const teamItems = teams.map(team => ({
      value: `team-${team.id}`,
      text: `${team.name}`
    }))

    // Combine: individuals first, then teams
    const ownerItems = [...userItems, ...teamItems]

    res.render("cases/tasks/check-new-pcd-case/task-owner", { task, ownerItems })
  })

  // GET: Prosecutor
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/prosecutor`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    const data = _.get(req, 'session.data.completeCheckNewPcdCase')

    // Determine unit ID to filter by
    const unitId = data.transferCase === "Yes" && data.unitId
      ? parseInt(data.unitId)
      : task.case.unitId

    const prosecutors = await prisma.user.findMany({
      where: {
        role: 'Prosecutor',
        units: {
          some: { unitId: unitId }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    const prosecutorItems = prosecutors.map(prosecutor => ({
      value: prosecutor.id,
      text: `${prosecutor.firstName} ${prosecutor.lastName}`
    }))

    res.render("cases/tasks/check-new-pcd-case/prosecutor", { task, prosecutorItems })
  })

  // GET: Reasons for rejection
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/reasons-for-rejection`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/reasons-for-rejection", { task })
  })

  // GET: Police response date
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/police-response-date`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/police-response-date", { task })
  })

  // GET: Create reminder task
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/create-reminder-task`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true
          }
        }
      }
    })

    res.render("cases/tasks/check-new-pcd-case/create-reminder-task", { task })
  })

  // GET: Check answers
  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/check`, async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.taskId) },
      include: {
        case: {
          include: {
            defendants: true,
            unit: true
          }
        }
      }
    })

    const data = _.get(req, 'session.data.completeCheckNewPcdCase')

    // Load additional data needed for accept flow display on check answers
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    })

    const users = await prisma.user.findMany({
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    const teams = await prisma.team.findMany({
      include: {
        unit: true
      },
      orderBy: { name: 'asc' }
    })

    const prosecutors = await prisma.user.findMany({
      where: { role: 'Prosecutor' },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    res.render("cases/tasks/check-new-pcd-case/check", { task, data, units, users, teams, prosecutors })
  })

  // POST: Check answers - completion handler
  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/check`, async (req, res) => {
    const taskId = parseInt(req.params.taskId)
    const caseId = parseInt(req.params.caseId)

    const data = _.get(req, 'session.data.completeCheckNewPcdCase')

    // Update task as completed
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

    // Build activity log meta with conditional rejection data
    const activityLogMeta = {
      task: {
        id: task.id,
        name: task.name,
        reminderType: task.reminderType
      },
      decision: data.decision,
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

    // Add accept-specific data if decision was Accept
    if (data.decision === 'Accept') {
      if (data.reviewTaskType) {
        activityLogMeta.reviewTaskType = data.reviewTaskType
      }
      if (data.transferCase) {
        activityLogMeta.transferCase = data.transferCase
      }
      if (data.changeArea) {
        activityLogMeta.changeArea = data.changeArea
      }
      if (data.area) {
        activityLogMeta.area = data.area
      }
      if (data.unitId) {
        // Resolve unit name
        const unit = await prisma.unit.findUnique({
          where: { id: parseInt(data.unitId) }
        })
        activityLogMeta.unit = unit ? { id: unit.id, name: unit.name } : null
      }
      if (data.caseType) {
        activityLogMeta.caseType = data.caseType
      }
      if (data.taskOwner) {
        // Resolve task owner name (user or team)
        if (data.taskOwner.startsWith('user-')) {
          const userId = parseInt(data.taskOwner.replace('user-', ''))
          const user = await prisma.user.findUnique({
            where: { id: userId }
          })
          activityLogMeta.taskOwner = user ? {
            type: 'user',
            id: user.id,
            name: `${user.firstName} ${user.lastName}`
          } : null
        } else if (data.taskOwner.startsWith('team-')) {
          const teamId = parseInt(data.taskOwner.replace('team-', ''))
          const team = await prisma.team.findUnique({
            where: { id: teamId }
          })
          activityLogMeta.taskOwner = team ? {
            type: 'team',
            id: team.id,
            name: team.name
          } : null
        }
      }
      if (data.prosecutorId) {
        // Resolve prosecutor name
        const prosecutor = await prisma.user.findUnique({
          where: { id: parseInt(data.prosecutorId) }
        })
        activityLogMeta.prosecutor = prosecutor ? {
          id: prosecutor.id,
          firstName: prosecutor.firstName,
          lastName: prosecutor.lastName
        } : null
      }
    }

    // Add rejection-specific data if decision was Reject
    if (data.decision === 'Reject') {
      activityLogMeta.rejectionReasons = data.rejectionReasons || []
      activityLogMeta.rejectionDetails = data.rejectionDetails || {}

      // Convert police response date to ISO string if exists
      if (data.policeResponseDate?.day && data.policeResponseDate?.month && data.policeResponseDate?.year) {
        activityLogMeta.policeResponseDate = DateTime.fromObject({
          day: data.policeResponseDate.day,
          month: data.policeResponseDate.month,
          year: data.policeResponseDate.year
        }).toISO()
      }

      activityLogMeta.createReminderTask = data.createReminderTask || 'No'

      // Convert reminder due date to ISO string if exists
      if (data.createReminderTask === 'Yes' && data.reminderDueDate?.day && data.reminderDueDate?.month && data.reminderDueDate?.year) {
        activityLogMeta.reminderDueDate = DateTime.fromObject({
          day: data.reminderDueDate.day,
          month: data.reminderDueDate.month,
          year: data.reminderDueDate.year
        }).toISO()
      }

      // Add case type for reject flow
      if (data.caseType) {
        activityLogMeta.caseType = data.caseType
      }
    }

    // Create activity log entry with decision
    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Task',
        recordId: task.id,
        action: 'UPDATE',
        title: 'Task completed: Check New PCD case',
        caseId: caseId,
        meta: activityLogMeta
      }
    })

    delete req.session.data.completeCheckNewPcdCase

    req.flash('success', 'Task completed')
    res.redirect(`/cases/${caseId}/tasks`)
  })
}
