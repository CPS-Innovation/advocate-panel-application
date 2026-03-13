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
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/task-list')
  })

  ////////// EMPLOYMENT TYPE 
  router.post('/current-chambers/employment-type', (req, res) => {
    const employmentType = req.session.data['employmentType']
    const returnUrl = req.query.returnUrl

    if (employmentType === 'Member of chambers') {
      res.redirect(returnUrl || '/current-chambers/name-chambers')
    } else if (employmentType === 'Sole trader') {
      res.redirect(returnUrl || '/current-chambers/sole-trader-adding-address')
    } else if (employmentType === 'Member of a solicitors firm') {
      res.redirect(returnUrl || '/current-chambers/solicitor-firm-adding-address')
    } else {
      res.redirect('/current-chambers/employment-type')
    }  
  })

  ////////// NAME OF CHAMBERS
  router.post('/current-chambers/name-chambers', (req, res) => {
    req.session.data['whereYouWorkStatus'] = 'completed'
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/task-list')
  })

  ////////// PREFERRED CIRCUIT
  router.post('/preferred-circuit/circuit-question-page', (req, res) => {
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/preferred-circuit/crown-courts-circuit/crown-courts-select-page')
  })

  ////////// CROWN COURTS SELECT
  router.post('/preferred-circuit/crown-courts-circuit/crown-courts-select-page', (req, res) => {
    req.session.data['preferredCircuitStatus'] = 'completed'
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/task-list')
  })

  ////////// CALL TO BAR AND PUPILAGE
  router.post('/year-call-degree-qualifications/year-call', (req, res) => {
    req.session.data['callToBarAndPupilage'] = 'completed'
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/task-list')
  })

  ////////// DEGREE AND POSTGRAD QUALS
  router.post('/year-call-degree-qualifications/degree-qualifications', (req, res) => {
    req.session.data['degreeAndPostGradQualifications'] = 'completed'
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/task-list')
  })

////////// EQUALITIES MONITORING
  router.post('/equalities/equalities-questions-1', (req, res) => {
    res.redirect('/equalities/disability-question-2')
  })

  ////////// DISABILITY
  router.post('/equalities/disability-question-2', (req, res) => {
    res.redirect('/equalities/socio-economic-background-3')
  })

  ////////// SOCIO ECONOMIC
  router.post('/equalities/socio-economic-background-3', (req, res) => {
    res.redirect('/equalities/occupation-questions-4')
  })

  ////////// PARENTS QUALS
  router.post('/equalities/occupation-questions-4', (req, res) => {
    res.redirect('/equalities/occupation-parents-5')
  })

  ////////// PARENTS OCCUPATION
  router.post('/equalities/occupation-parents-5', (req, res) => {
    res.redirect('/equalities/occupation-parents-6')
  })

  ////////// HIGHEST INCOME IN HOUSEHOLD
  router.post('/equalities/occupation-parents-6', (req, res) => {
    res.redirect('/equalities/occupation-parents-7')
  })

  ////////// HOW MANY EMPLOYED IN PARENTS COMPANY
  router.post('/equalities/occupation-parents-7', (req, res) => {
    res.redirect('/equalities/occupation-parents-8')
  })

  ////////// HIGHEST INCOME SUPERVISOR
  router.post('/equalities/occupation-parents-8', (req, res) => {
    res.redirect('/equalities/school-meals-9')
  })

  ////////// FREE SCHOOL MEALS
  router.post('/equalities/school-meals-9', (req, res) => {
    res.redirect('/equalities/assessment-10')
  })

  ////////// SELF ASSESSMENT
  router.post('/equalities/assessment-10', (req, res) => {
    req.session.data['equalityInformation'] = 'completed'
    res.redirect('/task-list')
  })

}