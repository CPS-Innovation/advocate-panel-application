const { faker } = require('@faker-js/faker')

async function seedRecentCases(prisma) {
  const predefinedUsers = await prisma.user.findMany({
    where: {
      email: { endsWith: '@cps.gov.uk' }
    },
    include: {
      units: true
    }
  })

  let count = 0

  for (const user of predefinedUsers) {
    const unitIds = user.units.map(u => u.unitId)
    if (unitIds.length === 0) continue

    const cases = await prisma.case.findMany({
      where: { unitId: { in: unitIds } },
      take: 50
    })

    if (cases.length === 0) continue

    const selected = faker.helpers.arrayElements(cases, Math.min(5, cases.length))

    for (let i = 0; i < selected.length; i++) {
      const openedAt = new Date()
      openedAt.setMinutes(openedAt.getMinutes() - i * 30)

      await prisma.recentCase.create({
        data: {
          userId: user.id,
          caseId: selected[i].id,
          openedAt
        }
      })
      count++
    }
  }

  return count
}

module.exports = { seedRecentCases }
