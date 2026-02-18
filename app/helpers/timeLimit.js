/**
 * Add time limit dates to a case object for CTL, STL, and PACE clock
 * Each property will be the soonest date for that type, or null if none exist
 *
 * @param {Object} _case - Case object with defendants (including charges)
 * @returns {Object} - The case object with custodyTimeLimit, statutoryTimeLimit, and paceClock properties added
 */
function addTimeLimitDates(_case) {
  const ctlDates = []
  const stlDates = []
  const paceClockDates = []

  _case.defendants.forEach(defendant => {
    if (defendant.paceClock) {
      paceClockDates.push(new Date(defendant.paceClock))
    }
    defendant.charges.forEach(charge => {
      if (charge.custodyTimeLimit) {
        ctlDates.push(new Date(charge.custodyTimeLimit))
      }
      if (charge.statutoryTimeLimit) {
        stlDates.push(new Date(charge.statutoryTimeLimit))
      }
    })
  })

  _case.custodyTimeLimit = ctlDates.length > 0 ? new Date(Math.min(...ctlDates)) : null
  _case.statutoryTimeLimit = stlDates.length > 0 ? new Date(Math.min(...stlDates)) : null
  _case.paceClock = paceClockDates.length > 0 ? new Date(Math.min(...paceClockDates)) : null

  return _case
}

module.exports = {
  addTimeLimitDates
}
