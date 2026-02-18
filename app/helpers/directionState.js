/**
 * Calculate the status of a direction based on its due date
 * @param {Object} direction - Direction object with dueDate and completedDate
 * @returns {string|null} - 'Overdue', 'Due today', or null if not urgent
 */
function getDirectionStatus(direction) {
  // Completed directions don't show a status tag
  if (direction.completedDate) {
    return null;
  }

  if (!direction.dueDate) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dueDate = new Date(direction.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  // Overdue
  if (dueDate < now) {
    return 'Overdue';
  }

  // Due today
  if (dueDate.getTime() === now.getTime()) {
    return 'Due today';
  }

  // Not urgent (due tomorrow or later)
  return null;
}

module.exports = {
  getDirectionStatus
};
