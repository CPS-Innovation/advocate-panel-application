const _ = require('lodash')
const { DateTime } = require('luxon')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { handlePost } = require('../helpers/form-flow')

const flow = {
  name: 'early-advice-manager-triage',
  sessionKey: 'completeEarlyAdviceManagerTriage',
  collects: {
    '': ['decision'],
    'prosecutor': ['prosecutor'],
    'reasons-for-rejection': ['rejectionReasons', 'rejectionDetails'],
    'police-response-date': ['policeResponseDate'],
    'create-reminder-task': ['createReminderTask', 'reminderDueDate'],
  },
  requires: [
    { field: 'decision' },
    { field: 'prosecutor', when: { decision: 'Accept' } },
    { field: 'rejectionReasons', when: { decision: 'Reject' } },
    { field: 'policeResponseDate', when: { decision: 'Reject' } },
    { field: 'createReminderTask', when: { decision: 'Reject' } },
    { field: 'reminderDueDate', when: { decision: 'Reject', createReminderTask: 'Yes' } },
  ]
}

module.exports = router => {

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

    res.render(`cases/tasks/${flow.name}/index`, { task })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}`, (req, res) => {
    handlePost({ req, res, flow })
  })

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

    const prosecutors = await prisma.user.findMany({
      where: {
        role: 'Prosecutor',
        units: {
          some: { unitId: task.case.unitId }
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

    res.render(`cases/tasks/${flow.name}/prosecutor`, { task, prosecutorItems })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/prosecutor`, (req, res) => {
    handlePost({ req, res, flow })
  })

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

    res.render(`cases/tasks/${flow.name}/reasons-for-rejection`, { task })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/reasons-for-rejection`, (req, res) => {
    handlePost({ req, res, flow })
  })

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

    res.render(`cases/tasks/${flow.name}/police-response-date`, { task })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/police-response-date`, (req, res) => {
    handlePost({ req, res, flow })
  })

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

    res.render(`cases/tasks/${flow.name}/create-reminder-task`, { task })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/create-reminder-task`, (req, res) => {
    handlePost({ req, res, flow })
  })

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

    const data = _.get(req, `session.data.${flow.sessionKey}`)

    const prosecutors = await prisma.user.findMany({
      where: { role: 'Prosecutor' },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    res.render(`cases/tasks/${flow.name}/check`, { task, data, prosecutors })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/check`, async (req, res) => {
    const taskId = parseInt(req.params.taskId)
    const caseId = parseInt(req.params.caseId)

    const data = _.get(req, `session.data.${flow.sessionKey}`)

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completedDate: new Date() }
    })

    const activityLogMeta = {
      task: {
        id: task.id,
        name: task.name,
        reminderType: task.reminderType
      },
      decision: data.decision
    }

    if (data.decision === 'Accept') {
      if (data.prosecutor) {
        const prosecutor = await prisma.user.findUnique({
          where: { id: parseInt(data.prosecutor) }
        })
        activityLogMeta.prosecutor = prosecutor ? {
          id: prosecutor.id,
          firstName: prosecutor.firstName,
          lastName: prosecutor.lastName
        } : null

        await prisma.caseProsecutor.create({
          data: {
            caseId: caseId,
            userId: parseInt(data.prosecutor)
          }
        })
      }
    }

    if (data.decision === 'Reject') {
      activityLogMeta.rejectionReasons = data.rejectionReasons || []
      activityLogMeta.rejectionDetails = data.rejectionDetails || {}

      if (data.policeResponseDate?.day && data.policeResponseDate?.month && data.policeResponseDate?.year) {
        activityLogMeta.policeResponseDate = DateTime.fromObject({
          day: parseInt(data.policeResponseDate.day),
          month: parseInt(data.policeResponseDate.month),
          year: parseInt(data.policeResponseDate.year)
        }).toISO()
      }

      activityLogMeta.createReminderTask = data.createReminderTask || 'No'

      if (data.createReminderTask === 'Yes' && data.reminderDueDate?.day && data.reminderDueDate?.month && data.reminderDueDate?.year) {
        activityLogMeta.reminderDueDate = DateTime.fromObject({
          day: parseInt(data.reminderDueDate.day),
          month: parseInt(data.reminderDueDate.month),
          year: parseInt(data.reminderDueDate.year)
        }).toISO()
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Task',
        recordId: task.id,
        action: 'UPDATE',
        title: 'Task completed: Early advice manager triage',
        caseId: caseId,
        meta: activityLogMeta
      }
    })

    delete req.session.data[flow.sessionKey]

    req.flash('success', 'Task completed')
    res.redirect(`/cases/${caseId}/tasks`)
  })
}
