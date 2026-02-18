const _ = require('lodash')
const { DateTime } = require('luxon')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getAreaForUnit, getAllAreas, getUnitsForArea } = require('../helpers/unitAreaMapping')
const { handlePost } = require('../helpers/form-flow')

const flow = {
  name: 'priority-pcd-review',
  sessionKey: 'completePriorityPcdReview',
  collects: {
    '': ['decision'],
    'case-type': ['caseType'],
    'nfs-reasons': ['nfsReasons', 'rejectionDetails'],
    'priority-reasons': ['priorityReason', 'rejectionDetails'],
    'cpsd': ['cpsd'],
    'transfer-case': ['transferCase'],
    'area': ['changeArea', 'area'],
    'unit': ['unit'],
    'action-plan-date': ['policeResponseDate'],
  },
  requires: [
    { field: 'decision' },
    { field: 'caseType' },
    { field: 'nfsReasons', when: { decision: 'NFS non-compliant' } },
    { field: 'priorityReason', when: { decision: 'Priority / Red rejection' } },
    { field: 'cpsd' },
    { field: 'transferCase', when: { decision: 'NFS compliant', cpsd: 'No' } },
    { field: 'changeArea', when: { decision: 'NFS compliant', cpsd: 'No', transferCase: 'Yes' } },
    { field: 'unit', when: { decision: 'NFS compliant', cpsd: 'No', transferCase: 'Yes' } },
    { field: 'policeResponseDate', when: { decision: { either: ['NFS non-compliant', 'Priority / Red rejection'] } } },
  ]
}

module.exports = router => {

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/case-type`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/nfs-reasons`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/priority-reasons`, (req, res) => {
    handlePost({ req, res, flow })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/cpsd`, (req, res) => {
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

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/action-plan-date`, (req, res) => {
    handlePost({ req, res, flow })
  })

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

    res.render("cases/tasks/priority-pcd-review/index", { task })
  })

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

    res.render("cases/tasks/priority-pcd-review/case-type", { task })
  })

  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/nfs-reasons`, async (req, res) => {
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

    res.render("cases/tasks/priority-pcd-review/nfs-reasons", { task })
  })

  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/priority-reasons`, async (req, res) => {
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

    res.render("cases/tasks/priority-pcd-review/priority-reasons", { task })
  })

  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/cpsd`, async (req, res) => {
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

    res.render("cases/tasks/priority-pcd-review/cpsd", { task })
  })

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

    res.render("cases/tasks/priority-pcd-review/transfer-case", { task })
  })

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

    const data = _.get(req, 'session.data.completePriorityPcdReview')

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

    res.render("cases/tasks/priority-pcd-review/area", { task, areaItems, area: currentAreaName })
  })

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

    const data = _.get(req, 'session.data.completePriorityPcdReview')

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

    res.render("cases/tasks/priority-pcd-review/unit", { task, unitItems })
  })

  router.get(`/cases/:caseId/tasks/:taskId/${flow.name}/action-plan-date`, async (req, res) => {
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

    res.render("cases/tasks/priority-pcd-review/action-plan-date", { task })
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

    const data = _.get(req, 'session.data.completePriorityPcdReview')

    // Load additional data needed for display on check answers
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    })

    res.render("cases/tasks/priority-pcd-review/check", { task, data, units })
  })

  router.post(`/cases/:caseId/tasks/:taskId/${flow.name}/check`, async (req, res) => {
    const taskId = parseInt(req.params.taskId)
    const caseId = parseInt(req.params.caseId)

    const data = _.get(req, 'session.data.completePriorityPcdReview')

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

    // Build activity log meta
    const activityLogMeta = {
      task: {
        id: task.id,
        name: task.name,
        reminderType: task.reminderType
      },
      decision: data.decision,
      caseType: data.caseType,
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

    // Add NFS non-compliant reasons if applicable
    if (data.decision === "NFS non-compliant" && data.nfsReasons) {
      activityLogMeta.nfsReasons = data.nfsReasons
    }

    // Add Priority rejection reason if applicable
    if (data.decision === "Priority / Red rejection" && data.priorityReason) {
      activityLogMeta.priorityReason = data.priorityReason
    }

    // Add rejection details if they exist
    if (data.rejectionDetails) {
      activityLogMeta.rejectionDetails = data.rejectionDetails
    }

    // Add CPSD answer
    if (data.cpsd) {
      activityLogMeta.cpsd = data.cpsd
    }

    // Add transfer data if applicable
    if (data.cpsd === "No" && data.transferCase) {
      activityLogMeta.transferCase = data.transferCase

      if (data.transferCase === "Yes") {
        if (data.changeArea) {
          activityLogMeta.changeArea = data.changeArea
        }
        if (data.area) {
          activityLogMeta.area = data.area
        }
        if (data.unit) {
          // Resolve unit name
          const unit = await prisma.unit.findUnique({
            where: { id: parseInt(data.unit) }
          })
          activityLogMeta.unit = unit ? { id: unit.id, name: unit.name } : null
        }
      }
    }

    // Add police response date if applicable
    if ((data.decision === "NFS non-compliant" || data.decision === "Priority / Red rejection") &&
        data.policeResponseDate?.day && data.policeResponseDate?.month && data.policeResponseDate?.year) {
      activityLogMeta.policeResponseDate = DateTime.fromObject({
        day: parseInt(data.policeResponseDate.day),
        month: parseInt(data.policeResponseDate.month),
        year: parseInt(data.policeResponseDate.year)
      }).toISO()
    }

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Task',
        recordId: task.id,
        action: 'UPDATE',
        title: 'Task completed: Priority PCD review',
        caseId: caseId,
        meta: activityLogMeta
      }
    })

    delete req.session.data.completePriorityPcdReview

    req.flash('success', 'Task completed')
    res.redirect(`/cases/${caseId}/tasks`)
  })
}
