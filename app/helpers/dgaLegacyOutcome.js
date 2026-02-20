function calculateLegacyOutcome(failureReasons) {
  const hasDisputedUnsuccessfully = failureReasons.some(
    fr => fr.disputed === 'Yes' && fr.cpsAccepted === 'No'
  )
  if (hasDisputedUnsuccessfully) return 'Disputed unsuccessfully'

  const hasDisputedSuccessfully = failureReasons.some(
    fr => fr.disputed === 'Yes' && fr.cpsAccepted === 'Yes'
  )
  if (hasDisputedSuccessfully) return 'Disputed successfully'

  return 'Not disputed'
}

function isFinalFailure(failureReasons) {
  const completedCount = failureReasons.filter(fr => fr.disputed !== null).length
  return completedCount === failureReasons.length - 1
}

module.exports = {
  calculateLegacyOutcome,
  isFinalFailure
}
