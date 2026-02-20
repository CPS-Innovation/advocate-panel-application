const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const { generateUKMobileNumber, generateUKLandlineNumber, generateUKPhoneNumber } = require('./phone-numbers');
const { createDirectionsForCase } = require('./directions');

const RACHAEL_UNITS = {
  WESSEX_CROWN_COURT: 3,
  WESSEX_RASSO: 4
};

const RACHAEL_TASKS = [
  { name: 'Check new police info', hasCTL: true, hearingType: 'Mention' },
  { name: 'Post Hg actions required', hasCTL: true, hearingType: 'Trial' },
  { name: 'Check new communication', hasCTL: false, hearingType: 'Sentence, with PSR' },
  { name: 'Check CTL case', hasCTL: true, hearingType: 'Trial' },
  { name: 'Reminder - 21/01 - SM apps must be done today', hasCTL: true, hearingType: 'PTPH', isReminder: true },
  { name: 'Follow-up - case action plan item', hasCTL: true, hearingType: 'Mention' },
  { name: 'Check new DCS document', hasCTL: true, hearingType: 'Trial' },
  { name: 'Check new correspondence', hasCTL: true, hearingType: 'Section 28' },
  { name: 'Warn witnesses', hasCTL: true, hearingType: 'Trial' }
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
      isAppearingInCourt: null,
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

async function createCaseWithTask(prisma, user, taskConfig, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, policeUnits, ukCities, availableOperationNames, documentNames, documentTypes } = config;
  const { name, hasCTL, hearingType, isReminder } = taskConfig;

  const unitId = faker.helpers.arrayElement([RACHAEL_UNITS.WESSEX_CROWN_COURT, RACHAEL_UNITS.WESSEX_RASSO]);

  const custodyTimeLimit = hasCTL ? faker.date.soon({ days: 14 }) : null;
  if (custodyTimeLimit) custodyTimeLimit.setHours(23, 59, 59, 999);
  const remandStatus = hasCTL ? 'REMANDED_IN_CUSTODY' : faker.helpers.arrayElement(['UNCONDITIONAL_BAIL', 'CONDITIONAL_BAIL']);

  const defendant = await prisma.defendant.create({
    data: {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Unknown']),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
      remandStatus,
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

  await prisma.caseParalegalOfficer.create({
    data: {
      caseId: _case.id,
      userId: user.id
    }
  });

  // Create hearing
  const hearingDate = faker.date.soon({ days: 30 });
  hearingDate.setUTCHours(faker.helpers.arrayElement([10, 11, 12]), 0, 0, 0);
  const venue = unitId === RACHAEL_UNITS.WESSEX_CROWN_COURT ? 'Wessex Crown Court' : 'Wessex RASSO';

  await prisma.hearing.create({
    data: {
      startDate: hearingDate,
      endDate: null,
      status: 'Scheduled',
      type: hearingType,
      venue,
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

  // Create witnesses - first is always a DCF victim, rest are random
  const numWitnesses = faker.helpers.arrayElement([2, 3]);
  for (let w = 0; w < numWitnesses; w++) {
    const { witness, isDcf } = await createWitness(prisma, _case.id, config);

    if (w === 0) {
      await prisma.witness.update({
        where: { id: witness.id },
        data: { isVictim: true, dcf: true, courtAvailabilityStartDate: faker.date.future(), courtAvailabilityEndDate: faker.date.future(), victimCode: 'Learning disabilities', victimExplained: faker.datatype.boolean(), victimOfferResponse: faker.helpers.arrayElement(['Not offered', 'Declined', 'Accepted']) }
      });
    }

    const numStatements = faker.number.int({ min: 1, max: 5 });
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

    if (w === 0 || isDcf) {
      await createSpecialMeasures(prisma, witness.id);
    }
  }

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function createManyWitnessesCase(prisma, user, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, policeUnits, ukCities, availableOperationNames, documentNames, documentTypes } = config;

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
      reference: '99RH250001/1',
      operationName,
      type: faker.helpers.arrayElement(types),
      complexity: faker.helpers.arrayElement(complexities),
      unit: { connect: { id: RACHAEL_UNITS.WESSEX_CROWN_COURT } },
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

  await prisma.caseParalegalOfficer.create({
    data: {
      caseId: _case.id,
      userId: user.id
    }
  });

  // Create 25 witnesses, each with 0-2 statements
  for (let w = 0; w < 25; w++) {
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

async function seedRachaelCases(prisma, dependencies, config) {
  const { defenceLawyers, victims, policeUnits, availableOperationNames } = dependencies;
  const { charges, firstNames, lastNames, pleas, types, complexities, taskNames, ukCities, documentNames, documentTypes } = config;

  const rachaelHarvey = await prisma.user.findFirst({
    where: { firstName: 'Rachael', lastName: 'Harvey' }
  });

  if (!rachaelHarvey) {
    console.log('⚠️ Rachael Harvey not found, skipping Rachael cases');
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
    availableOperationNames,
    documentNames,
    documentTypes
  };

  // Create specific task cases
  for (const taskConfig of RACHAEL_TASKS) {
    await createCaseWithTask(prisma, rachaelHarvey, taskConfig, fullConfig);
  }

  // Create the 25-witness case
  await createManyWitnessesCase(prisma, rachaelHarvey, fullConfig);

  return RACHAEL_TASKS.length + 1;
}

module.exports = {
  seedRachaelCases
};
