const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

// Data
const complexities = require("../app/data/complexities.js");
const firstNames = require("../app/data/first-names.js");
const lastNames = require("../app/data/last-names.js");
const types = require("../app/data/types.js");
const taskNames = require("../app/data/task-names.js");
const documentTypes = require("../app/data/document-types.js");
const venues = require("../app/data/venues.js");
const charges = require("../app/data/charges.js");
const pleas = require("../app/data/pleas.js");
const ukCities = require("../app/data/uk-cities.js");
const taskNoteDescriptions = require("../app/data/task-note-descriptions.js");
const manualTaskNamesShort = require("../app/data/manual-task-names-short.js");
const manualTaskNamesLong = require("../app/data/manual-task-names-long.js");
const documentNames = require("../app/data/document-names.js");

// Seeds
const { seedAreas } = require("./seed-helpers/areas");
const { seedUnits } = require("./seed-helpers/units");
const { seedTeams } = require("./seed-helpers/teams");
const { seedUsers } = require("./seed-helpers/users");
const { seedSpecialisms } = require("./seed-helpers/specialisms");
const { seedProsecutors } = require("./seed-helpers/prosecutors");
const { seedDefenceLawyers } = require("./seed-helpers/defence-lawyers");
const { seedDefendants } = require("./seed-helpers/defendants");
const { seedVictims } = require("./seed-helpers/victims");
const { seedPoliceUnits } = require("./seed-helpers/police-units");
const { getDefendantTimeLimitTypes } = require("./seed-helpers/defendant-time-limit-types");
const { seedRachaelCases } = require("./seed-helpers/rachael-cases");
const { seedSimonCases } = require("./seed-helpers/simon-cases");
const { seedKirstyCases } = require("./seed-helpers/kirsty-cases");
const { seedTonyCases } = require("./seed-helpers/tony-cases");
const { seedBruceCases } = require("./seed-helpers/bruce-cases");
const { seedOtherUsersTasks } = require("./seed-helpers/other-users-tasks");
const { seedDGAMonths } = require("./seed-helpers/dga-months");
const { seedGeneralCases } = require("./seed-helpers/general-cases");
const { seedCaseNotes } = require("./seed-helpers/case-notes");
const { seedDirectionNotes } = require("./seed-helpers/direction-notes");
const { seedActivityLogs } = require("./seed-helpers/activity-logs");
const { seedRecentCases } = require("./seed-helpers/recent-cases");

const prisma = new PrismaClient();

let currentStep = '';

function step(message) {
  currentStep = message;
  process.stdout.write(`  ${message}...`);
}

function done(count) {
  const countSuffix = count !== undefined ? ` (${count})` : '';
  process.stdout.write(`\r  ✅ ${currentStep}${countSuffix}\n`);
}

