const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const { generateUKMobileNumber, generateUKLandlineNumber, generateUKPhoneNumber } = require('./phone-numbers');
const {
  generateExpiredCTL,
  generateTodayCTL,
  generateTomorrowCTL,
  generateThisWeekCTL,
  generateNextWeekCTL,
  generateLaterCTL
} = require('./ctl-generators');
const {
  generateExpiredSTL,
  generateTodaySTL,
  generateTomorrowSTL,
  generateThisWeekSTL,
  generateNextWeekSTL,
  generateLaterSTL
} = require('./stl-generators');
const {
  generateExpiredPACE,
  generateLessThan1HourPACE,
  generateLessThan2HoursPACE,
  generateLessThan3HoursPACE,
  generateMoreThan3HoursPACE
} = require('./pace-generators');
const { createDirectionsForCase } = require('./directions');

const BRUCE_UNITS = {
  WESSEX_CROWN_COURT: 3,
  WESSEX_RASSO: 4
};

const TEST_CASES = [
  // CTL
  { type: 'CTL', fn: generateExpiredCTL },
  { type: 'CTL', fn: generateTodayCTL },
  { type: 'CTL', fn: generateTomorrowCTL },
  { type: 'CTL', fn: generateThisWeekCTL },
  { type: 'CTL', fn: generateNextWeekCTL },
  { type: 'CTL', fn: generateLaterCTL },
  // STL
  { type: 'STL', fn: generateExpiredSTL },
  { type: 'STL', fn: generateTodaySTL },
  { type: 'STL', fn: generateTomorrowSTL },
  { type: 'STL', fn: generateThisWeekSTL },
  { type: 'STL', fn: generateNextWeekSTL },
  { type: 'STL', fn: generateLaterSTL },
  // PACE
  { type: 'PACE', fn: generateExpiredPACE },
  { type: 'PACE', fn: generateLessThan1HourPACE },
  { type: 'PACE', fn: generateLessThan2HoursPACE },
  { type: 'PACE', fn: generateLessThan3HoursPACE },
  { type: 'PACE', fn: generateMoreThan3HoursPACE }
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

async function createWitnessStatements(prisma, witnessId, numStatements) {
  for (let s = 0; s < numStatements; s++) {
    await prisma.witnessStatement.create({
      data: {
        witnessId: witnessId,
        number: s + 1,
        receivedDate: faker.date.past(),
        isUsedAsEvidence: faker.helpers.arrayElement([true, false, null]),
        isMarkedAsSection9: faker.helpers.arrayElement([true, false, null]),
      },
    });
  }
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

async function createTimeLimitTestCase(prisma, user, unitId, timeLimitType, generateFn, config) {
  const { defenceLawyers, charges, firstNames, lastNames, pleas, victims, types, complexities, taskNames, policeUnits, ukCities } = config;

  const defendant = await prisma.defendant.create({
    data: {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(["Male", "Female", "Unknown"]),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: "age" }),
      remandStatus: "REMANDED_IN_CUSTODY",
      paceClock: timeLimitType === 'PACE' ? generateFn() : null,
      defenceLawyer: { connect: { id: faker.helpers.arrayElement(defenceLawyers).id } },
      charges: {
        create: {
          chargeCode: faker.helpers.arrayElement(charges).code,
          description: faker.helpers.arrayElement(charges).description,
          status: "Charged",
          offenceDate: faker.date.past(),
          plea: faker.helpers.arrayElement(pleas),
          particulars: faker.lorem.sentence(),
          custodyTimeLimit: timeLimitType === 'CTL' ? generateFn() : null,
          statutoryTimeLimit: timeLimitType === 'STL' ? generateFn() : null,
          isCount: false
        }
      }
    }
  });

  const victimIds = faker.helpers.arrayElements(victims, faker.number.int({ min: 1, max: 2 })).map(v => ({ id: v.id }));

  const _case = await prisma.case.create({
    data: {
      reference: generateCaseReference(),
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

  await prisma.caseParalegalOfficer.create({
    data: {
      caseId: _case.id,
      userId: user.id
    }
  });

  const timeLimit = generateFn();
  await prisma.task.create({
    data: {
      name: faker.helpers.arrayElement(taskNames),
      reminderType: null,
      reminderDate: new Date(timeLimit.getTime() - 3 * 24 * 60 * 60 * 1000),
      dueDate: timeLimit,
      escalationDate: new Date(timeLimit.getTime() + 2 * 24 * 60 * 60 * 1000),
      completedDate: null,
      caseId: _case.id,
      assignedToUserId: user.id
    }
  });

  // Create 1-7 witnesses with 1-5 statements each
  const numWitnesses = faker.number.int({ min: 1, max: 7 });
  for (let w = 0; w < numWitnesses; w++) {
    const { witness, isDcf } = await createWitness(prisma, _case.id, config);
    const numStatements = faker.number.int({ min: 1, max: 5 });
    await createWitnessStatements(prisma, witness.id, numStatements);
    if (isDcf) {
      await createSpecialMeasures(prisma, witness.id);
    }
  }

  // Create directions
  await createDirectionsForCase(prisma, _case.id, defendant.id, faker.number.int({ min: 1, max: 3 }));

  return _case;
}

async function seedBruceCases(prisma, dependencies, config) {
  const { defenceLawyers, victims, policeUnits } = dependencies;
  const { charges, firstNames, lastNames, pleas, types, complexities, taskNames, ukCities } = config;

  const bruceBanner = await prisma.user.findFirst({
    where: { firstName: "Bruce", lastName: "Banner" }
  });

  if (!bruceBanner) {
    console.log('⚠️ Bruce Banner not found, skipping time limit test cases');
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
    ukCities
  };

  const units = [BRUCE_UNITS.WESSEX_CROWN_COURT, BRUCE_UNITS.WESSEX_RASSO];

  // Create 17 time limit test cases
  for (let i = 0; i < TEST_CASES.length; i++) {
    const { type, fn } = TEST_CASES[i];
    const unitId = units[i % units.length];
    await createTimeLimitTestCase(prisma, bruceBanner, unitId, type, fn, fullConfig);
  }

  return TEST_CASES.length;
}

module.exports = {
  seedBruceCases
};
