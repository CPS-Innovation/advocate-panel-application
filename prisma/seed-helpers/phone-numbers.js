const { faker } = require('@faker-js/faker');

function generateUKMobileNumber() {
  // UK mobile numbers: 07 + 9 digits (07XXXXXXXXX)
  return `07${faker.string.numeric(9)}`;
}

function generateUKLandlineNumber() {
  // Mix of geographic (01XXX XXXXXX) and major city (020 XXXX XXXX) numbers
  const type = faker.helpers.arrayElement(['geographic', 'london', 'major']);

  if (type === 'london') {
    // London: 020 + 8 digits
    return `020${faker.string.numeric(8)}`;
  } else if (type === 'major') {
    // Major cities (Manchester 0161, Birmingham 0121, etc.): 01XX + 7 digits
    const areaCode = faker.helpers.arrayElement(['0161', '0121', '0131', '0141', '0113', '0114', '0117', '0151']);
    return `${areaCode}${faker.string.numeric(7)}`;
  } else {
    // Geographic: 01XXX + 6 digits
    return `01${faker.string.numeric(3)}${faker.string.numeric(6)}`;
  }
}

function generateUKPhoneNumber() {
  // Mix of mobile and landline for general phone numbers
  return faker.helpers.arrayElement([generateUKMobileNumber(), generateUKLandlineNumber()]);
}

module.exports = {
  generateUKMobileNumber,
  generateUKLandlineNumber,
  generateUKPhoneNumber
};
