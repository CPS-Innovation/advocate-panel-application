const { faker } = require('@faker-js/faker');

// Generate STL between yesterday and 6 months (180 days) from now
function generateSTL() {
  const daysFromNow = faker.number.int({ min: -1, max: 180 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expired 1-7 days ago
function getOverdueSTL() {
  const daysAgo = faker.number.int({ min: 1, max: 7 });
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL expiring within next 7 days
function getUpcomingSTL() {
  const daysFromNow = faker.number.int({ min: 1, max: 7 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expired 1-7 days ago
function generateExpiredSTL() {
  const daysAgo = faker.number.int({ min: 1, max: 7 });
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expires today
function generateTodaySTL() {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expires tomorrow
function generateTomorrowSTL() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expires this week (2-7 days from now)
function generateThisWeekSTL() {
  const daysFromNow = faker.number.int({ min: 2, max: 7 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expires next week (8-14 days from now)
function generateNextWeekSTL() {
  const daysFromNow = faker.number.int({ min: 8, max: 14 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Generate STL that expires later (15-180 days from now)
function generateLaterSTL() {
  const daysFromNow = faker.number.int({ min: 15, max: 180 });
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

module.exports = {
  generateSTL,
  getOverdueSTL,
  getUpcomingSTL,
  generateExpiredSTL,
  generateTodaySTL,
  generateTomorrowSTL,
  generateThisWeekSTL,
  generateNextWeekSTL,
  generateLaterSTL
};
