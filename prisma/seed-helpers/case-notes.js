const { faker } = require('@faker-js/faker');

async function seedCaseNotes(prisma, users) {
  // Fetch all cases and add notes to 30% of them
  const allCases = await prisma.case.findMany();
  let caseNotesCreated = 0;
  let casesWithNotes = 0;

  for (const _case of allCases) {
    // 30% chance this case gets notes
    if (faker.datatype.boolean({ probability: 0.3 })) {
      const numNotes = faker.number.int({ min: 1, max: 3 });

      for (let n = 0; n < numNotes; n++) {
        const randomUser = faker.helpers.arrayElement(users);
        await prisma.note.create({
          data: {
            content: faker.lorem.sentences(2),
            caseId: _case.id,
            userId: randomUser.id,
            createdAt: faker.date.recent({ days: 30 })
          }
        });
        caseNotesCreated++;
      }
      casesWithNotes++;
    }
  }

  return caseNotesCreated;
}

module.exports = {
  seedCaseNotes
};
