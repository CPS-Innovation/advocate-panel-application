const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { calculateLegacyOutcome, isFinalFailure } = require('../helpers/dgaLegacyOutcome')

module.exports = router => {

  // Step 1: Select outcome
  router.get('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const caseId = parseInt(req.params.caseId)
    const failureReasonId = parseInt(req.params.failureReasonId)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        dga: {
          include: {
            failureReasons: {
              where: { id: failureReasonId }
            }
          }
        }
      }
    })

    const failureReason = caseData.dga.failureReasons[0]

    res.render('dga-reporting/record-dispute-outcome/index', {
      case: caseData,
      failureReason: failureReason,
      selectedDisputed: req.session.data.recordOutcome?.disputed,
      monthKey,
      policeUnitId
    })
  })

  router.post('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome', (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = req.params.policeUnitId
    const caseId = req.params.caseId
    const failureReasonId = req.params.failureReasonId
    const disputed = req.body.recordOutcome?.disputed

    _.set(req, 'session.data.recordOutcome.disputed', disputed)

    if (disputed === 'No') {
      _.set(req, 'session.data.recordOutcome.cpsAccepted', null)
      _.set(req, 'session.data.recordOutcome.explanation', null)
      _.set(req, 'session.data.recordOutcome.methods', null)
      return res.redirect(`/dga-reporting/${monthKey}/${policeUnitId}/${caseId}/${failureReasonId}/record-dispute-outcome/check`)
    }

    res.redirect(`/dga-reporting/${monthKey}/${policeUnitId}/${caseId}/${failureReasonId}/record-dispute-outcome/cps-accepted`)
  })

  // Step 1b: Did CPS accept the dispute? (only if disputed)
  router.get('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/cps-accepted', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const caseId = parseInt(req.params.caseId)
    const failureReasonId = parseInt(req.params.failureReasonId)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        dga: {
          include: {
            failureReasons: {
              where: { id: failureReasonId }
            }
          }
        }
      }
    })

    const failureReason = caseData.dga.failureReasons[0]

    res.render('dga-reporting/record-dispute-outcome/cps-accepted', {
      case: caseData,
      failureReason: failureReason,
      selectedCpsAccepted: req.session.data.recordOutcome?.cpsAccepted,
      monthKey,
      policeUnitId
    })
  })

  router.post('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/cps-accepted', (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = req.params.policeUnitId
    const caseId = req.params.caseId
    const failureReasonId = req.params.failureReasonId
    const cpsAccepted = req.body.recordOutcome?.cpsAccepted

    _.set(req, 'session.data.recordOutcome.cpsAccepted', cpsAccepted)

    res.redirect(`/dga-reporting/${monthKey}/${policeUnitId}/${caseId}/${failureReasonId}/record-dispute-outcome/reason`)
  })

  // Step 2a: Add details (only if disputed)
  router.get('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/reason', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const caseId = parseInt(req.params.caseId)
    const failureReasonId = parseInt(req.params.failureReasonId)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        dga: {
          include: {
            failureReasons: {
              where: { id: failureReasonId }
            }
          }
        }
      }
    })

    const failureReason = caseData.dga.failureReasons[0]

    res.render('dga-reporting/record-dispute-outcome/reason', {
      case: caseData,
      failureReason: failureReason,
      details: req.session.data.recordOutcome?.explanation,
      monthKey,
      policeUnitId
    })
  })

  router.post('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/reason', (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = req.params.policeUnitId
    const caseId = req.params.caseId
    const failureReasonId = req.params.failureReasonId
    const details = req.body.recordOutcome?.explanation

    _.set(req, 'session.data.recordOutcome.explanation', details)

    res.redirect(`/dga-reporting/${monthKey}/${policeUnitId}/${caseId}/${failureReasonId}/record-dispute-outcome/method`)
  })

  // Step 2b: Select methods (only if disputed)
  router.get('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/method', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const caseId = parseInt(req.params.caseId)
    const failureReasonId = parseInt(req.params.failureReasonId)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        dga: {
          include: {
            failureReasons: {
              where: { id: failureReasonId }
            }
          }
        }
      }
    })

    const failureReason = caseData.dga.failureReasons[0]

    res.render('dga-reporting/record-dispute-outcome/method', {
      case: caseData,
      failureReason: failureReason,
      selectedMethods: req.session.data.recordOutcome?.methods || [],
      monthKey,
      policeUnitId
    })
  })

  router.post('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/method', (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = req.params.policeUnitId
    const caseId = req.params.caseId
    const failureReasonId = req.params.failureReasonId
    let methods = req.body.recordOutcome?.methods

    // Ensure methods is always an array
    if (!methods) {
      methods = []
    } else if (!Array.isArray(methods)) {
      methods = [methods]
    }

    // Filter out the _unchecked value added by GOV.UK Frontend
    methods = methods.filter(method => method !== '_unchecked')

    _.set(req, 'session.data.recordOutcome.methods', methods)

    res.redirect(`/dga-reporting/${monthKey}/${policeUnitId}/${caseId}/${failureReasonId}/record-dispute-outcome/check`)
  })

  // Step 3: Check answers
  router.get('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/check', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const caseId = parseInt(req.params.caseId)
    const failureReasonId = parseInt(req.params.failureReasonId)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        dga: {
          include: {
            failureReasons: true
          }
        }
      }
    })

    const failureReason = caseData.dga.failureReasons.find(fr => fr.id === failureReasonId)
    const allFailureReasons = caseData.dga.failureReasons

    let legacyOutcome = null
    if (isFinalFailure(allFailureReasons)) {
      // Build a simulated list including the current session data for the failure being recorded
      const simulatedReasons = allFailureReasons.map(fr => {
        if (fr.id === failureReasonId) {
          return {
            ...fr,
            disputed: req.session.data.recordOutcome?.disputed,
            cpsAccepted: req.session.data.recordOutcome?.cpsAccepted
          }
        }
        return fr
      })
      legacyOutcome = calculateLegacyOutcome(simulatedReasons)
    }

    res.render('dga-reporting/record-dispute-outcome/check', {
      case: caseData,
      failureReason: failureReason,
      monthKey,
      policeUnitId,
      legacyOutcome
    })
  })

  router.post('/dga-reporting/:month/:policeUnitId/:caseId/:failureReasonId/record-dispute-outcome/check', async (req, res) => {
    const monthKey = req.params.month
    const policeUnitId = parseInt(req.params.policeUnitId)
    const caseId = parseInt(req.params.caseId)
    const failureReasonId = parseInt(req.params.failureReasonId)

    const disputed = req.session.data.recordOutcome?.disputed
    const cpsAccepted = req.session.data.recordOutcome?.cpsAccepted
    const details = req.session.data.recordOutcome?.explanation
    const methods = req.session.data.recordOutcome?.methods

    // Get case data for redirect
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        policeUnit: true,
        dga: {
          include: {
            failureReasons: true
          }
        }
      }
    })

    await prisma.dGAFailureReason.update({
      where: { id: failureReasonId },
      data: {
        disputed: disputed,
        cpsAccepted: cpsAccepted,
        details: details,
        methods: methods ? methods.join(', ') : null
      }
    })

    // Get the failure reason for activity log
    const failureReason = caseData.dga.failureReasons.find(fr => fr.id === failureReasonId)

    // Calculate month name for activity log
    const [year, month] = monthKey.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    // Build meta object for activity log
    const meta = {
      failureReason: failureReason.reason,
      policeUnit: caseData.policeUnit?.name || 'Not specified',
      monthName,
      monthKey,
      policeUnitId: caseData.policeUnitId,
      ...req.session.data.recordOutcome
    }

    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'DGAFailureReason',
        recordId: failureReasonId,
        action: 'UPDATE',
        title: 'DGA outcome recorded',
        caseId: caseId,
        meta: meta
      }
    })

    delete req.session.data.recordOutcome

    req.flash('success', 'Outcome recorded')

    res.redirect(`/dga-reporting/${monthKey}/${policeUnitId}/${caseId}`)
  })

}
