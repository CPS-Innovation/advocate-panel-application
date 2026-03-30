/////////// app/routes/referees.js

const path = require('path')
const fs = require('fs')

module.exports = router => {

  // Level selector (not part of referee journey proper)
  router.post('/referee/level', (req, res) => {
    const level = req.body['refereeJourneyLevel']


    const fileName = level === 'Level 1' ? 'referee-level-1.json' : 'referee-level-4.json'
    const filePath = path.join(__dirname, '../data', fileName)
    const seedData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    // create a new object containing all the existing session data properties, then add all the seed data properties on top
    req.session.data = { ...req.session.data, ...seedData }

    res.redirect('/referee/email')
  })

  // GET route for email preview (add after the level POST block)
  router.get('/referee/email', (req, res) => {
    res.render('referee/email')
  })

  // Referee details
  router.post('/referee/name', (req, res) => {
    res.redirect('/referee')
  })

  router.get('/referee/check', (req, res) => {
    res.render('referee/check')
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