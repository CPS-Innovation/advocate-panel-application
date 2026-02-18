const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const flash = require('connect-flash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const checkSignedIn = require('./middleware/checkSignedIn')
const setLocals = require('./middleware/setLocals')

router.use(flash())
router.use(setLocals)

require('./routes/home')(router)
require('./routes/static')(router)
require('./routes/account')(router)
require('./routes/clear-data')(router)

router.use(checkSignedIn)

require('./routes/overview')(router)
require('./routes/activity')(router)
require('./routes/tasks')(router)
require('./routes/directions')(router)
require('./routes/prosecutors')(router)
require('./routes/prosecutors--add-specialist-area')(router)
require('./routes/paralegal-officers')(router)

// DGA reporting routes
require('./routes/dga-reporting--export')(router)
require('./routes/dga-reporting')(router)
require('./routes/dga-reporting--record-dispute-outcome')(router)

// Record recent case views
router.get('/cases/:caseId*', async (req, res, next) => {
  const caseId = parseInt(req.params.caseId)
  const userId = req.session.data.user.id
  if (caseId && userId) {
    await prisma.recentCase.upsert({
      where: { userId_caseId: { userId, caseId } },
      update: { openedAt: new Date() },
      create: { userId, caseId }
    })
  }
  next()
})

// Case routes
require('./routes/cases')(router)
require('./routes/case--add-prosecutor')(router)
require('./routes/case--add-paralegal-officer')(router)
require('./routes/case--overview')(router)
require('./routes/case--notes--add-note')(router)
require('./routes/case--notes')(router)
require('./routes/case--activity')(router)
require('./routes/case--tasks')(router)
require('./routes/case--directions')(router)
require('./routes/case--task--new')(router)
require('./routes/case--task')(router)
require('./routes/case--task--check-new-pcd-case')(router)
require('./routes/case--task--early-advice-manager-triage')(router)
require('./routes/case--task--priority-pcd-review')(router)
require('./routes/case--task--complete')(router)
require('./routes/case--task--mark-as-urgent')(router)
require('./routes/case--task--mark-as-not-urgent')(router)
require('./routes/case--task--notes')(router)
require('./routes/case--direction')(router)
require('./routes/case--direction--notes')(router)
require('./routes/case--direction--complete')(router)
require('./routes/case--documents')(router)
require('./routes/case--witnesses')(router)
require('./routes/case--witness')(router)
require('./routes/case--defendants')(router)
require('./routes/case--witness--mark-as-required-to-attend-court')(router)
require('./routes/case--witness--mark-as-not-required-to-attend-court')(router)
require('./routes/case--witness-statement--mark-as-section9')(router)
require('./routes/case--witness-statement--unmark-as-section9')(router)
