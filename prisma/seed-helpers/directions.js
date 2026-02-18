const { faker } = require('@faker-js/faker');

const prosecutionDirections = [
  { title: 'Special Measures Application', description: 'Prosecution to serve any special measures application by' },
  { title: 'Bad Character Application', description: 'Prosecution to serve any application to put in evidence the Bad Character of (specify defendant) by' },
  { title: 'Service of Case', description: 'Prosecution to serve on the defence and the court the evidence on which they intend to rely by' },
  { title: 'Disclosure', description: 'Prosecution to serve on the defence the unused material by' },
  { title: 'Service of additional evidence', description: 'Prosecution to serve any additional evidence on the defence and the court by' },
  { title: 'Service of CCTV in viewable format', description: 'Prosecution to obtain CCTV in viewable format and serve on the court and the defence by' },
  { title: 'Hearsay Application', description: 'Prosecution to serve any application to admit hearsay evidence by' },
  { title: 'Case Summary/Opening Note', description: 'Prosecution to serve a case summary on the court and the defence' },
  { title: 'Certificate of Trial Readiness', description: 'Prosecution to serve Certificate of Trial Readiness by' }
];

const defenceDirections = [
  { title: 'Service of Defence Statement', description: 'Defence to serve Defence Statement on the prosecution and the court by' },
  { title: 'Defence witness requirements', description: 'Defence to notify to the prosecution and the court their witness requirements by' }
];

function generateDirectionDueDate() {
  const dateChoice = faker.number.float({ min: 0, max: 1 });
  let dueDate;

  if (dateChoice < 0.6) {
    dueDate = faker.date.past({ days: 90 });
    dueDate.setHours(23, 59, 59, 999);
  } else if (dateChoice < 0.7) {
    dueDate = new Date();
    dueDate.setHours(23, 59, 59, 999);
  } else if (dateChoice < 0.8) {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    dueDate.setHours(23, 59, 59, 999);
  } else {
    dueDate = faker.date.soon({ days: 60 });
    dueDate.setHours(23, 59, 59, 999);
  }

  return dueDate;
}

function generateDirection(defendantId) {
  const isProsecution = faker.datatype.boolean({ probability: 0.75 });
  const directionPool = isProsecution ? prosecutionDirections : defenceDirections;
  const direction = faker.helpers.arrayElement(directionPool);
  const assignee = isProsecution ? 'Prosecution' : 'Defence';

  return {
    title: direction.title,
    description: direction.description,
    dueDate: generateDirectionDueDate(),
    completedDate: faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent({ days: 30 }) : null,
    assignee,
    defendantId
  };
}

async function createDirectionsForCase(prisma, caseId, defendantId, count = 1) {
  for (let i = 0; i < count; i++) {
    const directionData = generateDirection(defendantId);
    await prisma.direction.create({
      data: {
        ...directionData,
        caseId
      }
    });
  }
}

module.exports = {
  prosecutionDirections,
  defenceDirections,
  generateDirection,
  createDirectionsForCase
};
