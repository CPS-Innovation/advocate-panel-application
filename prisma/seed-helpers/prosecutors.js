const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const predefinedProsecutors = require('../../app/data/predefined-prosecutors.js');
const firstNames = require('../../app/data/first-names.js');
const lastNames = require('../../app/data/last-names.js');
const specialisms = require('../../app/data/specialisms.js');

async function seedProsecutors(prisma) {
  const prosecutors = [];

  // Create predefined prosecutors
  for (const prosecutorData of predefinedProsecutors) {
    const unitId = faker.number.int({ min: 1, max: 18 });
    const prosecutor = await prisma.user.create({
      data: {
        firstName: prosecutorData.firstName,
        lastName: prosecutorData.lastName,
        email: prosecutorData.email,
        password: bcrypt.hashSync(prosecutorData.password, 10),
        role: prosecutorData.role,
        units: {
          create: {
            unitId
          }
        },
        specialistAreas: prosecutorData.specialistAreas
          ? { connect: prosecutorData.specialistAreas.map((name) => ({ name })) }
          : undefined,
        preferredAreas: prosecutorData.preferredAreas
          ? { connect: prosecutorData.preferredAreas.map((name) => ({ name })) }
          : undefined,
        restrictedAreas: prosecutorData.restrictedAreas
          ? { connect: prosecutorData.restrictedAreas.map((name) => ({ name })) }
          : undefined
      },
      include: {
        units: true
      }
    });
    prosecutors.push(prosecutor);
  }

  // Generate 150 random prosecutors with specialisms
  for (let i = 0; i < 150; i++) {
    const specialistAreas = faker.helpers.arrayElements(
      specialisms,
      faker.number.int({ min: 0, max: 2 })
    );
    const remainingForPreferred = specialisms.filter(
      (s) => !specialistAreas.includes(s)
    );
    const preferredAreas = faker.helpers.arrayElements(
      remainingForPreferred,
      faker.number.int({ min: 0, max: 2 })
    );
    const remainingForRestricted = specialisms.filter(
      (s) => !specialistAreas.includes(s) && !preferredAreas.includes(s)
    );
    const restrictedAreas = faker.helpers.arrayElements(
      remainingForRestricted,
      faker.number.int({ min: 0, max: 2 })
    );

    const prosecutorUnitId = faker.number.int({ min: 1, max: 18 });
    const prosecutor = await prisma.user.create({
      data: {
        firstName: faker.helpers.arrayElement(firstNames),
        lastName: faker.helpers.arrayElement(lastNames),
        email: `prosecutor.${faker.string.alphanumeric(8).toLowerCase()}@cps.gov.uk`,
        password: bcrypt.hashSync('password123', 10),
        role: 'Prosecutor',
        units: {
          create: {
            unitId: prosecutorUnitId
          }
        },
        specialistAreas: { connect: specialistAreas.map((name) => ({ name })) },
        preferredAreas: { connect: preferredAreas.map((name) => ({ name })) },
        restrictedAreas: { connect: restrictedAreas.map((name) => ({ name })) }
      },
      include: {
        units: true
      }
    });
    prosecutors.push(prosecutor);
  }

  // Re-fetch all prosecutors with units included to ensure we have complete data
  const allProsecutors = await prisma.user.findMany({
    where: { role: 'Prosecutor' },
    include: { units: true }
  });

  return allProsecutors;
}

module.exports = {
  seedProsecutors
};
