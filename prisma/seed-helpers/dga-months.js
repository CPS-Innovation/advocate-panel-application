const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const complexities = require('../../app/data/complexities');
const types = require('../../app/data/types');
const ukCities = require('../../app/data/uk-cities');

// Helper: Calculate deadline as end of month + 6 weeks
function calculateDeadline(reviewDate) {
  const date = new Date(reviewDate);

  // Get last day of the month
  const year = date.getFullYear();
  const month = date.getMonth();
  const endOfMonth = new Date(year, month + 1, 0); // Day 0 of next month = last day of current month

  // Add 6 weeks (42 days)
  const deadline = new Date(endOfMonth);
  deadline.setDate(deadline.getDate() + 42);

  // Set time to 11:59pm
  deadline.setHours(23, 59, 0, 0);

  return deadline;
}

// Get max days in a month (handles varying month lengths)
function getMaxDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

async function seedDGAMonths(prisma, defendants) {
  const failureReasonsList = [
    "Breach failure - Charged by Police in breach of the Director's Guidance",
    "Disclosure failure - Disclosable unused material not provided",
    "Disclosure failure - Information about reasonable lines of inquiry insufficient",
    "Disclosure failure - Information about reasonable lines of inquiry not provided",
    "Disclosure failure - Rebuttable presumption material not provided",
    "Disclosure failure - Schedules of unused material not completed correctly",
    "Disclosure failure - Schedules of unused material not provided",
    "Evidential failure - Exhibit",
    "Evidential failure - Forensic",
    "Evidential failure - Medical evidence",
    "Evidential failure - Multi-media BWV not clipped",
    "Evidential failure - Multi-media BWV not in playable format",
    "Evidential failure - Multi-media BWV not provided",
    "Evidential failure - Multi-media CCTV not clipped",
    "Evidential failure - Multi-media CCTV not in playable format",
    "Evidential failure - Multi-media CCTV not provided",
    "Evidential failure - Multi-media Other not clipped",
    "Evidential failure - Multi-media Other not in playable format",
    "Evidential failure - Relevant orders/applications, details not provided",
    "Evidential failure - Statement(s)",
    "Victim and witness failure - Needs of the victim/witness special measures have not been considered or are inadequate",
    "Victim and witness failure - Victim and witness needs (not special measures related)",
    "Victim and witness failure - VPS - no information on whether VPS offered/not provided"
  ];


  // Month configurations
  // October 2025: All completed (past month)
  // November 2025: All completed (past month)
  // December 2025: Mixed states (current month being worked on)
  // casesPerUnit is now per police unit to allow different counts
  // isCompliant: true means cases with DGA but no failure reasons (passed the review)
  const monthConfigs = [
    {
      name: 'October 2025',
      year: 2025,
      month: 9, // 0-indexed, so 9 = October
      policeUnits: [
        { name: 'Metropolitan Police', state: 'completed', sentToPoliceDate: new Date(2025, 10, 5), casesPerUnit: 37 },
        { name: 'Metropolitan Police', state: 'compliant', sentToPoliceDate: new Date(2025, 10, 5), casesPerUnit: 8 },
        { name: 'Thames Valley Police', state: 'completed', sentToPoliceDate: new Date(2025, 10, 3), casesPerUnit: 37 },
        { name: 'Thames Valley Police', state: 'compliant', sentToPoliceDate: new Date(2025, 10, 3), casesPerUnit: 10 },
        { name: 'West Midlands Police', state: 'completed', sentToPoliceDate: new Date(2025, 10, 1), casesPerUnit: 3 },
        { name: 'West Midlands Police', state: 'compliant', sentToPoliceDate: new Date(2025, 10, 1), casesPerUnit: 2 }
      ]
    },
    {
      name: 'November 2025',
      year: 2025,
      month: 10, // 0-indexed, so 10 = November
      policeUnits: [
        { name: 'Metropolitan Police', state: 'completed', sentToPoliceDate: new Date(2025, 11, 5), casesPerUnit: 37 },
        { name: 'Metropolitan Police', state: 'compliant', sentToPoliceDate: new Date(2025, 11, 5), casesPerUnit: 12 },
        { name: 'Thames Valley Police', state: 'completed', sentToPoliceDate: new Date(2025, 11, 3), casesPerUnit: 37 },
        { name: 'Thames Valley Police', state: 'compliant', sentToPoliceDate: new Date(2025, 11, 3), casesPerUnit: 8 },
        { name: 'West Midlands Police', state: 'completed', sentToPoliceDate: new Date(2025, 11, 1), casesPerUnit: 3 },
        { name: 'West Midlands Police', state: 'compliant', sentToPoliceDate: new Date(2025, 11, 1), casesPerUnit: 1 }
      ]
    },
    {
      name: 'December 2025',
      year: 2025,
      month: 11, // 0-indexed, so 11 = December
      policeUnits: [
        { name: 'Metropolitan Police', state: 'not-started', sentToPoliceDate: null, casesPerUnit: 37 },
        { name: 'Metropolitan Police', state: 'compliant', sentToPoliceDate: null, casesPerUnit: 15 },
        { name: 'Thames Valley Police', state: 'not-started', sentToPoliceDate: null, casesPerUnit: 1 },
        { name: 'Thames Valley Police', state: 'in-progress', sentToPoliceDate: new Date(2026, 0, 1), casesPerUnit: 1 },
        { name: 'Thames Valley Police', state: 'completed', sentToPoliceDate: new Date(2026, 0, 1), casesPerUnit: 1 },
        { name: 'Thames Valley Police', state: 'compliant', sentToPoliceDate: new Date(2026, 0, 1), casesPerUnit: 5 },
        { name: 'West Midlands Police', state: 'completed', sentToPoliceDate: new Date(2025, 11, 25), casesPerUnit: 26 },
        { name: 'West Midlands Police', state: 'compliant', sentToPoliceDate: new Date(2025, 11, 25), casesPerUnit: 4 }
      ]
    }
  ];

  // CPS unit to assign cases to (unit 3 is commonly used by test users)
  const cpsUnitId = 3;

  // Fetch police unit records by name to get their IDs
  const policeUnitRecords = await prisma.policeUnit.findMany({
    where: { name: { in: ['Metropolitan Police', 'Thames Valley Police', 'West Midlands Police'] } }
  });
  const policeUnitMap = Object.fromEntries(policeUnitRecords.map(pu => [pu.name, pu.id]));

  let totalCreated = 0;

  for (const monthConfig of monthConfigs) {
    let monthCaseCount = 0;

    for (const policeUnitConfig of monthConfig.policeUnits) {
      const policeUnitName = policeUnitConfig.name;
      const policeUnitId = policeUnitMap[policeUnitName];
      const state = policeUnitConfig.state;
      const sentToPoliceDate = policeUnitConfig.sentToPoliceDate;
      const casesPerUnit = policeUnitConfig.casesPerUnit;

      // Create dedicated cases for this police unit
      for (let i = 0; i < casesPerUnit; i++) {
        // Create a new case specifically for DGA
        const newCase = await prisma.case.create({
          data: {
            reference: generateCaseReference(),
            complexity: faker.helpers.arrayElement(complexities),
            type: faker.helpers.arrayElement(types),
            unitId: cpsUnitId,
            policeUnitId: policeUnitId,
            defendants: { connect: { id: faker.helpers.arrayElement(defendants).id } },
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

        // Set review date to random day in the month
        const maxDay = getMaxDaysInMonth(monthConfig.year, monthConfig.month);
        const reviewDate = new Date(
          monthConfig.year,
          monthConfig.month,
          faker.number.int({ min: 1, max: maxDay })
        );

        // Only non-compliant cases get a deadline for recording dispute outcomes
        const isCompliant = state === 'compliant';
        const recordDisputeOutcomesDeadline = isCompliant ? null : calculateDeadline(reviewDate);

        // Create DGA
        const dga = await prisma.dGA.create({
          data: {
            caseId: newCase.id,
            reason: faker.lorem.sentence(),
            reviewDate: reviewDate,
            recordDisputeOutcomesDeadline: recordDisputeOutcomesDeadline,
            sentToPoliceDate: sentToPoliceDate,
          },
        });

        // Compliant cases have no failure reasons
        if (isCompliant) {
          monthCaseCount++;
          continue;
        }

        // Create 1-5 failure reasons for non-compliant cases
        const numFailureReasons = faker.number.int({ min: 1, max: 5 });
        const selectedReasons = faker.helpers.arrayElements(failureReasonsList, numFailureReasons);

        for (const reason of selectedReasons) {
          let disputed = null;
          let cpsAccepted = null;

          const shouldHaveOutcome = state === 'completed' || (state === 'in-progress' && faker.datatype.boolean());

          if (shouldHaveOutcome) {
            disputed = faker.helpers.arrayElement(['Yes', 'No']);
            if (disputed === 'Yes') {
              cpsAccepted = faker.helpers.arrayElement(['Yes', 'No']);
            }
          }

          await prisma.dGAFailureReason.create({
            data: {
              dgaId: dga.id,
              reason: reason,
              disputed: disputed,
              cpsAccepted: cpsAccepted,
              details: disputed === 'Yes' ? faker.lorem.paragraph() : null,
              methods: disputed === 'Yes'
                ? faker.helpers.arrayElements(['Email', 'Phone', 'Letter'], faker.number.int({ min: 1, max: 2 })).join(', ')
                : null
            }
          });
        }

        monthCaseCount++;
      }
    }

    totalCreated += monthCaseCount;
  }

  return totalCreated;
}

module.exports = {
  seedDGAMonths
};
