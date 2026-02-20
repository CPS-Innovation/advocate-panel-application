const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const {
  generateTodaySTL,
  generateTomorrowSTL
} = require('./stl-generators');
const {
  generateLessThan1HourPACE,
  generateLessThan2HoursPACE
} = require('./pace-generators');
const { createDirectionsForCase } = require('./directions');

const TONY_UNITS = {
  DORSET_MAGISTRATES: 1,
  HAMPSHIRE_MAGISTRATES: 2,
  WESSEX_CROWN_COURT: 3,
  WESSEX_RASSO: 4,
  WESSEX_CCU: 5,
  WESSEX_FRAUD: 6,
  WILTSHIRE_MAGISTRATES: 7
};

const ALL_TONY_UNITS = Object.values(TONY_UNITS);
const MAGISTRATES_UNITS = [TONY_UNITS.DORSET_MAGISTRATES, TONY_UNITS.HAMPSHIRE_MAGISTRATES];
const CROWN_RASSO_UNITS = [TONY_UNITS.WESSEX_CROWN_COURT, TONY_UNITS.WESSEX_RASSO];
const CROWN_RASSO_CCU_UNITS = [TONY_UNITS.WESSEX_CROWN_COURT, TONY_UNITS.WESSEX_RASSO, TONY_UNITS.WESSEX_CCU];

// STL tasks (pre-charge, no hearing) - Dorset/Hampshire Magistrates only
const ADMIN_STL_TASKS = [
  { name: 'Check new PCD case', stlGenerator: generateTodaySTL, units: MAGISTRATES_UNITS },
  { name: 'Check resubmitted PCD case', stlGenerator: generateTomorrowSTL, units: MAGISTRATES_UNITS }
];

// PACE clock tasks (pre-charge, no hearing) - Dorset/Hampshire Magistrates only
const ADMIN_PACE_TASKS = [
  { name: 'Priority PCD review', paceGenerator: generateLessThan1HourPACE, units: MAGISTRATES_UNITS },
  { name: 'Priority resubmitted PCD case', paceGenerator: generateLessThan2HoursPACE, units: MAGISTRATES_UNITS }
];

// CTL tasks (with hearing)
const ADMIN_CTL_TASKS = [
  { name: 'Check new police info', hasCTL: true, hearingType: null, units: ALL_TONY_UNITS },
  { name: 'Record Hg outcome', hasCTL: true, hearingType: 'First Hearing', units: ALL_TONY_UNITS },
  { name: 'Finalise case', hasCTL: true, hearingType: null, units: ALL_TONY_UNITS },
  { name: 'Check electronic upgrade file', hasCTL: true, hearingType: 'Trial', units: ALL_TONY_UNITS },
  { name: 'Dispatch bundle', hasCTL: true, hearingType: 'Mention', units: ALL_TONY_UNITS },
  { name: 'Prepare s51/allocation documents', hasCTL: true, hearingType: 'PTPH', units: CROWN_RASSO_CCU_UNITS },
  { name: 'Chase upgrade file', hasCTL: true, hearingType: 'Trial', units: ALL_TONY_UNITS },
  { name: 'DCS dispatch error', hasCTL: true, hearingType: 'Trial', units: CROWN_RASSO_UNITS },
  { name: 'Reminder - Please see ITA log', hasCTL: true, hearingType: 'Mention', units: ALL_TONY_UNITS, isReminder: true },
  { name: 'Check new Crown Court case', hasCTL: true, hearingType: 'PTPH', units: CROWN_RASSO_UNITS },
  { name: 'Follow-up - case action plan item', hasCTL: true, hearingType: 'Trial', units: ALL_TONY_UNITS }
];

async function getAdminPoolTeamForUnit(prisma, unitId) {
  const team = await prisma.team.findFirst({
    where: {
      unitId,
      name: 'Admin pool'
    }
  });
  return team;
}

