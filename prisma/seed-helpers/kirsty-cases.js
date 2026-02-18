const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const {
  generateTodaySTL,
  generateTomorrowSTL,
  generateThisWeekSTL
} = require('./stl-generators');
const { createDirectionsForCase } = require('./directions');

const KIRSTY_UNIT = 3; // Wessex Crown Court

// STL tasks (pre-charge, no hearing)
const KIRSTY_STL_TASKS = [
  { name: '5-day PCD review', stlGenerator: generateTodaySTL },
  { name: '28-day PCD review', stlGenerator: generateTomorrowSTL },
  { name: 'Further PCD review', stlGenerator: generateThisWeekSTL }
];

// CTL tasks (with hearing)
const KIRSTY_CTL_TASKS = [
  { name: 'Initial disclosure', hasCTL: true, hearingType: 'PTPH' },
  { name: 'Post sending review', hasCTL: true, hearingType: 'PTPH' },
  { name: 'Prepare PTPH', hasCTL: true, hearingType: 'PTPH' },
  { name: 'Continuous disclosure', hasCTL: true, hearingType: 'Trial' },
  { name: 'Reminder - RL, please see police response to DCS 12/01', hasCTL: true, hearingType: 'Mention', isReminder: true },
  { name: 'CTL expiry imminent', hasCTL: true, hearingType: 'Trial' }
];

async function createSTLCase(prisma, user, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, victims, types, complexities, policeUnits, ukCities, availableOperationNames } = config;
  const { name, stlGenerator } = taskConfig;

  const statutoryTimeLimit = stlGenerator();

  const defendant = await prisma.defendant.create({
    data: {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Unknown']),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
      remandStatus: null,
      defenceLawyer: { connect: { id: faker.helpers.arrayElement(defenceLawyers).id } },
      charges: {
        create: {
          chargeCode: faker.helpers.arrayElement(charges).code,
          description: faker.helpers.arrayElement(charges).description,
          status: 'Pre-charge',
          offenceDate: faker.date.past(),
          plea: null,
          particulars: faker.lorem.sentence(),
          statutoryTimeLimit,
          isCount: false
        }
      }
    }
  });

  const victimIds = faker.helpers.arrayElements(victims, faker.number.int({ min: 1, max: 2 })).map(v => ({ id: v.id }));

  const operationName = (faker.datatype.boolean({ probability: 0.3 }) && availableOperationNames.length > 0)
    ? availableOperationNames.pop()
    : null;

  const _case = await prisma.case.create({
    data: {
      reference: generateCaseReference(),
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: KIRSTY_UNIT } },
      policeUnit: { connect: { id: faker.helpers.arrayElement(policeUnits).id } },
      defendants: { connect: { id: defendant.id } },
      victims: { connect: victimIds },
      location: {
        create: {
          name: faker.company.name(),
          line1: faker.location.streetAddress(),
          line2: faker.location.secondaryAddress(),
          town: faker.helpers.arrayElement(ukCities),
          postcode: faker.location.zipCode("WD# #SF"),
        },
      },
    }
  });

  await prisma.caseProsecutor.create({
    data: {
      caseId: _case.id,
      userId: user.id
    }
  });

  // Create task (no hearing for STL/pre-charge tasks)
  const dueDate = statutoryTimeLimit;
  await prisma.task.create({
    data: {
      name,
      reminderType: null,
      reminderDate: new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      dueDate,
      escalationDate: new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      completedDate: null,
      caseId: _case.id,
      assignedToUserId: user.id
    }
  });

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function createCTLCase(prisma, user, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, policeUnits, ukCities, availableOperationNames } = config;
  const { name, hearingType, isReminder } = taskConfig;

  const custodyTimeLimit = faker.date.soon({ days: 14 });
  custodyTimeLimit.setHours(23, 59, 59, 999);

  const defendant = await prisma.defendant.create({
    data: {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Unknown']),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
      remandStatus: 'REMANDED_IN_CUSTODY',
      defenceLawyer: { connect: { id: faker.helpers.arrayElement(defenceLawyers).id } },
      charges: {
        create: {
          chargeCode: faker.helpers.arrayElement(charges).code,
          description: faker.helpers.arrayElement(charges).description,
          status: 'Charged',
          offenceDate: faker.date.past(),
          plea: faker.helpers.arrayElement(pleas),
          particulars: faker.lorem.sentence(),
          custodyTimeLimit,
          isCount: false
        }
      }
    }
  });

  const victimIds = faker.helpers.arrayElements(victims, faker.number.int({ min: 1, max: 2 })).map(v => ({ id: v.id }));

  const operationName = (faker.datatype.boolean({ probability: 0.3 }) && availableOperationNames.length > 0)
    ? availableOperationNames.pop()
    : null;

  const _case = await prisma.case.create({
    data: {
      reference: generateCaseReference(),
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: KIRSTY_UNIT } },
      policeUnit: { connect: { id: faker.helpers.arrayElement(policeUnits).id } },
      defendants: { connect: { id: defendant.id } },
      victims: { connect: victimIds },
      location: {
        create: {
          name: faker.company.name(),
          line1: faker.location.streetAddress(),
          line2: faker.location.secondaryAddress(),
          town: faker.helpers.arrayElement(ukCities),
          postcode: faker.location.zipCode("WD# #SF"),
        },
      },
    }
  });

  await prisma.caseProsecutor.create({
    data: {
      caseId: _case.id,
      userId: user.id
    }
  });

  // Create hearing
  const hearingDate = faker.date.soon({ days: 30 });
  hearingDate.setUTCHours(faker.helpers.arrayElement([10, 11, 12]), 0, 0, 0);
  await prisma.hearing.create({
    data: {
      startDate: hearingDate,
      endDate: null,
      status: 'Scheduled',
      type: hearingType,
      venue: 'Wessex Crown Court',
      caseId: _case.id
    }
  });

  // Create task
  const dueDate = faker.date.soon({ days: 14 });
  dueDate.setHours(23, 59, 59, 999);
  await prisma.task.create({
    data: {
      name,
      reminderType: isReminder ? 'Manual' : null,
      reminderDate: new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      dueDate,
      escalationDate: new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      completedDate: null,
      caseId: _case.id,
      assignedToUserId: user.id
    }
  });

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function seedKirstyCases(prisma, dependencies, config) {
  const { defenceLawyers, victims, policeUnits, availableOperationNames } = dependencies;
  const { charges, firstNames, lastNames, pleas, types, complexities, ukCities } = config;

  const kirstyPriest = await prisma.user.findFirst({
    where: { firstName: 'Kirsty', lastName: 'Priest' }
  });

  if (!kirstyPriest) {
    console.log('⚠️ Kirsty Priest not found, skipping Kirsty cases');
    return 0;
  }

  const fullConfig = {
    defenceLawyers,
    charges,
    firstNames,
    lastNames,
    pleas,
    victims,
    types,
    complexities,
    policeUnits,
    ukCities,
    availableOperationNames
  };

  // Create STL cases (pre-charge, no hearing)
  for (const taskConfig of KIRSTY_STL_TASKS) {
    await createSTLCase(prisma, kirstyPriest, taskConfig, fullConfig);
  }

  // Create CTL cases (with hearing)
  for (const taskConfig of KIRSTY_CTL_TASKS) {
    await createCTLCase(prisma, kirstyPriest, taskConfig, fullConfig);
  }

  return KIRSTY_STL_TASKS.length + KIRSTY_CTL_TASKS.length;
}

module.exports = {
  seedKirstyCases
};
