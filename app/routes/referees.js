/////////// app/routes/referees.js

module.exports = router => {

  // Level selector (not part of referee journey proper)
  router.post('/referee/level', (req, res) => {
    req.session.data['refereeJourneyLevel'] = req.body['refereeJourneyLevel']
    res.redirect('/referee')
  })

  // Referee details
  router.post('/referee/name', (req, res) => {
    res.redirect('/referee')
  })

  router.post('/referee/job-title', (req, res) => {
    res.redirect('/referee')
  })

  router.post('/referee/role', (req, res) => {
    res.redirect('/referee')
  })

  // Task list sections
  router.post('/referee/role-description', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['roleDescriptionStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee')
  })

  router.post('/referee/suitability', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['suitabilityStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee')
  })

  router.post('/referee/ability', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['abilityStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee')
  })

  router.post('/referee/effectiveness', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['effectivenessStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee')
  })

  router.post('/referee/interpersonal-skills', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['interpersonalSkillsStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee')
  })

  router.post('/referee/additional-information', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['additionalInformationStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee')
  })

  // Check and confirm
  router.post('/referee/confirm', (req, res) => {
    res.redirect('/referee/confirm')
  })

}