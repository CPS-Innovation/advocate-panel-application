const { faker } = require('@faker-js/faker');
const { generatePendingTaskDates, generateDueTaskDates, generateOverdueTaskDates, generateEscalatedTaskDates } = require('./task-dates');

// Predefined users with their own dedicated seed files
const USERS_WITH_DEDICATED_SEEDS = [
  'rachael@cps.gov.uk',
  'simon@cps.gov.uk',
  'kirsty@cps.gov.uk',
  'tony@cps.gov.uk',
  'bruce@cps.gov.uk'
];

// Seeds tasks for all users EXCEPT those with dedicated seed files (Rachael, Simon).
// This ensures that when signed in as Rachael/Simon and filtering by other users,
// those users have tasks to display (pending, due, overdue, escalated).

async function seedOtherUsersTasks(prisma, users, taskNames) {
  const otherUsers = users.filter(u => !USERS_WITH_DEDICATED_SEEDS.includes(u.email));

  let tasksCreated = 0;
  let usersProcessed = 0;

  for (const user of otherUsers) {
    const userWithUnits = await prisma.user.findUnique({
      where: { id: user.id },
      include: { units: true }
    });
    const userUnitIds = userWithUnits.units.map(uu => uu.unitId);

    const userCases = await prisma.case.findMany({
      where: {
        unitId: { in: userUnitIds },
        OR: [
          { prosecutors: { some: { userId: user.id } } },
          { paralegalOfficers: { some: { userId: user.id } } }
        ]
      }
    });

    if (userCases.length === 0) continue;

    const targetCase = faker.helpers.arrayElement(userCases);

    const pendingDates = generatePendingTaskDates();
    const dueDates = generateDueTaskDates();
    const overdueDates = generateOverdueTaskDates();
    const escalatedDates = generateEscalatedTaskDates();

    const tasks = [
      {
        name: faker.helpers.arrayElement(taskNames),
        reminderType: null,
        reminderDate: pendingDates.reminderDate,
        dueDate: pendingDates.dueDate,
        escalationDate: pendingDates.escalationDate,
        completedDate: null,
        caseId: targetCase.id,
        assignedToUserId: user.id,
        assignedToTeamId: null,
      },
      {
        name: faker.helpers.arrayElement(taskNames),
        reminderType: null,
        reminderDate: dueDates.reminderDate,
        dueDate: dueDates.dueDate,
        escalationDate: dueDates.escalationDate,
        completedDate: null,
        caseId: targetCase.id,
        assignedToUserId: user.id,
        assignedToTeamId: null,
      },
      {
        name: faker.helpers.arrayElement(taskNames),
        reminderType: null,
        reminderDate: overdueDates.reminderDate,
        dueDate: overdueDates.dueDate,
        escalationDate: overdueDates.escalationDate,
        completedDate: null,
        caseId: targetCase.id,
        assignedToUserId: user.id,
        assignedToTeamId: null,
      },
      {
        name: faker.helpers.arrayElement(taskNames),
        reminderType: null,
        reminderDate: escalatedDates.reminderDate,
        dueDate: escalatedDates.dueDate,
        escalationDate: escalatedDates.escalationDate,
        completedDate: null,
        caseId: targetCase.id,
        assignedToUserId: user.id,
        assignedToTeamId: null,
      }
    ];

    await prisma.task.createMany({ data: tasks });

    tasksCreated += tasks.length;
    usersProcessed++;
  }

  return { tasksCreated, usersProcessed };
}

module.exports = {
  seedOtherUsersTasks
};
