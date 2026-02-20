const areas = require('../../app/data/areas.js');

async function seedAreas(prisma) {
  await prisma.area.createMany({
    data: areas.map((name) => ({ name }))
  });
  return areas.length;
}

module.exports = {
  seedAreas
};
