/**
 * Generic helper for managing multi-page form flows with conditional logic.
 *
 * Flow config structure:
 * {
 *   name: 'flow-name',
 *   sessionKey: 'sessionDataKey',
 *   collects: {
 *     'page-path': ['fieldA', 'fieldB'],
 *     'other-page': ['fieldC'],
 *   },
 *   requires: [
 *     { field: 'fieldA' },
 *     { field: 'fieldB', when: { fieldA: 'Yes' } },
 *     { field: 'fieldC', when: { fieldA: { not: 'No' } } },
 *     { field: 'fieldD', when: { fieldA: { either: ['X', 'Y'] } } },
 *   ]
 * }
 */

/**
 * Check if a single condition value is met
 */
function matchesValue(actual, expected) {
  if (expected === null || expected === undefined) {
    return true
  }

  // Handle { not: 'value' }
  if (typeof expected === 'object' && 'not' in expected) {
    return actual !== expected.not
  }

  // Handle { either: ['value1', 'value2'] }
  if (typeof expected === 'object' && 'either' in expected) {
    return expected.either.includes(actual)
  }

  // Simple value match
  return actual === expected
}

/**
 * Check if all conditions in a 'when' object are met
 */
function meetsCondition(data, when) {
  if (!when) {
    return true
  }

  return Object.entries(when).every(([field, expected]) => {
    return matchesValue(data[field], expected)
  })
}

/**
 * Check if a field value is empty
 */
function isEmpty(value) {
  if (value === undefined || value === null || value === '') {
    return true
  }

  if (Array.isArray(value) && value.length === 0) {
    return true
  }

  // For date objects with day/month/year, check all parts exist
  if (typeof value === 'object' && !Array.isArray(value)) {
    if ('day' in value || 'month' in value || 'year' in value) {
      return !value.day || !value.month || !value.year
    }
  }

  return false
}

/**
 * Check if all required fields are present for current data state
 */
function isFlowComplete(data, flow) {
  for (const requirement of flow.requires) {
    if (meetsCondition(data, requirement.when) && isEmpty(data[requirement.field])) {
      return false
    }
  }
  return true
}

/**
 * Clear fields whose conditions are no longer met
 */
function clearInactiveFields(data, flow) {
  for (const requirement of flow.requires) {
    if (!meetsCondition(data, requirement.when)) {
      delete data[requirement.field]
    }
  }
}

/**
 * Find which page collects a given field
 */
function getPageForField(field, flow) {
  for (const [page, fields] of Object.entries(flow.collects)) {
    if (fields.includes(field)) {
      return page
    }
  }
  return null
}

/**
 * Build the base path for a task flow
 */
function getBasePath(req, flowName) {
  return `/cases/${req.params.caseId}/tasks/${req.params.taskId}/${flowName}`
}

/**
 * Get the next URL to redirect to after a form submission.
 * Returns the first incomplete required step, or check page if complete.
 */
function getNextUrl({ basePath, data, flow }) {
  for (const requirement of flow.requires) {
    if (meetsCondition(data, requirement.when) && isEmpty(data[requirement.field])) {
      const page = getPageForField(requirement.field, flow)
      if (page !== null) {
        const pagePath = page === '' ? '' : `/${page}`
        return `${basePath}${pagePath}`
      }
    }
  }

  return `${basePath}/check`
}

/**
 * Standard POST handler logic for form flow steps.
 * Clears inactive fields and redirects to next step or check page.
 */
function handlePost({ req, res, flow }) {
  const basePath = getBasePath(req, flow.name)
  const data = req.session.data[flow.sessionKey]

  clearInactiveFields(data, flow)
  res.redirect(getNextUrl({ basePath, data, flow }))
}

module.exports = {
  meetsCondition,
  isEmpty,
  isFlowComplete,
  clearInactiveFields,
  getPageForField,
  getBasePath,
  getNextUrl,
  handlePost
}
