const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const { generateUKMobileNumber, generateUKLandlineNumber, generateUKPhoneNumber } = require('./phone-numbers');
const {
  generateTodaySTL,
  generateTomorrowSTL,
  generateThisWeekSTL
} = require('./stl-generators');
const { createDirectionsForCase } = require('./directions');

const SIMON_UNITS = {
  NORTH_YORKSHIRE_MAGISTRATES_COURT: 9,
  SOUTH_YORKSHIRE_MAGISTRATES_COURT: 11,
  WEST_YORKSHIRE_MAGISTRATES_COURT: 13,
  HUMBERSIDE_MAGISTRATES_COURT: 18
};

const SIMON_UNITS_ARRAY = Object.values(SIMON_UNITS);

// STL tasks (pre-charge, no hearing)
const SIMON_STL_TASKS = [
  { name: '5-day PCD review', stlGenerator: generateTodaySTL },
  { name: '28-day PCD review', stlGenerator: generateTomorrowSTL },
  { name: 'Further PCD review', stlGenerator: generateThisWeekSTL }
];

// CTL tasks (with hearing)
const SIMON_CTL_TASKS = [
  { name: 'Initial disclosure', hasCTL: true, hearingType: 'First Hearing' },
  { name: 'Reminder - RL, please see police response', hasCTL: true, hearingType: 'First Hearing', isReminder: true },
  { name: 'Electronic upgrade file review', hasCTL: true, hearingType: 'Trial' },
  { name: 'Check new police info', hasCTL: true, hearingType: 'Mention' },
  { name: 'Check new correspondence', hasCTL: true, hearingType: 'First Hearing' },
  { name: 'CTL expiry imminent', hasCTL: true, hearingType: 'Trial' }
];

async function createWitness(prisma, caseId, config) {
  const { firstNames, lastNames, ukCities } = config;

  const allTypes = [
    "isVictim", "isKeyWitness", "isChild", "isExpert", "isInterpreter",
    "isPolice", "isProfessional", "isPrisoner", "isVulnerable", "isIntimidated"
  ];

  const numTypesWeighted = faker.helpers.weightedArrayElement([
    { weight: 30, value: 0 },
    { weight: 30, value: 1 },
    { weight: 25, value: 2 },
    { weight: 10, value: 3 },
    { weight: 4, value: 4 },
    { weight: 1, value: 5 }
  ]);

  const selectedTypes = faker.helpers.arrayElements(allTypes, numTypesWeighted);

  const witnessTypes = {
    isVictim: selectedTypes.includes("isVictim"),
    isKeyWitness: selectedTypes.includes("isKeyWitness"),
    isChild: selectedTypes.includes("isChild"),
    isExpert: selectedTypes.includes("isExpert"),
    isInterpreter: selectedTypes.includes("isInterpreter"),
    isPolice: selectedTypes.includes("isPolice"),
    isProfessional: selectedTypes.includes("isProfessional"),
    isPrisoner: selectedTypes.includes("isPrisoner"),
    isVulnerable: selectedTypes.includes("isVulnerable"),
    isIntimidated: selectedTypes.includes("isIntimidated")
  };

  const isDcf = faker.datatype.boolean();

  const witness = await prisma.witness.create({
    data: {
      title: faker.helpers.arrayElement([null, "Mr", "Mrs", "Ms", "Dr", "Prof"]),
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: "age" }),
      gender: faker.helpers.arrayElement(["Male", "Female", "Unknown"]),
      ethnicity: faker.helpers.arrayElement([
        null, "White", "Asian_or_Asian_British", "Black_or_Black_British",
        "Mixed", "Other", "Prefer_not_to_say"
      ]),
      preferredLanguage: faker.helpers.arrayElement(["English", "Welsh"]),
      isCpsContactAllowed: faker.datatype.boolean(),
      addressLine1: faker.helpers.arrayElement([null, faker.location.streetAddress()]),
      addressLine2: faker.helpers.arrayElement([null, faker.location.secondaryAddress()]),
      addressTown: faker.helpers.arrayElement([null, faker.helpers.arrayElement(ukCities)]),
      addressPostcode: faker.helpers.arrayElement([null, faker.location.zipCode("WD# #SF")]),
      mobileNumber: faker.helpers.arrayElement([null, generateUKMobileNumber()]),
      emailAddress: faker.helpers.arrayElement([null, faker.internet.email()]),
      preferredContactMethod: faker.helpers.arrayElement([null, "Email", "Phone", "Post"]),
      faxNumber: faker.helpers.arrayElement([null, generateUKLandlineNumber()]),
      homeNumber: faker.helpers.arrayElement([null, generateUKLandlineNumber()]),
      workNumber: faker.helpers.arrayElement([null, generateUKPhoneNumber()]),
      otherNumber: faker.helpers.arrayElement([null, generateUKPhoneNumber()]),
      ...witnessTypes,
      isAppearingInCourt: faker.helpers.arrayElement([false, null]),
      isRelevant: faker.datatype.boolean(),
      attendanceIssues: faker.helpers.arrayElement([null, faker.lorem.sentence()]),
      previousTransgressions: faker.helpers.arrayElement([null, faker.lorem.sentence()]),
      wasWarned: faker.datatype.boolean(),
      dcf: isDcf,
      courtAvailabilityStartDate: isDcf ? faker.date.future() : null,
      courtAvailabilityEndDate: isDcf ? faker.date.future() : null,
      victimCode: witnessTypes.isVictim ? "Learning disabilities" : null,
      victimExplained: witnessTypes.isVictim ? faker.datatype.boolean() : null,
      victimOfferResponse: witnessTypes.isVictim ? faker.helpers.arrayElement(["Not offered", "Declined", "Accepted"]) : null,
      caseId: caseId,
    },
  });

  return { witness, isDcf };
}

