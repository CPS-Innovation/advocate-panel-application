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

    ////////// CHECK - PERSONAL DETAILS
  router.post('/check', (req, res) => {
    res.redirect('/profile')
  })

  ////////// LOGIN
  router.get('/login', (req, res) => {
    res.render('login')
  })

  router.post('/login', (req, res) => {
    req.session.data.user = {}
    res.redirect('/profile')
  })

  ////////// SIGN OUT
  router.get('/sign-out', (req, res) => {
    req.session.destroy()
    res.redirect('/sign-out-confirmation')
  })

  router.get('/sign-out-confirmation', (req, res) => {
    res.render('sign-out')
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

  ////////// PERSONAL DETAILS - NAME AND BAR NUMBER
  router.post('/personal-details/personal-details', (req, res) => {
    req.session.data['personalDetailsStatus'] = 'completed'
    res.redirect('/task-list')
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

  ////////// NAME OF CHAMBERS
  router.post('/current-chambers/name-chambers', (req, res) => {
    req.session.data['whereYouWorkStatus'] = 'completed'
    res.redirect('/task-list')
  })

  ////////// PREFERRED CIRCUIT
  router.post('/preferred-circuit/circuit-question-page', (req, res) => {
    res.redirect('/preferred-circuit/crown-courts-circuit/crown-courts-select-page')
  })

  ////////// CROWN COURTS SELECT
  router.post('/preferred-circuit/crown-courts-circuit/crown-courts-select-page', (req, res) => {
    req.session.data['preferredCircuitStatus'] = 'completed'
    res.redirect('/task-list')
  })


}