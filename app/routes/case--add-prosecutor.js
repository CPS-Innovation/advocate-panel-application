const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function getProsecutorHintText(prosecutor) {
  total = prosecutor._count.caseProsecutors
  let hintParts = []

  if(prosecutor.didInitialReview) {
    hintParts.push(
      `<li>Initial review prosecutor</li>`
    )
  }


  if (prosecutor.specialistAreas.length) {
    hintParts.push(
      `<li>${prosecutor.specialistAreas.map(a => a.name).join(", ")}</li>`
    )
  }

  let caseLoadBreakdown = ''
  if (total === 0) {
    caseLoadBreakdown = "No cases"
  } else {
    if (prosecutor.ctlCases && prosecutor.ctlCases.length > 0) {
      hintParts.push(`<li>${total} case${total > 1 ? "s" : ""}</li>`)
    }

    // Collect only levels that have > 0
    let breakdown = []

    if (prosecutor.ctlCases && prosecutor.ctlCases.length > 0) {
      breakdown.push(`${prosecutor.ctlCases.length} CTL`)
    }

    if (prosecutor.stlCases && prosecutor.stlCases.length > 0) {
      breakdown.push(`${prosecutor.stlCases.length} STL`)
    }

    if (prosecutor.basicCases && prosecutor.basicCases.length > 0) {
      breakdown.push(`${prosecutor.basicCases.length} basic`)
    }
    if (prosecutor.basicPlusCases && prosecutor.basicPlusCases.length > 0) {
      breakdown.push(`${prosecutor.basicPlusCases.length} basic plus`)
    }
    if (prosecutor.standardCases && prosecutor.standardCases.length > 0) {
      breakdown.push(`${prosecutor.standardCases.length} standard`)
    }
    if (prosecutor.highCases && prosecutor.highCases.length > 0) {
      breakdown.push(`${prosecutor.highCases.length} high`)
    }
    if (prosecutor.complexCases && prosecutor.complexCases.length > 0) {
      breakdown.push(`${prosecutor.complexCases.length} complex`)
    }

    if (breakdown.length) {
      caseLoadBreakdown += `${breakdown.join(", ")}`
    }

  }

  hintParts.push(`<li>${caseLoadBreakdown}</li>`)

  return `<ul class="govuk-list govuk-list--bullet govuk-hint govuk-!-margin-bottom-0">${hintParts.join("")}</ul>`
}

async function getRecommendedProsecutor() {
  let prosecutor = await prisma.user.findFirst({
    where: {
      role: 'Prosecutor',
      firstName: 'Michael',
      lastName: 'Chen'
    },
    select: { id: true, firstName: true, lastName: true }
  })

  if (!prosecutor) {
    prosecutor = await prisma.user.findFirst({
      where: { role: 'Prosecutor' },
      select: { id: true, firstName: true, lastName: true }
    })
  }

  return prosecutor
}

