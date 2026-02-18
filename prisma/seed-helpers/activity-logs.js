const { faker } = require('@faker-js/faker');

// Constants
const witnessNotAppearingReasons = [
  "Witness is ill and unable to attend",
  "Witness has moved abroad",
  "Witness is unavailable due to work commitments",
  "Witness has refused to attend",
  "Witness cannot be located",
  "Witness is intimidated and unwilling to testify",
  "Witness has conflicting court appearance",
  "Witness has withdrawn cooperation"
];

// Helper: Build context with pre-fetched data
async function buildCaseContext(prisma, fullCase) {
  // Fetch tasks with notes (once, not per event)
  const tasksWithNotes = await prisma.task.findMany({
    where: {
      caseId: fullCase.id,
      notes: { some: {} }
    },
    include: {
      notes: true
    }
  });

  // Fetch directions with notes (once, not per event)
  const directionsWithNotes = await prisma.direction.findMany({
    where: {
      caseId: fullCase.id,
      notes: { some: {} }
    },
    include: {
      notes: true
    }
  });

  // Fetch case notes (once, not per event)
  const caseNotes = await prisma.note.findMany({
    where: {
      caseId: fullCase.id
    }
  });

  // Pre-compute derived data
  const witnessesWithStatements = fullCase.witnesses?.filter(w => w.statements.length > 0) || [];

  return {
    fullCase,
    tasksWithNotes,
    directionsWithNotes,
    caseNotes,
    witnessesWithStatements
  };
}

// Helper: Determine possible events based on context
function getPossibleEvents(context) {
  const possible = [];

  if (context.fullCase.prosecutors && context.fullCase.prosecutors.length > 0) {
    possible.push('Prosecutor assigned');
  }

  if (context.fullCase.witnesses && context.fullCase.witnesses.length > 0) {
    possible.push('Witness marked as required to attend court');
    possible.push('Witness marked as not required to attend court');
  }

  if (context.witnessesWithStatements.length > 0) {
    possible.push('Witness statement marked as Section 9');
    possible.push('Witness statement unmarked as Section 9');
  }

  if (context.tasksWithNotes.length > 0) {
    possible.push('Task note added');
  }

  if (context.directionsWithNotes.length > 0) {
    possible.push('Direction note added');
  }

  if (context.caseNotes.length > 0) {
    possible.push('Case note added');
  }

  return possible;
}

