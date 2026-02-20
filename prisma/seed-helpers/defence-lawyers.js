const { faker } = require('@faker-js/faker');
const firstNames = require('../../app/data/first-names.js');
const lastNames = require('../../app/data/last-names.js');
const defenceLawyerOrganisations = require('../../app/data/defence-lawyer-organisations.js');

async function seedDefenceLawyers(prisma) {
  const defenceLawyerData = Array.from({ length: 100 }, () => ({
    firstName: faker.helpers.arrayElement(firstNames),
    lastName: faker.helpers.arrayElement(lastNames),
    organisation: faker.helpers.arrayElement(defenceLawyerOrganisations)
  }));

  const defenceLawyers = await prisma.defenceLawyer.createManyAndReturn({
    data: defenceLawyerData
  });

  return defenceLawyers;
}

module.exports = {
  seedDefenceLawyers
};
