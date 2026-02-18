/**
 * Helper functions for grouping directions by date status
 */

/**
 * Get the date group key for a given date
 * @param {Date} date - The date to categorize
 * @param {Date} today - Today's date (midnight)
 * @returns {string} - Group key: 'overdue', 'today', 'tomorrow', 'thisWeek', 'later', or 'noDate'
 */
function getDateGroup(date, today) {
  if (!date) {
    return 'noDate'
  }

  // Normalize date to midnight for comparison
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  // Calculate tomorrow
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Calculate days difference
  const daysDifference = Math.floor((dateOnly - today) / (1000 * 60 * 60 * 24))

  // Categorize the date
  if (dateOnly < today) {
    return 'overdue'
  } else if (dateOnly.getTime() === today.getTime()) {
    return 'today'
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'tomorrow'
  } else if (daysDifference >= 2 && daysDifference <= 7) {
    return 'thisWeek'
  } else {
    return 'later'
  }
}

/**
 * Get the heading text for a direction date group
 * @param {string} groupKey - The group key
 * @returns {string} - The heading text
 */
function getDateGroupHeading(groupKey) {
  const headings = {
    overdue: 'Overdue',
    today: 'Due today',
    tomorrow: 'Due tomorrow',
    thisWeek: 'Due this week',
    later: 'Due later',
    noDate: 'No due date'
  }

  return headings[groupKey] || groupKey
}

/**
 * Get the sort order for direction date groups
 * @param {string} groupKey - The group key
 * @returns {number} - Sort priority (lower = higher priority)
 */
function getDateGroupSortOrder(groupKey) {
  const order = {
    'overdue': 1,
    'today': 2,
    'tomorrow': 3,
    'thisWeek': 4,
    'later': 5,
    'noDate': 6
  }

  return order[groupKey] || 999
}

/**
 * Add group metadata to directions based on their due date
 * @param {Array} directions - Array of direction objects
 * @returns {Array} - Directions with groupKey, groupHeading, and sortOrder properties added
 */
function groupDirections(directions) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return directions.map(direction => {
    // Get the group key and heading
    const groupKey = getDateGroup(direction.dueDate, today)
    const groupHeading = getDateGroupHeading(groupKey)
    const sortOrder = getDateGroupSortOrder(groupKey)

    // Add group metadata to direction
    return {
      ...direction,
      groupKey,
      groupHeading,
      sortOrder
    }
  })
}

module.exports = {
  getDateGroup,
  getDateGroupHeading,
  getDateGroupSortOrder,
  groupDirections
}