// Event generators: One function per event type
const eventGenerators = {
  'Prosecutor assigned': (context, randomUser, eventDate) => {
    const prosecutorAssignment = faker.helpers.arrayElement(context.fullCase.prosecutors);
    const prosecutor = prosecutorAssignment.user;

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'UPDATE',
      title: 'Prosecutor assigned',
      model: 'Case',
      recordId: context.fullCase.id,
      createdAt: eventDate,
      meta: {
        prosecutor: {
          id: prosecutor.id,
          firstName: prosecutor.firstName,
          lastName: prosecutor.lastName
        }
      }
    };
  },

  'Witness marked as required to attend court': (context, randomUser, eventDate) => {
    const witness = faker.helpers.arrayElement(context.fullCase.witnesses);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'UPDATE',
      title: 'Witness marked as required to attend court',
      model: 'Witness',
      recordId: witness.id,
      createdAt: eventDate,
      meta: {
        witness: {
          id: witness.id,
          firstName: witness.firstName,
          lastName: witness.lastName
        }
      }
    };
  },

  'Witness marked as not required to attend court': (context, randomUser, eventDate) => {
    const witness = faker.helpers.arrayElement(context.fullCase.witnesses);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'UPDATE',
      title: 'Witness marked as not required to attend court',
      model: 'Witness',
      recordId: witness.id,
      createdAt: eventDate,
      meta: {
        witness: {
          id: witness.id,
          firstName: witness.firstName,
          lastName: witness.lastName
        },
        reason: faker.helpers.arrayElement(witnessNotAppearingReasons)
      }
    };
  },

  'Witness statement marked as Section 9': (context, randomUser, eventDate) => {
    const witness = faker.helpers.arrayElement(context.witnessesWithStatements);
    const statement = faker.helpers.arrayElement(witness.statements);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'UPDATE',
      title: 'Witness statement marked as Section 9',
      model: 'WitnessStatement',
      recordId: statement.id,
      createdAt: eventDate,
      meta: {
        witnessStatement: {
          id: statement.id,
          number: statement.number
        },
        witness: {
          id: witness.id,
          firstName: witness.firstName,
          lastName: witness.lastName
        }
      }
    };
  },

  'Witness statement unmarked as Section 9': (context, randomUser, eventDate) => {
    const witness = faker.helpers.arrayElement(context.witnessesWithStatements);
    const statement = faker.helpers.arrayElement(witness.statements);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'UPDATE',
      title: 'Witness statement unmarked as Section 9',
      model: 'WitnessStatement',
      recordId: statement.id,
      createdAt: eventDate,
      meta: {
        witnessStatement: {
          id: statement.id,
          number: statement.number
        },
        witness: {
          id: witness.id,
          firstName: witness.firstName,
          lastName: witness.lastName
        }
      }
    };
  },

  'Task note added': (context, randomUser, eventDate) => {
    const task = faker.helpers.arrayElement(context.tasksWithNotes);
    const note = faker.helpers.arrayElement(task.notes);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'CREATE',
      title: 'Task note added',
      model: 'TaskNote',
      recordId: note.id,
      createdAt: eventDate,
      meta: {
        task: {
          id: task.id,
          name: task.name
        },
        description: note.description
      }
    };
  },

  'Direction note added': (context, randomUser, eventDate) => {
    const direction = faker.helpers.arrayElement(context.directionsWithNotes);
    const note = faker.helpers.arrayElement(direction.notes);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'CREATE',
      title: 'Direction note added',
      model: 'DirectionNote',
      recordId: note.id,
      createdAt: eventDate,
      meta: {
        direction: {
          id: direction.id,
          description: direction.description
        },
        description: note.description
      }
    };
  },

  'Case note added': (context, randomUser, eventDate) => {
    const note = faker.helpers.arrayElement(context.caseNotes);

    return {
      userId: randomUser.id,
      caseId: context.fullCase.id,
      action: 'CREATE',
      title: 'Case note added',
      model: 'Note',
      recordId: note.id,
      createdAt: eventDate,
      meta: {
        content: note.content
      }
    };
  }
};

// Main seeding function
async function seedActivityLogs(prisma, cases, users) {
  // Select ~50% of cases to have activity logs
  const casesForActivity = faker.helpers.arrayElements(
    cases,
    Math.floor(cases.length * 0.5)
  );

  let totalActivityLogs = 0;

  for (const caseRef of casesForActivity) {
    // Fetch the full case with relations (ONCE per case)
    const fullCase = await prisma.case.findUnique({
      where: { id: caseRef.id },
      include: {
        prosecutors: {
          include: { user: true }
        },
        dga: true,
        witnesses: {
          include: {
            statements: true
          }
        }
      }
    });

    // Build context with pre-fetched data (3 queries, not 3*numEvents)
    const context = await buildCaseContext(prisma, fullCase);

    // Determine possible events based on context
    const possibleEvents = getPossibleEvents(context);
    if (possibleEvents.length === 0) continue;

    // Generate 1-6 events per case
    const numEvents = faker.number.int({ min: 1, max: 6 });

    // Generate chronologically sorted dates (over the last 6 months)
    const baseDates = [];
    for (let i = 0; i < numEvents; i++) {
      baseDates.push(faker.date.past({ years: 0.5 }));
    }
    baseDates.sort((a, b) => a - b);

    // Generate events
    const eventsToCreate = [];
    for (let i = 0; i < numEvents; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const eventDate = baseDates[i];
      const eventType = faker.helpers.arrayElement(possibleEvents);

      // Use generator function to create event data
      const generator = eventGenerators[eventType];
      const eventData = generator(context, randomUser, eventDate);

      eventsToCreate.push(eventData);
    }

    // Create all events for this case
    for (const eventData of eventsToCreate) {
      await prisma.activityLog.create({
        data: eventData
      });
      totalActivityLogs++;
    }
  }

  return totalActivityLogs;
}

module.exports = {
  seedActivityLogs
};