async function createSpecialMeasures(prisma, witnessId) {
  const numSpecialMeasures = faker.helpers.weightedArrayElement([
    { weight: 65, value: 1 },
    { weight: 10, value: 2 },
    { weight: 25, value: 0 }
  ]);

  const specialMeasureTypes = [
    "Screen Witness", "Pre-recorded Cross-examination (s.28)", "Evidence by Live Link",
    "Evidence in Private", "Removal of Wigs and Gowns", "Visually Recorded Interview",
    "Intermediary", "Communication Aids"
  ];

  const meetingUrls = [
    "https://teams.microsoft.com/l/meetup-join/19%3ameeting_example123",
    "https://zoom.us/j/1234567890",
    "https://meet.google.com/abc-defg-hij"
  ];

  const selectedTypes = faker.helpers.arrayElements(specialMeasureTypes, numSpecialMeasures);

  for (let sm = 0; sm < numSpecialMeasures; sm++) {
    const requiresMeeting = faker.datatype.boolean();
    await prisma.specialMeasure.create({
      data: {
        witnessId: witnessId,
        type: selectedTypes[sm],
        details: faker.lorem.sentence(),
        needs: faker.lorem.sentence(),
        requiresMeeting: requiresMeeting,
        meetingUrl: requiresMeeting ? faker.helpers.arrayElement(meetingUrls) : null,
        hasAppliedForReportingRestrictions: faker.datatype.boolean(),
      },
    });
  }
}

async function createSTLCase(prisma, user, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, policeUnits, ukCities, availableOperationNames } = config;
  const { name, stlGenerator } = taskConfig;

  const unitId = faker.helpers.arrayElement(SIMON_UNITS_ARRAY);
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

  const unitId = faker.helpers.arrayElement(SIMON_UNITS_ARRAY);
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
      venue: 'Magistrates Court',
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

