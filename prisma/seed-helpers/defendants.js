const { faker } = require('@faker-js/faker');
const firstNames = require('../../app/data/first-names.js');
const lastNames = require('../../app/data/last-names.js');
const religions = require('../../app/data/religions.js');
const occupations = require('../../app/data/occupations.js');
const remandStatuses = require('../../app/data/remand-statuses.js');
const charges = require('../../app/data/charges.js');
const chargeStatuses = require('../../app/data/charge-statuses.js');
const pleas = require('../../app/data/pleas.js');

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

async function seedDefendants(prisma, defenceLawyers) {
  // Step 1: Batch create all defendants with time limit type distribution
  // 50% CTL, 25% STL, 25% PACE
  // Track time limit type for each defendant (for charge creation)
  const defendantTimeLimitTypes = [];

  const defendantData = Array.from({ length: 300 }, (_, index) => {
    // Randomly assign time limit type (equal probability)
    const timeLimitType = faker.helpers.arrayElement(['CTL', 'STL', 'PACE']);
    defendantTimeLimitTypes.push(timeLimitType);

    // For PACE defendants, randomly assign a PACE clock from any time range
    let paceClock = null;
    if (timeLimitType === 'PACE') {
      const paceGenerators = [
        generateExpiredPACE,
        generateLessThan1HourPACE,
        generateLessThan2HoursPACE,
        generateLessThan3HoursPACE,
        generateMoreThan3HoursPACE
      ];
      paceClock = faker.helpers.arrayElement(paceGenerators)();
    }

    return {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      gender: faker.helpers.arrayElement(["Male", "Female", "Unknown"]),
      religion: faker.helpers.arrayElement([...religions, null]),
      occupation: faker.helpers.arrayElement([...occupations, null]),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: "age" }),
      remandStatus: faker.helpers.arrayElement(remandStatuses),
      paceClock,
      defenceLawyerId: faker.helpers.arrayElement(defenceLawyers).id
    };
  });

  const defendants = await prisma.defendant.createManyAndReturn({
    data: defendantData,
  });

  // Step 2: Batch create all charges for defendants
  const allChargesData = [];
  for (let i = 0; i < defendants.length; i++) {
    const defendant = defendants[i];

    // Get the time limit type for this defendant
    const timeLimitType = defendantTimeLimitTypes[i];

    // Decide how many charges this defendant has (1-4, weighted towards 1-2)
    const numCharges = faker.helpers.weightedArrayElement([
      { weight: 50, value: 1 },
      { weight: 30, value: 2 },
      { weight: 15, value: 3 },
      { weight: 5, value: 4 }
    ]);

    // Select random charges
    const selectedCharges = faker.helpers.arrayElements(charges, numCharges);

    // Generate a time limit date for this defendant (will apply to at least one charge)
    let timeLimitDate = null;
    if (timeLimitType === 'CTL') {
      // Randomly select from CTL date range generators
      const ctlGenerators = [
        generateExpiredCTL,
        generateTodayCTL,
        generateTomorrowCTL,
        generateThisWeekCTL,
        generateNextWeekCTL,
        generateLaterCTL
      ];
      timeLimitDate = faker.helpers.arrayElement(ctlGenerators)();
    } else if (timeLimitType === 'STL') {
      // Randomly select from STL date range generators
      const stlGenerators = [
        generateExpiredSTL,
        generateTodaySTL,
        generateTomorrowSTL,
        generateThisWeekSTL,
        generateNextWeekSTL,
        generateLaterSTL
      ];
      timeLimitDate = faker.helpers.arrayElement(stlGenerators)();
    }
    // PACE is on defendant, not charges

    // Build charges data
    selectedCharges.forEach((charge, index) => {
      // Generate particulars with random date and victim
      const offenceDate = faker.date.past();
      const particularsDate = offenceDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const victimName = `${faker.helpers.arrayElement(firstNames)} ${faker.helpers.arrayElement(lastNames)}`;

      // For CTL/STL defendants, at least one charge must have the time limit
      // For first charge, always apply it. For additional charges, 50% chance
      const shouldHaveTimeLimit = index === 0 || faker.datatype.boolean();

      let ctl = null;
      let stl = null;
      if (timeLimitType === 'CTL' && shouldHaveTimeLimit) {
        ctl = timeLimitDate;
      } else if (timeLimitType === 'STL' && shouldHaveTimeLimit) {
        stl = timeLimitDate;
      }

      allChargesData.push({
        chargeCode: charge.code,
        description: charge.description,
        status: faker.helpers.arrayElement(chargeStatuses),
        offenceDate: offenceDate,
        plea: faker.helpers.arrayElement(pleas),
        particulars: `On the ${particularsDate} ${charge.code === 'B10' ? 'stole' : charge.code === 'A01' ? 'assaulted' : charge.code === 'C03' ? 'damaged property belonging to' : 'committed an offence against'} ${victimName}.`,
        custodyTimeLimit: ctl,
        statutoryTimeLimit: stl,
        isCount: faker.datatype.boolean(0.3), // 30% are counts
        defendantId: defendant.id,
      });
    });
  }

  await prisma.charge.createMany({ data: allChargesData });

  return defendants;
}

module.exports = {
  seedDefendants
};
