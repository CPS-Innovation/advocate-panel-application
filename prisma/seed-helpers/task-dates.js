const { faker } = require('@faker-js/faker');

// Helper functions for generating task dates in different states
function generatePendingTaskDates() {
  // Pending: all dates in the future
  const reminderDate = faker.date.soon({ days: 14 }); // 0-14 days from now
  const daysUntilDue = faker.number.int({ min: 3, max: 7 });
  const dueDate = new Date(reminderDate);
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  const daysUntilEscalation = faker.number.int({ min: 3, max: 7 });
  const escalationDate = new Date(dueDate);
  escalationDate.setDate(escalationDate.getDate() + daysUntilEscalation);

  reminderDate.setUTCHours(23, 59, 59, 999);
  dueDate.setUTCHours(23, 59, 59, 999);
  escalationDate.setUTCHours(23, 59, 59, 999);

  return { reminderDate, dueDate, escalationDate };
}

function generateDueTaskDates() {
  // Due: reminder date has passed, due date in future
  const daysAgo = faker.number.int({ min: 1, max: 3 });
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() - daysAgo);

  const daysUntilDue = faker.number.int({ min: 2, max: 5 });
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  const daysUntilEscalation = faker.number.int({ min: 3, max: 7 });
  const escalationDate = new Date(dueDate);
  escalationDate.setDate(escalationDate.getDate() + daysUntilEscalation);

  reminderDate.setUTCHours(23, 59, 59, 999);
  dueDate.setUTCHours(23, 59, 59, 999);
  escalationDate.setUTCHours(23, 59, 59, 999);

  return { reminderDate, dueDate, escalationDate };
}

function generateOverdueTaskDates() {
  // Overdue: due date has passed, escalation date in future
  const daysAgo = faker.number.int({ min: 2, max: 7 });
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() - daysAgo - 5);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() - daysAgo);

  const daysUntilEscalation = faker.number.int({ min: 2, max: 5 });
  const escalationDate = new Date();
  escalationDate.setDate(escalationDate.getDate() + daysUntilEscalation);

  reminderDate.setUTCHours(23, 59, 59, 999);
  dueDate.setUTCHours(23, 59, 59, 999);
  escalationDate.setUTCHours(23, 59, 59, 999);

  return { reminderDate, dueDate, escalationDate };
}

function generateEscalatedTaskDates() {
  // Escalated: all dates have passed
  const daysAgo = faker.number.int({ min: 3, max: 10 });
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() - daysAgo - 7);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() - daysAgo - 3);

  const escalationDate = new Date();
  escalationDate.setDate(escalationDate.getDate() - daysAgo);

  reminderDate.setUTCHours(23, 59, 59, 999);
  dueDate.setUTCHours(23, 59, 59, 999);
  escalationDate.setUTCHours(23, 59, 59, 999);

  return { reminderDate, dueDate, escalationDate };
}

module.exports = {
  generatePendingTaskDates,
  generateDueTaskDates,
  generateOverdueTaskDates,
  generateEscalatedTaskDates
};
