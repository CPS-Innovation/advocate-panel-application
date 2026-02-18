const { faker } = require('@faker-js/faker');

// Generate PACE clock between yesterday and 24 hours from now
function generatePACEClock() {
  const hoursFromNow = faker.number.int({ min: -24, max: 24 });
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d;
}

// Generate PACE clock that expired 1-12 hours ago
function getOverduePACEClock() {
  const hoursAgo = faker.number.int({ min: 1, max: 12 });
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

// Generate PACE clock expiring within next 6 hours
function getTodayPACEClock() {
  const hoursFromNow = faker.number.int({ min: 1, max: 6 });
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d;
}

// Generate PACE clock that expired 1-12 hours ago
function generateExpiredPACE() {
  const hoursAgo = faker.number.int({ min: 1, max: 12 });
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

// Generate PACE clock expiring in less than 1 hour (10-59 minutes)
function generateLessThan1HourPACE() {
  const minutesFromNow = faker.number.int({ min: 10, max: 59 });
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return d;
}

// Generate PACE clock expiring in 1-2 hours (60-119 minutes)
function generateLessThan2HoursPACE() {
  const minutesFromNow = faker.number.int({ min: 60, max: 119 });
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return d;
}

// Generate PACE clock expiring in 2-3 hours (120-179 minutes)
function generateLessThan3HoursPACE() {
  const minutesFromNow = faker.number.int({ min: 120, max: 179 });
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return d;
}

// Generate PACE clock expiring in more than 3 hours (3-24 hours)
function generateMoreThan3HoursPACE() {
  const hoursFromNow = faker.number.int({ min: 3, max: 24 });
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d;
}

module.exports = {
  generatePACEClock,
  getOverduePACEClock,
  getTodayPACEClock,
  generateExpiredPACE,
  generateLessThan1HourPACE,
  generateLessThan2HoursPACE,
  generateLessThan3HoursPACE,
  generateMoreThan3HoursPACE
};
