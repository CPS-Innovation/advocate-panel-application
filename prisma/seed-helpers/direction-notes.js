const { faker } = require('@faker-js/faker');

async function seedDirectionNotes(prisma, users) {
  // Fetch all directions and add notes to 30% of them
  const allDirections = await prisma.direction.findMany();
  let directionNotesCreated = 0;
  let directionsWithNotes = 0;

  for (const direction of allDirections) {
    // 30% chance this direction gets notes
    if (faker.datatype.boolean({ probability: 0.3 })) {
      const numNotes = faker.number.int({ min: 1, max: 3 });

      for (let n = 0; n < numNotes; n++) {
        const randomUser = faker.helpers.arrayElement(users);
        await prisma.directionNote.create({
          data: {
            description: faker.lorem.sentences(2),
            directionId: direction.id,
            userId: randomUser.id,
            createdAt: faker.date.recent({ days: 30 })
          }
        });
        directionNotesCreated++;
      }
      directionsWithNotes++;
    }
  }

  return directionNotesCreated;
}

module.exports = {
  seedDirectionNotes
};
