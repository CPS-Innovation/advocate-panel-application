/////////// app/routes/app.js

const { route } = require("../routes-old")

module.exports = router => {

  ////////// START PAGE
  router.post('/account', (req, res) => {
    const hasAccount = req.session.data['new']['hasAccount']
    
    if (hasAccount === 'yes') {
      res.redirect('/login')
    } else {
      res.redirect('/create-account')
    }
  })

  ////////// LOGIN
  router.get('/login', (req, res) => {
    res.render('login')
  })

  router.post('/login', (req, res) => {
    res.redirect('/profile')
  })

  ////////// REGISTER 
  router.post('/create-account', (req, res) => {
    res.redirect('/question-what-describes-you')
  })

  ////////// ROLE 
  router.post('/question-what-describes-you', (req, res) => {
    const role = req.session.data['yourRoleIs']

    if (role === 'Barrister') {
      res.redirect('/task-list')
    } else if (role === 'Solicitor') {
      res.redirect('/question-what-describes-you')
    } else {
      res.redirect('/question-what-describes-you')
    }
  })

  ////////// EMPLOYMENT TYPE 
  router.post('/current-chambers/employment-type', (req, res) => {
    const employmentType = req.session.data['employmentType']

    // Redirect depending on the value
    if (employmentType === 'memberChambers') {
      res.redirect('../current-chambers/name-chambers')
    } else if (employmentType === 'soleTrader') {
      res.redirect('../current-chambers/sole-trader-adding-address')
    } else if (employmentType === 'solicitorsFirm') {
      res.redirect('../current-chambers/solicitor-firm-adding-address')
    } else {
      // If nothing selected, redirect back or show an error page
      res.redirect('/#')
    }  
  })

  ////////// COURT PANEL
  router.post('/about-you-questions/question-court-panel', (req, res) => {
    const courtPanel = req.session.data['courtPanel']

    if (courtPanel === 'Crown Court General Crime') {
      res.redirect('/about-you-questions/crown-court-levels')
    } else if (courtPanel === 'Rape and serious sexual offences') {
      res.redirect('/about-you-questions/question-court-panel')
    } else if (courtPanel === 'Specialist') {
      res.redirect('/about-you-questions/question-court-panel')
    } else {
      res.redirect('/about-you-questions/question-court-panel')
    }
  })

  ////////// CROWN COURT LEVELS
  router.post('/about-you-questions/crown-court-levels', (req, res) => {
    const crownCourtLevel = req.session.data['crownCourtLevel']

    if (crownCourtLevel === 'Level 1') {
      res.redirect('/about-you-questions/new-joiner-level-1')
    } else if (crownCourtLevel === 'Level 4') {
      res.redirect('/about-you-questions/london-secondee')
    } else {
      res.redirect('/about-you-questions/london-secondee')
    }
  })

  ////////// NEW JOINER LEVEL 1
  router.post('/about-you-questions/new-joiner-level-1', (req, res) => {
    res.redirect('/about-you-questions/check-answers')
  })

  ////////// LONDON SECONDEE (LEVEL 4)
  router.post('/about-you-questions/london-secondee', (req, res) => {
    res.redirect('/about-you-questions/check-answers')
  })

}