const standardTeamNames = require('../../app/data/standard-team-names.js');

async function seedTeams(prisma) {
  const units = await prisma.unit.findMany();

  for (const unit of units) {
    await prisma.team.createMany({
      data: standardTeamNames.map(name => ({
        name,
        unitId: unit.id,
        isStandard: true
      }))
    });
  }

  return units.length * standardTeamNames.length;
}

module.exports = {
  seedTeams
};