async function createManyStatementsCase(prisma, user, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, taskNames, policeUnits, ukCities, availableOperationNames } = config;

  const defendant = await prisma.defendant.create({
    data: {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(["Male", "Female", "Unknown"]),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: "age" }),
      remandStatus: "REMANDED_IN_CUSTODY",
      paceClock: null,
      defenceLawyer: { connect: { id: faker.helpers.arrayElement(defenceLawyers).id } },
      charges: {
        create: {
          chargeCode: faker.helpers.arrayElement(charges).code,
          description: faker.helpers.arrayElement(charges).description,
          status: "Charged",
          offenceDate: faker.date.past(),
          plea: faker.helpers.arrayElement(pleas),
          particulars: faker.lorem.sentence(),
          custodyTimeLimit: null,
          statutoryTimeLimit: null,
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
      reference: '99SW100001/1',
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: SIMON_UNITS.NORTH_YORKSHIRE_MAGISTRATES_COURT } },
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

  const dueDate = faker.date.soon({ days: 14 });
  dueDate.setHours(23, 59, 59, 999);
  await prisma.task.create({
    data: {
      name: faker.helpers.arrayElement(taskNames),
      reminderType: null,
      reminderDate: new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      dueDate: dueDate,
      escalationDate: new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      completedDate: null,
      caseId: _case.id,
      assignedToUserId: user.id
    }
  });

  // Create first witness "Aaron Abbott" with 10 statements (sorts first alphabetically)
  const aaronAbbott = await prisma.witness.create({
    data: {
      title: "Mr",
      firstName: "Aaron",
      lastName: "Abbott",
      dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: "age" }),
      gender: "Male",
      ethnicity: "White",
      preferredLanguage: "English",
      isCpsContactAllowed: true,
      addressLine1: faker.location.streetAddress(),
      addressTown: faker.helpers.arrayElement(ukCities),
      addressPostcode: faker.location.zipCode("WD# #SF"),
      mobileNumber: generateUKMobileNumber(),
      emailAddress: faker.internet.email(),
      preferredContactMethod: "Email",
      isAppearingInCourt: null,
      isRelevant: true,
      dcf: false,
      caseId: _case.id,
    },
  });

  // Create 10 statements for Aaron Abbott
  for (let s = 0; s < 10; s++) {
    await prisma.witnessStatement.create({
      data: {
        witnessId: aaronAbbott.id,
        number: s + 1,
        receivedDate: faker.date.past(),
        isUsedAsEvidence: faker.helpers.arrayElement([true, false, null]),
        isMarkedAsSection9: null,
      },
    });
  }

  // Create 4 more witnesses with 0-2 statements each
  for (let w = 0; w < 4; w++) {
    const { witness, isDcf } = await createWitness(prisma, _case.id, config);

    await prisma.witness.update({
      where: { id: witness.id },
      data: { isAppearingInCourt: null }
    });

    const numStatements = faker.number.int({ min: 0, max: 2 });
    for (let s = 0; s < numStatements; s++) {
      await prisma.witnessStatement.create({
        data: {
          witnessId: witness.id,
          number: s + 1,
          receivedDate: faker.date.past(),
          isUsedAsEvidence: faker.helpers.arrayElement([true, false, null]),
          isMarkedAsSection9: null,
        },
      });
    }

    if (isDcf) {
      await createSpecialMeasures(prisma, witness.id);
    }
  }

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function seedSimonCases(prisma, dependencies, config) {
  const { defenceLawyers, victims, policeUnits, availableOperationNames } = dependencies;
  const { charges, firstNames, lastNames, pleas, types, complexities, taskNames, ukCities } = config;

  const simonWhatley = await prisma.user.findFirst({
    where: { firstName: 'Simon', lastName: 'Whatley' }
  });

  if (!simonWhatley) {
    console.log('⚠️ Simon Whatley not found, skipping Simon cases');
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
    taskNames,
    policeUnits,
    ukCities,
    availableOperationNames
  };

  // Create STL cases (pre-charge, no hearing)
  for (const taskConfig of SIMON_STL_TASKS) {
    await createSTLCase(prisma, simonWhatley, taskConfig, fullConfig);
  }

  // Create CTL cases (with hearing)
  for (const taskConfig of SIMON_CTL_TASKS) {
    await createCTLCase(prisma, simonWhatley, taskConfig, fullConfig);
  }

  // Create the 10-statements case (5 witnesses, one with 10 statements)
  await createManyStatementsCase(prisma, simonWhatley, fullConfig);

  return SIMON_STL_TASKS.length + SIMON_CTL_TASKS.length + 1;
}

module.exports = {
  seedSimonCases
};
