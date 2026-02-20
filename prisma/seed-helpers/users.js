const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const predefinedUsers = require('../../app/data/predefined-users.js');
const firstNames = require('../../app/data/first-names.js');
const lastNames = require('../../app/data/last-names.js');

async function seedUsers(prisma) {
  const userData = [...predefinedUsers];

  // Generate 200 Prosecutors
  for (let i = 0; i < 200; i++) {
    const firstName = faker.helpers.arrayElement(firstNames);
    const lastName = faker.helpers.arrayElement(lastNames);
    userData.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.p${i}@example.com`,
      password: 'password123',
      role: 'Prosecutor',
      firstName: firstName,
      lastName: lastName
    });
  }

  // Generate 200 Paralegal officers
  for (let i = 0; i < 200; i++) {
    const firstName = faker.helpers.arrayElement(firstNames);
    const lastName = faker.helpers.arrayElement(lastNames);
    userData.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.po${i}@example.com`,
      password: 'password123',
      role: 'Paralegal officer',
      firstName: firstName,
      lastName: lastName
    });
  }

  // Hash all passwords in parallel
  const hashedUserData = await Promise.all(
    userData.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10)
    }))
  );

  const createdUsers = await prisma.user.createManyAndReturn({
    data: hashedUserData
  });

  // Assign each user to 1-3 random units
  for (const user of createdUsers) {
    let selectedUnits;

    // Rachael Harvey gets specific units
    if (user.firstName === 'Rachael' && user.lastName === 'Harvey') {
      selectedUnits = [3, 4]; // Wessex Crown Court, Wessex RASSO
    } else if (user.firstName === 'Simon' && user.lastName === 'Whatley') {
      selectedUnits = [9, 11, 13, 18]; // North Yorkshire Magistrates Court, South Yorkshire Magistrates Court, West Yorkshire Magistrates Court, Humberside Magistrates Court
    } else if (user.firstName === 'Tony' && user.lastName === 'Stark') {
      selectedUnits = [1, 2, 3, 4, 5, 6, 7]; // All Wessex units: Dorset Magistrates Court, Hampshire Magistrates Court, Wessex Crown Court, Wessex RASSO, Wessex CCU, Wessex Fraud, Wiltshire Magistrates Court
    } else if (user.firstName === 'Kirsty' && user.lastName === 'Priest') {
      selectedUnits = [3]; // Wessex Crown Court
    } else if (user.firstName === 'Bruce' && user.lastName === 'Banner') {
      selectedUnits = [3, 4]; // Wessex Crown Court, Wessex RASSO (same as Rachael for time limit testing)
    } else if (user.firstName === 'Natasha' && user.lastName === 'Rogers') {
      selectedUnits = [1, 2, 3, 4, 5, 6, 7]; // All Wessex units
    } else if (user.firstName === 'Veronica' && user.lastName === 'Mars') {
      selectedUnits = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // All Yorkshire and Humberside units
    } else {
      const numUnits = faker.number.int({ min: 1, max: 3 });
      selectedUnits = faker.helpers.arrayElements(
        Array.from({ length: 18 }, (_, i) => i + 1),
        numUnits
      );
    }

    await prisma.userUnit.createMany({
      data: selectedUnits.map(unitId => ({
        userId: user.id,
        unitId
      }))
    });
  }

  // Refetch users with their units included for later use
  const usersWithUnits = await prisma.user.findMany({
    include: {
      units: true
    }
  });

  return usersWithUnits;
}

module.exports = {
  seedUsers
};
