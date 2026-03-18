/////////// app/routes/app.js

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
    req.session.data.user = { loggedIn: true }
    req.session.save(() => {
      res.redirect('/profile')
    })
  })

  ////////// LOGIN
  router.get('/login', (req, res) => {
    res.render('login')
  })

  ////////// LOGIN
  router.post('/login', (req, res) => {
    const accountProfile = require('../data/profile.json')
    req.session.data.accountProfile = accountProfile
    req.session.data.user = { loggedIn: true }
    req.session.save(() => {
      res.redirect('/profile')
    })
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
      res.redirect('/solicitor-court')
    } else {
      res.redirect('/question-what-describes-you')
    }
  })

  ////////// SOLICITOR COURT 
  router.post('/solicitor-court', (req, res) => {
    const court = req.session.data['courtType']

    if (court === 'Crown Court') {
      res.redirect('/task-list')
    } else if (court === 'Magistrates’ or Youth Courts') {
      res.redirect('/solicitor-court')
    } else {
      res.redirect('/solicitor-court')
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

    if (employmentType === 'Chambers') {
      res.redirect(returnUrl || '/current-chambers/name-chambers')
    } else if (employmentType === 'Sole trader') {
      res.redirect(returnUrl || '/current-chambers/sole-trader-adding-address')
    } else if (employmentType === 'Solicitors’ firm') {
      res.redirect(returnUrl || '/current-chambers/solicitor-firm-adding-address')
    } else {
      res.redirect('/current-chambers/employment-type')
    }  
  })

  ////////// NAME OF CHAMBERS
  const chamberAddresses = {
    "1 Crown Office Row": "1 Crown Office Row, Temple, London EC4Y 7HH",
    "2 Bedford Row": "2 Bedford Row, London WC1R 4BU",
    "2 Temple Gardens": "2 Temple Gardens, Temple, London EC4Y 9AY",
    "25 Bedford Row": "25 Bedford Row, London WC1R 4HD",
    "3 Verulam Buildings": "3 Verulam Buildings, Gray's Inn, London WC1R 5NT",
    "4 New Square Chambers": "4 New Square, Lincoln's Inn, London WC2A 3RJ",
    "5 Paper Buildings": "5 Paper Buildings, Temple, London EC4Y 7HB",
    "5 Stone Buildings": "5 Stone Buildings, Lincoln's Inn, London WC2A 3XT",
    "6KBW College Hill": "5-6 College Hill, London EC4R 2RP",
    "7 King's Bench Walk": "7 King's Bench Walk, Temple, London EC4Y 7DS",
    "Blackstone Chambers": "Blackstone House, Temple, London EC4Y 9BW",
    "Brick Court Chambers": "7-8 Essex Street, London WC2R 3LD",
    "Doughty Street Chambers": "54 Doughty Street, London WC1N 2LS",
    "Essex Court Chambers": "24 Lincoln's Inn Fields, London WC2A 3EG",
    "Exchange Chambers": "201 Deansgate, Manchester M3 3NW",
    "Fountain Court Chambers": "Temple, London EC4Y 9DH",
    "Garden Court Chambers": "57-60 Lincoln's Inn Fields, London WC2A 3LJ",
    "Hardwicke Chambers": "New Square, Lincoln's Inn, London WC2A 3SZ",
    "Matrix Chambers": "Griffin Building, Gray's Inn, London WC1R 5LN",
    "Monckton Chambers": "1 Crown Office Row, Temple, London EC4Y 7HH",
    "Mountford Chambers": "1-2 Pump Court, Temple, London EC4Y 7AR",
    "New Square Chambers": "12 New Square, Lincoln's Inn, London WC2A 3SW",
    "Pump Court Chambers": "Pump Court, Temple, London EC4Y 7AR",
    "QEB Hollis Whiteman": "1 Crown Office Row, Temple, London EC4Y 7HH",
    "Red Lion Chambers": "30 Red Lion Street, London WC1R 4GB",
    "Serle Court": "6 New Square, Lincoln's Inn, London WC2A 3QS",
    "South Square Chambers": "3-4 South Square, Gray's Inn, London WC1R 5HP",
    "St John's Buildings": "24-28 Crown Street, Manchester M2 1RT",
    "Twenty Essex": "Essex Court, Temple, London EC4Y 9AR",
    "Wilberforce Chambers": "Lincoln's Inn, London WC2A 3QB"
  }

  router.post('/current-chambers/name-chambers', (req, res) => {
    const name = req.session.data['chambersName']

    // Look up address from the known list; will be undefined if not found
    const address = chamberAddresses[name]
    if (address) {
      req.session.data['chambersAddress'] = address
    }

    req.session.data['whereYouWorkStatus'] = 'completed'
    const returnUrl = req.query.returnUrl
    res.redirect(returnUrl || '/task-list')
  })

  ////////// ADDING ADDRESS (can't see chambers in list)
  router.post('/current-chambers/adding-address-2', (req, res) => {
    const d = req.session.data

    const parts = [
      d['chambersAddressLine1'],
      d['chambersAddressLine2'],
      d['chambersAddressTown'],
      d['chambersAddressCounty'],
      d['chambersAddressPostcode']
    ].filter(Boolean)

    d['chambersAddress'] = parts.join(', ')

    d['whereYouWorkStatus'] = 'completed'
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
    const data = req.session.data

    // Normalise: single submission = string, multiple = array
    const toArray = val => val ? (Array.isArray(val) ? val : [val]) : []

    const institutions = toArray(data['institution'])
    const courses      = toArray(data['courseOrSubject'])
    const grades       = toArray(data['gradeOrResult'])
    const days         = toArray(data['dateOfCompletion-day'])
    const months       = toArray(data['dateOfCompletion-month'])
    const years        = toArray(data['dateOfCompletion-year'])

    // Zip parallel arrays into qualification objects
    req.session.data['degreeQualifications'] = institutions.map((inst, i) => {
      const day   = days[i]   || ''
      const month = months[i] || ''
      const year  = years[i]  || ''

      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December']
      const dateDisplay = (day && month && year)
        ? `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`
        : ''

      return {
        institution:     inst,
        courseOrSubject: courses[i] || '',
        gradeOrResult:   grades[i]  || '',
        dateDay:         day,
        dateMonth:       month,
        dateYear:        year,
        dateDisplay:     dateDisplay
      }
    })

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