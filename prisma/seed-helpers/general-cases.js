const { faker } = require('@faker-js/faker');
const { generateCaseReference } = require('./identifiers');
const { generateUKMobileNumber, generateUKLandlineNumber, generateUKPhoneNumber } = require('./phone-numbers');
const { futureDateAtHearingTime } = require('./dates');
const { generatePendingTaskDates, generateDueTaskDates, generateOverdueTaskDates, generateEscalatedTaskDates } = require('./task-dates');
const { prosecutionDirections, defenceDirections } = require('./directions');

async function seedGeneralCases(prisma, dependencies, config) {
  const {
    users,
    prosecutors,
    defendants,
    victims,
    policeUnits,
    ctlDefendants,
    stlDefendants,
    paceDefendants
  } = dependencies;

  const {
    totalCases,
    unassignedTarget,
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
  } = config;

  const createdCases = [];

  const usersWithDedicatedSeeds = [
    'rachael@cps.gov.uk',
    'simon@cps.gov.uk',
    'kirsty@cps.gov.uk',
    'tony@cps.gov.uk',
    'bruce@cps.gov.uk',
    'natasha@cps.gov.uk'
  ];

  for (let i = 0; i < totalCases; i++) {
    // Randomly choose which time limit type this case will have
    const timeLimitType = faker.helpers.arrayElement(['CTL', 'STL', 'PACE']);

    // Select defendants ONLY from the appropriate pool
    // This ensures no mixing of time limit types within a case
    let defendantPool;
    if (timeLimitType === 'CTL' && ctlDefendants.length > 0) {
      defendantPool = ctlDefendants;
    } else if (timeLimitType === 'STL' && stlDefendants.length > 0) {
      defendantPool = stlDefendants;
    } else if (timeLimitType === 'PACE' && paceDefendants.length > 0) {
      defendantPool = paceDefendants;
    } else {
      // Fallback to any non-empty pool
      defendantPool = ctlDefendants.length > 0 ? ctlDefendants :
                      stlDefendants.length > 0 ? stlDefendants :
                      paceDefendants.length > 0 ? paceDefendants :
                      defendants;
    }

    const assignedDefendants = faker.helpers.arrayElements(
      defendantPool,
      faker.number.int({ min: 1, max: 3 })
    );
    const assignedVictims = faker.helpers.arrayElements(
      victims,
      faker.number.int({ min: 1, max: 3 })
    );

    const caseUnitId = faker.number.int({ min: 1, max: 18 });

    // Pick between 0 and 5 unique standard task names
    const numStandardTasks = faker.number.int({ min: 0, max: 5 });
    const chosenTaskNames = faker.helpers.arrayElements(taskNames, numStandardTasks);

    // Add 0 to 2 reminder tasks (with manual-style descriptions)
    const numReminderTasks = faker.number.int({ min: 0, max: 2 });
    const reminderTasks = [];
    for (let r = 0; r < numReminderTasks; r++) {
      // 80% standard reminder, 20% asset recovery reminder
      const reminderType = faker.datatype.boolean({ probability: 0.8 }) ? 'Standard' : 'Asset recovery';

      // Generate longer description for reminder tasks (like manual tasks)
      // 25% chance of long name, 75% chance of short name
      const useLongName = faker.datatype.boolean({ probability: 0.25 });
      const name = useLongName
        ? faker.helpers.arrayElement(manualTaskNamesLong)
        : faker.helpers.arrayElement(manualTaskNamesShort);

      reminderTasks.push({ name, reminderType });
    }

    const allTasks = [
      ...chosenTaskNames.map(name => ({ name, reminderType: null })),
      ...reminderTasks
    ];

    const tasksData = allTasks.map((taskInfo) => {
      const { name, reminderType } = taskInfo;

      const eligibleUsers = users.filter(u => !usersWithDedicatedSeeds.includes(u.email));
      const assignedToUserId = faker.helpers.arrayElement(eligibleUsers).id;

      // Generate task dates based on random state
      // 40% pending, 30% due, 20% overdue, 10% escalated
      const stateType = faker.helpers.weightedArrayElement([
        { weight: 40, value: 'pending' },
        { weight: 30, value: 'due' },
        { weight: 20, value: 'overdue' },
        { weight: 10, value: 'escalated' }
      ]);

      let dates;
      switch (stateType) {
        case 'pending':
          dates = generatePendingTaskDates();
          break;
        case 'due':
          dates = generateDueTaskDates();
          break;
        case 'overdue':
          dates = generateOverdueTaskDates();
          break;
        case 'escalated':
          dates = generateEscalatedTaskDates();
          break;
      }

      // 5% chance task is completed
      const completedDate = faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent({ days: 30 }) : null;

      // 30% chance task is urgent
      const isUrgent = faker.datatype.boolean({ probability: 0.30 });
      const urgentNote = isUrgent ? faker.helpers.arrayElement([
        'This task requires immediate attention due to upcoming court hearing.',
        'Defendant is in custody and custody time limit is approaching.',
        'Critical evidence needs to be reviewed urgently.',
        'Urgent request from senior prosecutor.',
        'Time-sensitive matter requiring immediate action.',
        'Witness availability is limited and needs urgent contact.'
      ]) : null;

      return {
        name,
        reminderType,
        reminderDate: dates.reminderDate,
        dueDate: dates.dueDate,
        escalationDate: dates.escalationDate,
        completedDate,
        isUrgent,
        urgentNote,
        assignedToUserId,
      };
    });

    // Pick between 5 and 15 documents
    const numDocuments = faker.number.int({ min: 5, max: 15 });
    const documentsData = [];
    for (let d = 0; d < numDocuments; d++) {
      const baseName = faker.helpers.arrayElement(documentNames);
      const name = `${baseName} ${d + 1}`;
      documentsData.push({
        name,
        description: faker.helpers.arrayElement(['This is a random description', 'This is another random description', faker.lorem.sentence()]),
        type: faker.helpers.arrayElement(documentTypes),
        size: faker.number.int({ min: 50, max: 5000 }),
      });
    }

    // Generate 0-5 directions per case
    const numDirections = faker.number.int({ min: 0, max: 5 });
    const directionsData = [];

    for (let dir = 0; dir < numDirections; dir++) {
      // 75% prosecution directions, 25% defence directions
      const isProsecution = faker.datatype.boolean({ probability: 0.75 });
      const directionPool = isProsecution ? prosecutionDirections : defenceDirections;
      const direction = faker.helpers.arrayElement(directionPool);
      const assignee = isProsecution ? 'Prosecution' : 'Defence';

      // Generate due date: 60% overdue, 20% today/tomorrow, 20% future
      const dateChoice = faker.number.float({ min: 0, max: 1 });
      let dueDate;

      if (dateChoice < 0.6) {
        // Overdue - 1 to 90 days in the past
        dueDate = faker.date.past({ days: 90 });
        dueDate.setHours(23, 59, 59, 999);
      } else if (dateChoice < 0.7) {
        // Due today
        dueDate = new Date();
        dueDate.setHours(23, 59, 59, 999);
      } else if (dateChoice < 0.8) {
        // Due tomorrow
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        dueDate.setHours(23, 59, 59, 999);
      } else {
        // Future - 2 to 60 days ahead
        dueDate = faker.date.soon({ days: 60 });
        dueDate.setHours(23, 59, 59, 999);
      }

      // 5% chance direction is already completed
      const completedDate = faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent({ days: 30 }) : null;

      // Always assign to a specific defendant from this case
      const defendantId = assignedDefendants.length > 0
        ? faker.helpers.arrayElement(assignedDefendants).id
        : null;

      directionsData.push({
        title: direction.title,
        description: direction.description,
        dueDate,
        completedDate,
        assignee,
        defendantId
      });
    }

    const createdCase = await prisma.case.create({
      data: {
        reference: generateCaseReference(),
        type: faker.helpers.arrayElement(types),
        complexity: faker.helpers.arrayElement(complexities),
        unit: { connect: { id: caseUnitId } },
        policeUnit: { connect: { id: faker.helpers.arrayElement(policeUnits).id } },
        defendants: { connect: assignedDefendants.map((d) => ({ id: d.id })) },
        victims: { connect: assignedVictims.map((v) => ({ id: v.id })) },
        location: {
          create: {
            name: faker.company.name(),
            line1: faker.location.streetAddress(),
            line2: faker.location.secondaryAddress(),
            town: faker.helpers.arrayElement(ukCities),
            postcode: faker.location.zipCode("WD# #SF"),
          },
        },
        tasks: {
          createMany: {
            data: tasksData,
          },
        },
        directions: {
          createMany: {
            data: directionsData,
          },
        },
        documents: {
          createMany: {
            data: documentsData,
          },
        },
      },
    });

    // Assign prosecutors to case
    // Use UNASSIGNED_TARGET to determine how many cases should remain unassigned
    const unassignedProbability = unassignedTarget / totalCases;
    const shouldAssignProsecutor = faker.number.float({ min: 0, max: 1 }) >= unassignedProbability;

    if (shouldAssignProsecutor) {
      // 99% get 1 prosecutor, 1% get 2-3
      const prosecutorAssignmentChoice = faker.number.float({ min: 0, max: 1 });
      const numProsecutors = prosecutorAssignmentChoice < 0.99 ? 1 : faker.number.int({ min: 2, max: 3 });

      // Get prosecutors from this case's unit, excluding those with dedicated seed files
      const unitProsecutors = prosecutors.filter(p =>
        p.units.some(uu => uu.unitId === caseUnitId) &&
        !usersWithDedicatedSeeds.includes(p.email)
      );

      if (unitProsecutors.length > 0) {
        const assignedProsecutors = faker.helpers.arrayElements(unitProsecutors, Math.min(numProsecutors, unitProsecutors.length));
        for (const prosecutor of assignedProsecutors) {
          await prisma.caseProsecutor.create({
            data: {
              caseId: createdCase.id,
              userId: prosecutor.id
            }
          });
        }
      }
    }

    // Assign paralegal officers to case
    // 80% get assigned (99% of those get 1, 1% get 2), 20% remain unassigned
    const shouldAssignParalegal = faker.number.float({ min: 0, max: 1 }) >= 0.20;

    if (shouldAssignParalegal) {
      const paralegalAssignmentChoice = faker.number.float({ min: 0, max: 1 });
      const numParalegals = paralegalAssignmentChoice < 0.99 ? 1 : 2;

      // Get paralegal officers from this case's unit, excluding those with dedicated seed files
      const unitParalegals = users.filter(u =>
        u.role === 'Paralegal officer' &&
        u.units.some(uu => uu.unitId === caseUnitId) &&
        !usersWithDedicatedSeeds.includes(u.email)
      );

      if (unitParalegals.length > 0) {
        const assignedParalegals = faker.helpers.arrayElements(unitParalegals, Math.min(numParalegals, unitParalegals.length));
        for (const paralegal of assignedParalegals) {
          await prisma.caseParalegalOfficer.create({
            data: {
              caseId: createdCase.id,
              userId: paralegal.id
            }
          });
        }
      }
    }

    // -------------------- Hearings --------------------
    // 50% of cases have 1 hearing, 50% have none
    const hasHearing = faker.datatype.boolean();

    if (hasHearing) {
      const hearingStatus = faker.helpers.arrayElement(['Fixed', 'Warned', 'Estimated']);
      const hearingType = 'First hearing';
      const hearingVenue = faker.helpers.arrayElement(venues);

      // Distribution: 40% today, 40% tomorrow, 20% future dates
      const dateChoice = faker.number.float({ min: 0, max: 1 });
      let hearingStartDate;

      const hearingHour = faker.helpers.arrayElement([10, 11, 12]);

      if (dateChoice < 0.4) {
        hearingStartDate = new Date();
        hearingStartDate.setUTCHours(hearingHour, 0, 0, 0);
      } else if (dateChoice < 0.8) {
        hearingStartDate = new Date();
        hearingStartDate.setDate(hearingStartDate.getDate() + 1);
        hearingStartDate.setUTCHours(hearingHour, 0, 0, 0);
      } else {
        hearingStartDate = futureDateAtHearingTime();
      }

      // 10% chance of multi-day hearing (has endDate)
      const isMultiDay = faker.datatype.boolean({ probability: 0.10 });
      const hearingEndDate = isMultiDay
        ? new Date(hearingStartDate.getTime() + (faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000))
        : null;

      if (hearingEndDate) {
        hearingEndDate.setUTCHours(16, 0, 0, 0); // End at 4pm
      }

      await prisma.hearing.create({
        data: {
          startDate: hearingStartDate,
          endDate: hearingEndDate,
          status: hearingStatus,
          type: hearingType,
          venue: hearingVenue,
          caseId: createdCase.id
        }
      });
    }

    // -------------------- Witnesses --------------------
    const numWitnesses = faker.number.int({ min: 1, max: 7 });
    for (let w = 0; w < numWitnesses; w++) {
      // Generate witness types with realistic distribution (most have 0-3 types)
      const allTypes = [
        "isVictim",
        "isKeyWitness",
        "isChild",
        "isExpert",
        "isInterpreter",
        "isPolice",
        "isProfessional",
        "isPrisoner",
        "isVulnerable",
        "isIntimidated"
      ];

      // Weighted selection for number of types (most witnesses have 0-3)
      const numTypesWeighted = faker.helpers.weightedArrayElement([
        { weight: 30, value: 0 },
        { weight: 30, value: 1 },
        { weight: 25, value: 2 },
        { weight: 10, value: 3 },
        { weight: 4, value: 4 },
        { weight: 1, value: 5 }
      ]);

      // Select random types
      const selectedTypes = faker.helpers.arrayElements(allTypes, numTypesWeighted);

      // Build witness type object (all false by default, then set selected to true)
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

      // Randomly assign dcf (50/50 split between new and old architecture)
      const isDcf = faker.datatype.boolean();

      const createdWitness = await prisma.witness.create({
        data: {
          title: faker.helpers.arrayElement([null, "Mr", "Mrs", "Ms", "Dr", "Prof"]),
          firstName: faker.helpers.arrayElement(firstNames),
          lastName: faker.helpers.arrayElement(lastNames),
          dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: "age" }),
          gender: faker.helpers.arrayElement(["Male", "Female", "Unknown"]),
          ethnicity: faker.helpers.arrayElement([
            null,
            "White",
            "Asian_or_Asian_British",
            "Black_or_Black_British",
            "Mixed",
            "Other",
            "Prefer_not_to_say"
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
          attendanceIssues: faker.helpers.arrayElement([
            null,
            faker.lorem.sentence(),
          ]),
          previousTransgressions: faker.helpers.arrayElement([
            null,
            faker.lorem.sentence(),
          ]),
          wasWarned: faker.datatype.boolean(),
          dcf: isDcf,
          // Only set availability fields if dcf = true (new architecture)
          courtAvailabilityStartDate: isDcf ? faker.date.future() : null,
          courtAvailabilityEndDate: isDcf ? faker.date.future() : null,
          // Only set victim fields if witness is a victim
          victimCode: witnessTypes.isVictim ? "Learning disabilities" : null,
          victimExplained: witnessTypes.isVictim ? faker.datatype.boolean() : null,
          victimOfferResponse: witnessTypes.isVictim ? faker.helpers.arrayElement(["Not offered", "Declined", "Accepted"]) : null,
          caseId: createdCase.id,
        },
      });

      const numStatements = faker.number.int({ min: 1, max: 5 });
      for (let s = 0; s < numStatements; s++) {
        await prisma.witnessStatement.create({
          data: {
            witnessId: createdWitness.id,
            number: s + 1,
            receivedDate: faker.date.past(),
            isUsedAsEvidence: faker.helpers.arrayElement([true, false, null]),
            isMarkedAsSection9: faker.helpers.arrayElement([true, false, null]),
          },
        });
      }

      // Create special measures if dcf = true (65% get 1, 10% get 2, 25% get 0)
      if (isDcf) {
        const numSpecialMeasures = faker.helpers.weightedArrayElement([
          { weight: 65, value: 1 },
          { weight: 10, value: 2 },
          { weight: 25, value: 0 }
        ]);

        const specialMeasureTypes = [
          "Screen Witness",
          "Pre-recorded Cross-examination (s.28)",
          "Evidence by Live Link",
          "Evidence in Private",
          "Removal of Wigs and Gowns",
          "Visually Recorded Interview",
          "Intermediary",
          "Aids to Communication"
        ];

        const meetingUrls = [
          "https://teams.microsoft.com/l/meetup-join/19%3ameeting_example123",
          "https://zoom.us/j/1234567890",
          "https://meet.google.com/abc-defg-hij"
        ];

        // Select unique types for this witness
        const selectedTypes = faker.helpers.arrayElements(specialMeasureTypes, numSpecialMeasures);

        for (let sm = 0; sm < numSpecialMeasures; sm++) {
          const requiresMeeting = faker.datatype.boolean();

          await prisma.specialMeasure.create({
            data: {
              witnessId: createdWitness.id,
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
    }

    // -------------------- Notes --------------------
    // Add 0-3 notes to each case
    const numNotes = faker.number.int({ min: 0, max: 3 });
    for (let n = 0; n < numNotes; n++) {
      const noteContent = faker.helpers.arrayElement([
        "Spoke with the defendant's solicitor today. They are requesting additional time to review the evidence.",
        "Witness availability confirmed for the trial dates. All key witnesses will be present.",
        "Discussed the case with senior prosecutor. Agreed to pursue the more serious charge given the strength of evidence.",
        "Received updated forensic report. Results support our case significantly.",
        "Defense has indicated they may be willing to accept a plea deal. Awaiting formal proposal.",
        "Victim personal statement received and added to case file. Very compelling account.",
        "Court liaison confirmed hearing room availability. No conflicts with trial dates.",
        "Expert witness has reviewed the materials and confirmed availability to testify.",
        "Defense disclosure received today. Need to review carefully before next hearing.",
        "Case complexity assessment completed. Recommend upgrading to Level 4.",
        "Brief prepared for counsel. All materials compiled and sent electronically.",
        "Spoke with investigating officer. Additional evidence may be available from digital forensics.",
        "Victim expressed concerns about giving evidence in open court. Discussing special measures options.",
        "Received confirmation that all exhibits are properly logged and secured.",
        "Case conference scheduled for next week to discuss trial strategy with team."
      ]);

      await prisma.note.create({
        data: {
          content: noteContent,
          caseId: createdCase.id,
          userId: faker.helpers.arrayElement(users).id
        }
      });
    }

    // -------------------- Task Notes --------------------
    // Get all tasks for this case
    const caseTasks = await prisma.task.findMany({
      where: { caseId: createdCase.id }
    });

    for (const task of caseTasks) {
      // 25% no notes, 50% 1 note, 25% 3 notes
      const noteCountChoice = faker.helpers.weightedArrayElement([
        { weight: 25, value: 0 },
        { weight: 50, value: 1 },
        { weight: 25, value: 3 }
      ]);

      for (let n = 0; n < noteCountChoice; n++) {
        const description = faker.helpers.arrayElement(taskNoteDescriptions);

        // Create notes with timestamps spread out over the past
        const daysAgo = faker.number.int({ min: 1, max: 30 });
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        const randomUser = faker.helpers.arrayElement(users);

        await prisma.taskNote.create({
          data: {
            description,
            taskId: task.id,
            userId: randomUser.id,
            createdAt,
            updatedAt: createdAt
          }
        });
      }
    }

    createdCases.push({ id: createdCase.id });
  }

  return createdCases;
}

module.exports = {
  seedGeneralCases
};
