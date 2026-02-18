const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { addTimeLimitDates } = require('../helpers/timeLimit')

module.exports = router => {
  router.get("/cases/:caseId/witnesses", async (req, res) => {
    let _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
      include: {
        witnesses: { include: { statements: true }, orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] },
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
            charges: true
          }
        },
        location: true,
        tasks: true,
        dga: true
      }
    })

    _case = addTimeLimitDates(_case)

    _case.witnesses = _case.witnesses.map(witness => ({
      ...witness,
      hasSection9Statement: witness.statements.some(s => s.isMarkedAsSection9 === true)
    }))

    res.render("cases/witnesses/index", { _case })
  })

}