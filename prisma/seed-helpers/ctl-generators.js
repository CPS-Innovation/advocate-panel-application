const { faker } = require('@faker-js/faker');

// Generate CTL between yesterday and 120 days from now
function generateCTL() {
  const daysFromNow = faker.number.int({ min: -1, max: 120 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate CTL that expired 1-7 days ago
function generateExpiredCTL() {
  const daysAgo = faker.number.int({ min: 1, max: 7 });
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate CTL that expires today
function generateTodayCTL() {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate CTL that expires tomorrow
function generateTomorrowCTL() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate CTL that expires this week (2-7 days from now)
function generateThisWeekCTL() {
  const daysFromNow = faker.number.int({ min: 2, max: 7 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate CTL that expires next week (8-14 days from now)
function generateNextWeekCTL() {
  const daysFromNow = faker.number.int({ min: 8, max: 14 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate CTL that expires later (15-120 days from now)
function generateLaterCTL() {
  const daysFromNow = faker.number.int({ min: 15, max: 120 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

module.exports = {
  generateCTL,
  generateExpiredCTL,
  generateTodayCTL,
  generateTomorrowCTL,
  generateThisWeekCTL,
  generateNextWeekCTL,
  generateLaterCTL
};
