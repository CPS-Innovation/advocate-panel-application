async function seedPoliceUnits(prisma) {
  const policeUnitNames = [
    'Metropolitan Police',
    'West Midlands Police',
    'Greater Manchester Police',
    'Thames Valley Police',
    'Kent Police',
    'Essex Police',
    'Hampshire Constabulary',
    'West Yorkshire Police',
    'Surrey Police',
    'Sussex Police',
    'Merseyside Police',
    'Hertfordshire Constabulary'
  ];

  const policeUnits = [];

  for (const name of policeUnitNames) {
    const policeUnit = await prisma.policeUnit.create({
      data: { name }
    });
    policeUnits.push(policeUnit);
  }

  return policeUnits;
}

module.exports = { seedPoliceUnits };
