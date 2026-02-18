const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function addCtlInfo(_case) {
  let allCtlDates = []
  _case.defendants.forEach(defendant => {
    defendant.charges.forEach(charge => {
      if (charge.custodyTimeLimit) {
        allCtlDates.push(new Date(charge.custodyTimeLimit))
      }
    })
  })

  _case.hasCTL = allCtlDates.length > 0
  _case.soonestCTL = allCtlDates.length > 0 ? new Date(Math.min(...allCtlDates)) : null
  _case.ctlCount = allCtlDates.length

  return _case
}

module.exports = router => {
  router.get("/cases/:caseId/directions/:directionId/complete", async (req, res) => {
    let _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
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
        tasks: true,
        dga: true
      },
    })

    // Add CTL information to the case
    _case = addCtlInfo(_case)

    const direction = await prisma.direction.findUnique({
      where: { id: parseInt(req.params.directionId) }
    })

    res.render("cases/directions/complete/index", { _case, direction })
  })

  router.post("/cases/:caseId/directions/:directionId/complete", async (req, res) => {
    await prisma.direction.update({
      where: { id: parseInt(req.params.directionId) },
      data: {
        completedDate: new Date()
      }
    })

    req.flash('success', 'Direction completed')
    res.redirect(`/cases/${req.params.caseId}/directions`)
  })
}
