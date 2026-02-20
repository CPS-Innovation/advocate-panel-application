/**
 * Helper functions for grouping tasks by severity or date ranges
 */

const { getTaskSeverity } = require('./taskState');

/**
 * Get the sort order for severity groups
 * @param {string} severity - The task severity ('Critically overdue', 'Overdue', 'Due soon', 'Not due yet')
 * @returns {number} - Sort priority (lower = higher priority)
 */
function getSeveritySortOrder(severity) {
  const order = {
    'Critically overdue': 1,
    'Overdue': 2,
    'Due soon': 3,
    'Not due yet': 4
  };

  return order[severity] || 999;
}

/**
 * Get the date group key for a given date
 * @param {Date} date - The date to categorize
 * @param {Date} today - Today's date (midnight)
 * @returns {string} - Group key: 'overdue', 'today', 'tomorrow', 'thisWeek', 'nextWeek', 'later', or 'noDate'
 */
function getDateGroup(date, today) {
  if (!date) {
    return 'noDate'
  }

  // Normalize date to midnight for comparison
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  // Calculate time boundaries
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const endOfWeek = new Date(today)
  const daysUntilSunday = 7 - today.getDay()
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday)

  const startOfNextWeek = new Date(endOfWeek)
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 1)

  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 6)

  // Categorize the date
  if (dateOnly < today) {
    return 'overdue'
  } else if (dateOnly.getTime() === today.getTime()) {
    return 'today'
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'tomorrow'
  } else if (dateOnly <= endOfWeek) {
    return 'thisWeek'
  } else if (dateOnly <= endOfNextWeek) {
    return 'nextWeek'
  } else {
    return 'later'
  }
}

/**
 * Get the PACE clock group key based on time remaining
 * @param {Date|string} paceClockDateTime - The PACE clock DateTime
 * @returns {string} - Group key: 'expired', 'lessThan1Hour', 'lessThan2Hours', 'lessThan3Hours', 'moreThan3Hours', or 'noPaceClock'
 */
function getPaceClockGroup(paceClockDateTime) {
  if (!paceClockDateTime) {
    return 'noPaceClock'
  }

  const now = new Date()
  const paceClock = new Date(paceClockDateTime)
  const msRemaining = paceClock - now
  const hoursRemaining = msRemaining / (1000 * 60 * 60)

  if (hoursRemaining < 0) return 'expired'
  if (hoursRemaining < 1) return 'lessThan1Hour'
  if (hoursRemaining < 2) return 'lessThan2Hours'
  if (hoursRemaining < 3) return 'lessThan3Hours'
  return 'moreThan3Hours'
}

/**
 * Get the sort order for PACE clock groups
 * @param {string} groupKey - The PACE clock group key
 * @returns {number} - Sort priority (lower = higher priority)
 */
function getPaceClockSortOrder(groupKey) {
  const order = {
    'expired': 1,
    'lessThan1Hour': 2,
    'lessThan2Hours': 3,
    'lessThan3Hours': 4,
    'moreThan3Hours': 5,
    'noPaceClock': 6
  }

  return order[groupKey] || 999
}

/**
 * Get the heading text for a PACE clock group
 * @param {string} groupKey - The PACE clock group key
 * @returns {string} - The heading text
 */
function getPaceClockGroupHeading(groupKey) {
  const headings = {
    expired: 'PACE clock expired',
    lessThan1Hour: 'PACE clock ends in less than 1 hour',
    lessThan2Hours: 'PACE clock ends in less than 2 hours',
    lessThan3Hours: 'PACE clock ends in less than 3 hours',
    moreThan3Hours: 'PACE clock ends in more than 3 hours',
    noPaceClock: 'No PACE clock'
  }

  return headings[groupKey] || groupKey
}

/**
 * Get the heading text for a date group based on sort type
 * @param {string} groupKey - The group key
 * @param {string} sortBy - The sort type ('Time limit', 'Custody time limit', 'Hearing date')
 * @returns {string} - The heading text
 */