async function main() {
  console.log("\n🌱 Seeding database\n");

  // ─────────────────────────────────────────────────────────────────
  // Reference data
  // ─────────────────────────────────────────────────────────────────
  console.log("Reference data");

  step("Areas");
  const areasCount = await seedAreas(prisma);
  done(areasCount);

  step("Units");
  const unitsCount = await seedUnits(prisma);
  done(unitsCount);

  step("Teams");
  const teamsCount = await seedTeams(prisma);
  done(teamsCount);

  step("Specialisms");
  const specialismsCount = await seedSpecialisms(prisma);
  done(specialismsCount);

  step("Police units");
  const policeUnits = await seedPoliceUnits(prisma);
  done(policeUnits.length);

  step("Defence lawyers");
  const defenceLawyers = await seedDefenceLawyers(prisma);
  done(defenceLawyers.length);

  // ─────────────────────────────────────────────────────────────────
  // Users
  // ─────────────────────────────────────────────────────────────────
  console.log("\nUsers");

  step("Users");
  const users = await seedUsers(prisma);
  done(users.length);

  step("Prosecutors");
  const prosecutors = await seedProsecutors(prisma);
  done(prosecutors.length);

  // ─────────────────────────────────────────────────────────────────
  // People (defendants and victims)
  // ─────────────────────────────────────────────────────────────────
  console.log("\nPeople");

  step("Defendants");
  const defendants = await seedDefendants(prisma, defenceLawyers);
  done(defendants.length);

  step("Victims");
  const victims = await seedVictims(prisma);
  done(victims.length);

  // ─────────────────────────────────────────────────────────────────
  // Cases
  // ─────────────────────────────────────────────────────────────────
  console.log("\nCases");

  const defendantTimeLimitTypes = await getDefendantTimeLimitTypes(defendants, prisma);
  const ctlDefendants = defendants.filter((_, index) => defendantTimeLimitTypes[index] === 'CTL');
  const stlDefendants = defendants.filter((_, index) => defendantTimeLimitTypes[index] === 'STL');
  const paceDefendants = defendants.filter((_, index) => defendantTimeLimitTypes[index] === 'PACE');

  const TOTAL_CASES = 1065;
  const UNASSIGNED_TARGET = 7;

  step("General cases");
  const createdCases = await seedGeneralCases(
    prisma,
    {
      users,
      prosecutors,
      defendants,
      victims,
      policeUnits,
      ctlDefendants,
      stlDefendants,
      paceDefendants
    },
    {
      totalCases: TOTAL_CASES,
      unassignedTarget: UNASSIGNED_TARGET,
      complexities,
      types,
      taskNames,
      documentTypes,
      venues,
      ukCities,
      firstNames,
      lastNames,
      documentNames,
      manualTaskNamesShort,
      manualTaskNamesLong,
      taskNoteDescriptions
    }
  );
  done(createdCases.length);

  step("DGA cases");
  const dgaCasesCount = await seedDGAMonths(prisma, defendants);
  done(dgaCasesCount);

  const availableOperationNames = faker.helpers.shuffle([
    'Ragnarok', 'Valhalla', 'Odin', 'Mjolnir', 'Bifrost',
    'Asgard', 'Ultron', 'Endgame', 'Sakaar', 'Infinity',
    'Avalon', 'Fenrir', 'Surtur', 'Heimdall', 'Yggdrasil',
    'Titan', 'Wakanda', 'Vibranium', 'Nexus', 'Kree'
  ]);

  step("Rachael Harvey's cases");
  const rachaelCasesCount = await seedRachaelCases(
    prisma,
    { defenceLawyers, victims, policeUnits, availableOperationNames },
    { charges, firstNames, lastNames, pleas, types, complexities, taskNames, ukCities, documentNames, documentTypes }
  );
  done(rachaelCasesCount);

  step("Simon Whatley's cases");
  const simonCasesCount = await seedSimonCases(
    prisma,
    { defenceLawyers, victims, policeUnits, availableOperationNames },
    { charges, firstNames, lastNames, pleas, types, complexities, taskNames, ukCities, documentNames, documentTypes }
  );
  done(simonCasesCount);

  step("Kirsty Priest's cases");
  const kirstyCasesCount = await seedKirstyCases(
    prisma,
    { defenceLawyers, victims, policeUnits, availableOperationNames },
    { charges, firstNames, lastNames, pleas, types, complexities, ukCities, documentNames, documentTypes }
  );
  done(kirstyCasesCount);

  step("Tony Stark's cases");
  const tonyCasesCount = await seedTonyCases(
    prisma,
    { defenceLawyers, victims, policeUnits, availableOperationNames },
    { charges, firstNames, lastNames, pleas, types, complexities, ukCities, documentNames, documentTypes }
  );
  done(tonyCasesCount);

  step("Bruce Banner's cases");
  const bruceCasesCount = await seedBruceCases(
    prisma,
    { defenceLawyers, victims, policeUnits },
    { charges, firstNames, lastNames, pleas, types, complexities, taskNames, ukCities, documentNames, documentTypes }
  );
  done(bruceCasesCount);

  // ─────────────────────────────────────────────────────────────────
  // Tasks
  // ─────────────────────────────────────────────────────────────────
  console.log("\nTasks");

  step("Other users' tasks");
  const { tasksCreated } = await seedOtherUsersTasks(prisma, users, taskNames);
  done(tasksCreated);

  // ─────────────────────────────────────────────────────────────────
  // Activity
  // ─────────────────────────────────────────────────────────────────
  console.log("\nActivity");

  step("Case notes");
  const caseNotesCount = await seedCaseNotes(prisma, users);
  done(caseNotesCount);

  step("Direction notes");
  const directionNotesCount = await seedDirectionNotes(prisma, users);
  done(directionNotesCount);

  step("Activity logs");
  const activityLogsCount = await seedActivityLogs(prisma, createdCases, users);
  done(activityLogsCount);

  step("Recent cases");
  const recentCasesCount = await seedRecentCases(prisma);
  done(recentCasesCount);

  console.log("\n✅ Seed complete\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