async function getProsecutorListData() {
  let prosecutors = await prisma.user.findMany({
    where: {
      role: 'Prosecutor'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      units: {
        include: {
          unit: true
        }
      },
      specialistAreas: true,
      preferredAreas: true,
      restrictedAreas: true,
      _count: {
        select: {
          caseProsecutors: true
        }
      },
      caseProsecutors: {
        include: {
          case: {
            select: {
              id: true,
              complexity: true,
              defendants: {
                select: {
                  charges: {
                    select: {
                      custodyTimeLimit: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  prosecutors = prosecutors.map((prosecutor, index) => {
    if (prosecutor.firstName === 'Michael' && prosecutor.lastName === 'Chen') {
      return {
        ...prosecutor,
        _count: { caseProsecutors: 10 },
        basicCases: Array(3).fill({}),
        basicPlusCases: Array(3).fill({}),
        standardCases: Array(2).fill({}),
        highCases: Array(1).fill({}),
        complexCases: Array(1).fill({}),
        ctlCases: Array(2).fill({}),
        stlCases: Array(2).fill({}),
        totalCases: 10,
        ctlCaseCount: 2,
        stlCaseCount: 2
      }
    }

    const cases = prosecutor.caseProsecutors?.map(cp => cp.case) || []

    const ctlCases = cases.filter(c => {
      return c.defendants.some(d => d.charges.some(ch => ch.custodyTimeLimit !== null))
    })

    const basicCases = cases.filter(c => c.complexity === "Basic")
    const basicPlusCases = cases.filter(c => c.complexity === "BasicPlus")
    const standardCases = cases.filter(c => c.complexity === "Standard")
    const highCases = cases.filter(c => c.complexity === "High")
    const complexCases = cases.filter(c => c.complexity === "Complex")

    return {
      ...prosecutor,
      basicCases,
      basicPlusCases,
      standardCases,
      highCases,
      complexCases,
      ctlCases,
      totalCases: prosecutor._count.caseProsecutors,
      ctlCaseCount: ctlCases.length
    }
  })

  prosecutors.sort((a, b) => a.totalCases - b.totalCases || a.ctlCaseCount - b.ctlCaseCount)

  const michaelChenIndex = prosecutors.findIndex(p => p.firstName === 'Michael' && p.lastName === 'Chen')
  if (michaelChenIndex !== -1) {
    prosecutors[michaelChenIndex].didInitialReview = true
    prosecutors[michaelChenIndex].recommended = true
    const michaelChen = prosecutors.splice(michaelChenIndex, 1)[0]
    prosecutors.unshift(michaelChen)

    const otherProsecutors = prosecutors.slice(1).filter(p => p.totalCases > 10)
    prosecutors = [michaelChen, ...otherProsecutors.slice(0, 3)]
  } else {
    prosecutors[0].didInitialReview = true
    prosecutors[0].recommended = true
    prosecutors = prosecutors.slice(0, 5)
  }

  return prosecutors.map(prosecutor => {
    let text = `${prosecutor.firstName} ${prosecutor.lastName}`
    if(prosecutor.recommended) {
      text += ` (most suitable)`
    }

    return {
      text: text,
      value: `${prosecutor.id}`,
      hint: {
        html: getProsecutorHintText(prosecutor)
      }
    }
  })
}


module.exports = router => {

  router.get("/cases/:caseId/add-prosecutor", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) }
    })

    const recommendedProsecutor = await getRecommendedProsecutor()

    res.render("cases/add-prosecutor/index", {
      _case,
      recommendedProsecutorName: `${recommendedProsecutor.firstName} ${recommendedProsecutor.lastName}`
    })
  })

  router.post("/cases/:caseId/add-prosecutor", async (req, res) => {
    const answer = req.session.data.assignProsecutor?.acceptRecommendation

    if (answer === 'yes') {
      const recommendedProsecutor = await getRecommendedProsecutor()
      req.session.data.assignProsecutor.prosecutor = `${recommendedProsecutor.id}`
      res.redirect(`/cases/${req.params.caseId}/add-prosecutor/check`)
    } else {
      res.redirect(`/cases/${req.params.caseId}/add-prosecutor/choose`)
    }
  })

  router.get("/cases/:caseId/add-prosecutor/choose", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) }
    })

    const prosecutorItems = await getProsecutorListData()

    res.render("cases/add-prosecutor/choose", {
      _case,
      prosecutorItems
    })
  })

  router.post("/cases/:caseId/add-prosecutor/choose", async (req, res) => {
    res.redirect(`/cases/${req.params.caseId}/add-prosecutor/check`)
  })

  router.get("/cases/:caseId/add-prosecutor/check", async (req, res) => {
    const _case = await prisma.case.findUnique({
      where: { id: parseInt(req.params.caseId) },
    })

    const recommendedProsecutor = await getRecommendedProsecutor()
    const acceptRecommendation = req.session.data.assignProsecutor.acceptRecommendation

    // get the prosecutor being assigned
    let prosecutor = await prisma.user.findUnique({
      where: { id: parseInt(req.session.data.assignProsecutor.prosecutor) },
      include: {
        caseProsecutors: {
          include: {
            case: { select: { id: true, complexity: true } }
          }
        },
        _count: { select: { caseProsecutors: true } },
      },
    })

    res.render("cases/add-prosecutor/check", {
      _case,
      prosecutor,
      acceptRecommendation,
      recommendedProsecutorName: `${recommendedProsecutor.firstName} ${recommendedProsecutor.lastName}`
    })
  })

  router.post("/cases/:caseId/add-prosecutor/check", async (req, res) => {
    const caseId = parseInt(req.params.caseId)
    const prosecutorId = parseInt(req.session.data.assignProsecutor.prosecutor)

    // Create CaseProsecutor record
    await prisma.caseProsecutor.create({
      data: {
        caseId: caseId,
        userId: prosecutorId
      }
    })

    const prosecutor = await prisma.user.findUnique({
      where: { id: prosecutorId },
      select: { id: true, firstName: true, lastName: true }
    })


    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'Case',
        recordId: caseId,
        action: 'UPDATE',
        title: 'Prosecutor assigned',
        caseId: caseId,
        meta: { prosecutor }
      }
    })

    delete req.session.data.assignProsecutor

    req.flash('success', 'Prosecutor assigned')
    res.redirect(`/cases/${req.params.caseId}`)
  })

}