async function createSTLCaseForAdminPool(prisma, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, victims, types, complexities, policeUnits, ukCities, availableOperationNames, documentNames, documentTypes } = config;
  const { name, stlGenerator, units } = taskConfig;

  const unitId = faker.helpers.arrayElement(units);
  const statutoryTimeLimit = stlGenerator();

  const adminPoolTeam = await getAdminPoolTeamForUnit(prisma, unitId);
  if (!adminPoolTeam) {
    console.log(`⚠️ Admin pool team not found for unit ${unitId}`);
    return null;
  }

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

  const numDocuments = faker.number.int({ min: 5, max: 15 });
  const documentsData = [];
  for (let d = 0; d < numDocuments; d++) {
    const baseName = faker.helpers.arrayElement(documentNames);
    documentsData.push({
      name: `${baseName} ${d + 1}`,
      description: faker.helpers.arrayElement(['This is a random description', 'This is another random description', faker.lorem.sentence()]),
      type: faker.helpers.arrayElement(documentTypes),
      size: faker.number.int({ min: 50, max: 5000 }),
    });
  }

  const _case = await prisma.case.create({
    data: {
      reference: generateCaseReference(),
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: unitId } },
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
      documents: {
        createMany: {
          data: documentsData,
        },
      },
    }
  });

  // Create task assigned to admin pool team (not to a user)
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
      assignedToTeamId: adminPoolTeam.id
    }
  });

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function createPACECaseForAdminPool(prisma, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, victims, types, complexities, policeUnits, ukCities, availableOperationNames, documentNames, documentTypes } = config;
  const { name, paceGenerator, units } = taskConfig;

  const unitId = faker.helpers.arrayElement(units);
  const paceClock = paceGenerator();

  const adminPoolTeam = await getAdminPoolTeamForUnit(prisma, unitId);
  if (!adminPoolTeam) {
    console.log(`⚠️ Admin pool team not found for unit ${unitId}`);
    return null;
  }

  const defendant = await prisma.defendant.create({
    data: {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Unknown']),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
      remandStatus: 'REMANDED_IN_CUSTODY',
      paceClock,
      defenceLawyer: { connect: { id: faker.helpers.arrayElement(defenceLawyers).id } },
      charges: {
        create: {
          chargeCode: faker.helpers.arrayElement(charges).code,
          description: faker.helpers.arrayElement(charges).description,
          status: 'Pre-charge',
          offenceDate: faker.date.past(),
          plea: null,
          particulars: faker.lorem.sentence(),
          isCount: false
        }
      }
    }
  });

  const victimIds = faker.helpers.arrayElements(victims, faker.number.int({ min: 1, max: 2 })).map(v => ({ id: v.id }));

  const operationName = (faker.datatype.boolean({ probability: 0.3 }) && availableOperationNames.length > 0)
    ? availableOperationNames.pop()
    : null;

  const numDocuments = faker.number.int({ min: 5, max: 15 });
  const documentsData = [];
  for (let d = 0; d < numDocuments; d++) {
    const baseName = faker.helpers.arrayElement(documentNames);
    documentsData.push({
      name: `${baseName} ${d + 1}`,
      description: faker.helpers.arrayElement(['This is a random description', 'This is another random description', faker.lorem.sentence()]),
      type: faker.helpers.arrayElement(documentTypes),
      size: faker.number.int({ min: 50, max: 5000 }),
    });
  }

  const _case = await prisma.case.create({
    data: {
      reference: generateCaseReference(),
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: unitId } },
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
      documents: {
        createMany: {
          data: documentsData,
        },
      },
    }
  });

  // Create task assigned to admin pool team (not to a user)
  const dueDate = paceClock;
  await prisma.task.create({
    data: {
      name,
      reminderType: null,
      reminderDate: new Date(dueDate.getTime() - 1 * 60 * 60 * 1000), // 1 hour before for PACE
      dueDate,
      escalationDate: new Date(dueDate.getTime() + 1 * 60 * 60 * 1000),
      completedDate: null,
      caseId: _case.id,
      assignedToTeamId: adminPoolTeam.id
    }
  });

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function createCTLCaseForAdminPool(prisma, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, policeUnits, ukCities, availableOperationNames, documentNames, documentTypes } = config;
  const { name, hearingType, units, isReminder } = taskConfig;

  const unitId = faker.helpers.arrayElement(units);
  const custodyTimeLimit = faker.date.soon({ days: 14 });
  custodyTimeLimit.setHours(23, 59, 59, 999);

  const adminPoolTeam = await getAdminPoolTeamForUnit(prisma, unitId);
  if (!adminPoolTeam) {
    console.log(`⚠️ Admin pool team not found for unit ${unitId}`);
    return null;
  }

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

  const numDocuments = faker.number.int({ min: 5, max: 15 });
  const documentsData = [];
  for (let d = 0; d < numDocuments; d++) {
    const baseName = faker.helpers.arrayElement(documentNames);
    documentsData.push({
      name: `${baseName} ${d + 1}`,
      description: faker.helpers.arrayElement(['This is a random description', 'This is another random description', faker.lorem.sentence()]),
      type: faker.helpers.arrayElement(documentTypes),
      size: faker.number.int({ min: 50, max: 5000 }),
    });
  }

  const _case = await prisma.case.create({
    data: {
      reference: generateCaseReference(),
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: unitId } },
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
      documents: {
        createMany: {
          data: documentsData,
        },
      },
    }
  });

  // Create hearing if applicable
  if (hearingType) {
    const hearingDate = faker.date.soon({ days: 30 });
    hearingDate.setUTCHours(faker.helpers.arrayElement([10, 11, 12]), 0, 0, 0);
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    await prisma.hearing.create({
      data: {
        startDate: hearingDate,
        endDate: null,
        status: 'Scheduled',
        type: hearingType,
        venue: unit?.name || 'Court',
        caseId: _case.id
      }
    });
  }

  // Create task assigned to admin pool team (not to a user)
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
      assignedToTeamId: adminPoolTeam.id
    }
  });

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function seedTonyCases(prisma, dependencies, config) {
  const { defenceLawyers, victims, policeUnits, availableOperationNames } = dependencies;
  const { charges, firstNames, lastNames, pleas, types, complexities, ukCities, documentNames, documentTypes } = config;

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
    availableOperationNames,
    documentNames,
    documentTypes
  };

  let count = 0;

  // Create STL cases (pre-charge, no hearing)
  for (const taskConfig of ADMIN_STL_TASKS) {
    const result = await createSTLCaseForAdminPool(prisma, taskConfig, fullConfig);
    if (result) count++;
  }

  // Create PACE cases (pre-charge, no hearing)
  for (const taskConfig of ADMIN_PACE_TASKS) {
    const result = await createPACECaseForAdminPool(prisma, taskConfig, fullConfig);
    if (result) count++;
  }

  // Create CTL cases (with hearing where applicable)
  for (const taskConfig of ADMIN_CTL_TASKS) {
    const result = await createCTLCaseForAdminPool(prisma, taskConfig, fullConfig);
    if (result) count++;
  }

  return count;
}

module.exports = {
  seedTonyCases
};
