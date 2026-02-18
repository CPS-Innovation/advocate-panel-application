async function getDefendantTimeLimitTypes(defendants, prisma) {
  const timeLimitTypes = [];

  for (const defendant of defendants) {
    // Fetch charges for this defendant
    const charges = await prisma.charge.findMany({
      where: { defendantId: defendant.id }
    });

    // Determine time limit type based on which fields are set
    let type = null;

    if (charges.some(c => c.custodyTimeLimit !== null)) {
      type = 'CTL';
    } else if (charges.some(c => c.statutoryTimeLimit !== null)) {
      type = 'STL';
    } else if (defendant.paceClock !== null) {
      type = 'PACE';
    }

    timeLimitTypes.push(type);
  }

  return timeLimitTypes;
}

module.exports = {
  getDefendantTimeLimitTypes
};
