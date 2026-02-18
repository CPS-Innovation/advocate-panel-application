const { faker } = require('@faker-js/faker');
const firstNames = require('../../app/data/first-names.js');
const lastNames = require('../../app/data/last-names.js');

async function seedVictims(prisma) {
  const victimData = Array.from({ length: 200 }, () => ({
    firstName: faker.helpers.arrayElement(firstNames),
    lastName: faker.helpers.arrayElement(lastNames),
  }));

  const victims = await prisma.victim.createManyAndReturn({
    data: victimData,
  });

  return victims;
}

module.exports = {
  seedVictims
};
