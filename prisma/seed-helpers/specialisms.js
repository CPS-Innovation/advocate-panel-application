const specialisms = require('../../app/data/specialisms.js');

async function seedSpecialisms(prisma) {
  await prisma.specialism.createMany({
    data: specialisms.map((name) => ({ name }))
  });
  return specialisms.length;
}

module.exports = {
  seedSpecialisms
};
