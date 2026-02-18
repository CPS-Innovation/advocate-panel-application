/**
 * Calculate the severity of a task based on its dates
 * @param {Object} task - Task object with reminderDate, dueDate, escalationDate, completedDate
 * @returns {string} - One of: 'Completed', 'Critically overdue', 'Overdue', 'Due soon', 'Not due yet'
 */
function getTaskSeverity(task) {
  const now = new Date();

  // Completed tasks are always in 'Completed' severity
  if (task.completedDate) {
    return 'Completed';
  }

  // Check dates in order of priority: Critically overdue > Overdue > Due soon > Not due yet
  if (new Date(task.escalationDate) <= now) {
    return 'Critically overdue';
  }

  if (new Date(task.dueDate) <= now) {
    return 'Overdue';
  }

  if (new Date(task.reminderDate) <= now) {
    return 'Due soon';
  }

  return 'Not due yet';
}

module.exports = {
  getTaskSeverity
};