function getDateGroupHeading(groupKey, sortBy) {
  const headings = {
    'Time limit': {
      overdue: 'Time limit expired',
      today: 'Time limit ends today',
      tomorrow: 'Time limit ends tomorrow',
      thisWeek: 'Time limit ends this week',
      nextWeek: 'Time limit ends next week',
      later: 'Time limit ends later',
      noDate: 'No time limit'
    },
    'Custody time limit': {
      overdue: 'Custody time limit expired',
      today: 'Custody time limit ends today',
      tomorrow: 'Custody time limit ends tomorrow',
      thisWeek: 'Custody time limit ends this week',
      nextWeek: 'Custody time limit ends next week',
      later: 'Custody time limit ends later',
      noDate: 'No custody time limit'
    },
    'Statutory time limit': {
      overdue: 'Statutory time limit expired',
      today: 'Statutory time limit ends today',
      tomorrow: 'Statutory time limit ends tomorrow',
      thisWeek: 'Statutory time limit ends this week',
      nextWeek: 'Statutory time limit ends next week',
      later: 'Statutory time limit ends later',
      noDate: 'No statutory time limit'
    },
    'Hearing date': {
      overdue: 'Hearing date has passed',
      today: 'Hearing is today',
      tomorrow: 'Hearing is tomorrow',
      thisWeek: 'Hearing is this week',
      nextWeek: 'Hearing is next week',
      later: 'Hearing is later',
      noDate: 'No hearing scheduled'
    }
  }

  return headings[sortBy]?.[groupKey] || groupKey
}

/**
 * Add group metadata to tasks based on their severity or date (depending on sortBy)
 * @param {Array} tasks - Array of task objects
 * @param {string} sortBy - Optional. The sort type ('Time limit', 'Custody time limit', 'Hearing date'). Defaults to severity-based grouping.
 * @param {Date} today - Optional. Today's date (midnight). If not provided, will be calculated.
 * @returns {Array} - Tasks with groupKey, groupHeading, sortOrder, and severity properties added
 */
function groupTasks(tasks, sortBy, today) {
  if (sortBy === 'PACE clock') {
    // Use time-based grouping for PACE clock (hours, not days)
    return tasks.map(task => {
      const paceClockDateTime = task.case?.paceClock || null

      // Get the PACE clock group key and heading
      const groupKey = getPaceClockGroup(paceClockDateTime)
      const groupHeading = getPaceClockGroupHeading(groupKey)
      const sortOrder = getPaceClockSortOrder(groupKey)

      // Always calculate severity for filtering purposes
      const severity = getTaskSeverity(task)

      // Add group metadata to task
      return {
        ...task,
        severity,
        sortOrder,
        groupKey,
        groupHeading
      }
    })
  } else if (sortBy === 'Time limit' || sortBy === 'Custody time limit' || sortBy === 'Statutory time limit' || sortBy === 'Hearing date') {
    // Use date-based grouping
    if (!today) {
      today = new Date()
      today.setHours(0, 0, 0, 0)
    }

    return tasks.map(task => {
      let dateToUse = null

      if (sortBy === 'Time limit') {
        // For generic 'Time limit', use the soonest time limit across all types
        const dates = [task.case?.custodyTimeLimit, task.case?.statutoryTimeLimit, task.case?.paceClock].filter(d => d)
        dateToUse = dates.length > 0 ? new Date(Math.min(...dates.map(d => new Date(d)))) : null
      } else if (sortBy === 'Custody time limit') {
        // Only use date if this task has a CTL
        dateToUse = task.case?.custodyTimeLimit || null
      } else if (sortBy === 'Statutory time limit') {
        // Only use date if this task has a STL
        dateToUse = task.case?.statutoryTimeLimit || null
      } else if (sortBy === 'Hearing date') {
        dateToUse = task.case?.hearings?.[0]?.startDate
      }

      // Get the group key and heading
      const groupKey = getDateGroup(dateToUse, today)
      const groupHeading = getDateGroupHeading(groupKey, sortBy)

      // Always calculate severity for filtering purposes
      const severity = getTaskSeverity(task)
      const sortOrder = getSeveritySortOrder(severity)

      // Add group metadata to task
      return {
        ...task,
        severity,
        sortOrder,
        groupKey,
        groupHeading
      }
    })
  } else {
    // Use severity-based grouping (default for 'Due date')
    return tasks.map(task => {
      // Calculate task severity
      const severity = getTaskSeverity(task);
      const groupHeading = severity;
      const sortOrder = getSeveritySortOrder(severity);

      // Add group metadata to task
      return {
        ...task,
        severity,
        groupKey: severity,
        groupHeading,
        sortOrder
      };
    });
  }
}

module.exports = {
  getSeveritySortOrder,
  getDateGroup,
  getDateGroupHeading,
  getPaceClockGroup,
  groupTasks
};
