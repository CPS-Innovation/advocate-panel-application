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
    req.session.data = { ...req.session.data, ...seedData }
    res.redirect('/referee/email')
  })

  // Email preview (not part of referee journey proper)
  router.get('/referee/email', (req, res) => {
    res.render('referee/email')
  })

  // Task list
  router.get('/referee/task-list', (req, res) => {
    res.render('referee/task-list')
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
    res.redirect('/referee/task-list')
  })

  router.post('/referee/suitability', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['suitabilityStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee/task-list')
  })

  router.post('/referee/ability', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['abilityStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee/task-list')
  })

  router.post('/referee/effectiveness', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['effectivenessStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee/task-list')
  })

  router.post('/referee/interpersonal-skills', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['interpersonalSkillsStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee/task-list')
  })

  router.post('/referee/additional-information', (req, res) => {
    const completed = req.body['haveYouCompletedThisSection'] === 'yes'
    req.session.data['additionalInformationStatus'] = completed ? 'completed' : 'inProgress'
    res.redirect('/referee/task-list')
  })

  // Check answers
  router.get('/referee/check', (req, res) => {
    res.render('referee/check')
  })

  // Confirm submission
  router.post('/referee/confirm', (req, res) => {
    res.redirect('/referee/confirm')
  })

}