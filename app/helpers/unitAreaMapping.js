/**
 * Gets the area for a unit by unit ID
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} unitId - Unit ID
 * @returns {Promise<string|null>} Area name or null if not found
 */
async function getAreaForUnit(prisma, unitId) {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { area: true }
  });
  return unit?.area?.name || null;
}

/**
 * Gets all available CMS areas from the database
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Area[]>} Array of area objects
 */
async function getAllAreas(prisma) {
  return await prisma.area.findMany({
    orderBy: { name: 'asc' }
  });
}

/**
 * Gets all units for a specific area
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} areaName - Area name
 * @returns {Promise<Unit[]>} Array of units in the area
 */
async function getUnitsForArea(prisma, areaName) {
  return await prisma.unit.findMany({
    where: {
      area: {
        name: areaName
      }
    },
    orderBy: { name: 'asc' }
  });
}

module.exports = {
  getAreaForUnit,
  getAllAreas,
  getUnitsForArea
};
