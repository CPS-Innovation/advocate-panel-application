//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// 1. Route to handle "What describes you" answer
router.post('/whatDescribesYou-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['whatDescribesYou']

  // Redirect depending on the value
  if (answer === 'barrister') {
    res.redirect('./about-you-questions/question-court-panel.html')
  } else if (answer === 'solicitor') {
    res.redirect('./about-you-questions/solicitor-questions-type.html')
  } else if (answer === 'other') {
    res.redirect('./about-you-questions/other.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})

// 2. Route to handle "Select a panel to apply for" answer
router.post('/panel-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['panel']

  // Redirect depending on the value
  if (answer === 'barrister') {
    res.redirect('./about-you-questions/crown-court-levels.html')
  } else if (answer === 'solicitor') {
    res.redirect('./about-you-questions/crown-court-levels.html')
  } else if (answer === 'other') {
    res.redirect('./about-you-questions/crown-court-levels.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})


router.post('/solicitor-panel-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['panel']

  // Redirect depending on the value
  if (answer === 'crownCourtGeneralCrime') {
    res.redirect('./about-you-questions/solicitor-crown-court-levels.html')
  } else if (answer === 'rapeSeriousSexualOffences') {
    res.redirect('./about-you-questions/solicitor-crown-court-levels.html')
  } else if (answer === 'specialist') {
    res.redirect('./about-you-questions/solicitor-crown-court-levels.html')
  } else if (answer === 'other') {
    res.redirect('./about-you-questions/solicitor-crown-court-levels.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})


// General Crime //
// 3. Route to handle "Select the a level" answer
router.post('/levels-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['levels']

  // Redirect depending on the value
  if (answer === 'level1') {
    res.redirect('./about-you-questions/new-joiner-level-1.html')
  } else if (answer === 'level2') {
    res.redirect('./about-you-questions/new-joiner-level-2-4.html')
  } else if (answer === 'level3') {
    res.redirect('./about-you-questions/new-joiner-level-2-4.html')
  } else if (answer === 'level4') {
    res.redirect('./about-you-questions/new-joiner-level-2-4.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})


router.post('/solicitor-levels-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['levels']

  // Redirect depending on the value
  if (answer === 'level1') {
    res.redirect('./about-you-questions/solicitor-new-joiner-level-1.html')
  } else if (answer === 'level2') {
    res.redirect('./about-you-questions/solicitor-new-joiner-level-2-4.html')
  } else if (answer === 'level3') {
    res.redirect('./about-you-questions/solicitor-new-joiner-level-2-4.html')
  } else if (answer === 'level4') {
    res.redirect('./about-you-questions/solicitor-new-joiner-level-2-4.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})


// 4. Route to handle "Select a membership type" answer
router.post('/membership-type-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['membership']

  // Redirect depending on the value
  if (answer === 'permanent') {
    res.redirect('./about-you-questions/level-2-4-permanent.html')
  } else if (answer === 'temporary') {
    res.redirect('./about-you-questions/level-2-4-temporary.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})



router.post('/solicitor-membership-type-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['membership']

  // Redirect depending on the value
  if (answer === 'permanent') {
    res.redirect('./about-you-questions/solicitor-level-2-4-permanent.html')
  } else if (answer === 'temporary') {
    res.redirect('./about-you-questions/solicitor-level-2-4-temporary.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})



// 5. Route to handle "What type of solicitor are you?" answer
router.post('/typeSolicitor-answers', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['typeSolicitor']

  // Redirect depending on the value
  if (answer === 'crownCourt') {
    res.redirect('./about-you-questions/solicitor-question-court-panel.html')
  } else if (answer === 'youthCourt') {
    res.redirect('./about-you-questions/solicitor-wishing-to-practice.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})



// Task-list Application Start form

// 6. Route to handle "Current Chambers or Solicitors firm" answer
router.post('/employmentType-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['employmentType']

  // Redirect depending on the value
  if (answer === 'memberChambers') {
    res.redirect('../current-chambers/name-chambers.html')
  } else if (answer === 'soleTrader') {
    res.redirect('./current-chambers/sole-trader-adding-address.html')
  } else if (answer === 'solicitorsFirm') {
    res.redirect('../current-chambers/solicitor-firm-adding-address.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})


// Equalities form

// "/disability-question-2.html" answer
router.post('/disability-question-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['disability-question']

  // Redirect depending on the value
  if (answer === 'no') {
    res.redirect('../equalities/socio-economic-background-3.html')
  } else if (answer === 'yes') {
    res.redirect('../equalities/socio-economic-background-3.html')
  } else if (answer === 'prefernotsay') {
    res.redirect('../equalities/socio-economic-background-3.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})

// "socio-economic-background-3.html" answer radio buttons
router.post('/socioEconomic-answers', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['socioEconomic']

  // Redirect depending on the value
  if (answer === 'state-run') {
    res.redirect('../equalities/occupation-questions-4.html')
  } else if (answer === 'bursary') {
    res.redirect('../equalities/occupation-questions-4.html')
  } else if (answer === 'no-bursary') {
    res.redirect('../equalities/occupation-questions-4.html')
  } else if (answer === 'outside-uk') {
    res.redirect('../equalities/occupation-questions-4.html')
  } else if (answer === 'dont-know') {
    res.redirect('../equalities/occupation-questions-4.html')
  } else if (answer === 'other') {
    res.redirect('../equalities/occupation-questions-4.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('../equalities/socio-economic-background-3.html')
  }
})



// "occupation-questions-4.html" answer radio buttons
router.post('/parents-qualifications-answers', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['parents-qualifications']

  // Redirect depending on the value
  if (answer === 'below-degree') {
    res.redirect('../equalities/ooccupation-parents-5.html')
  } else if (answer === 'no-formal-qualifications') {
    res.redirect('../equalities/occupation-parents-5.html')
  } else if (answer === 'no-dontknow') {
    res.redirect('../equalities/occupation-parents-5.html')
  } else if (answer === 'notapplicable') {
    res.redirect('../equalities/occupation-parents-5.html')
  } else if (answer === 'prefernotsay') {
    res.redirect('../equalities/occupation-parents-5.html')
  } else if (answer === 'at-least-one') {
    res.redirect('../equalities/occupation-parents-5.html')
  } else if (answer === 'other') {
    res.redirect('../equalities/occupation-parents-5.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('../equalities/occupation-questions-4.html')
  }
})




// "occupation-parents-5.html" answer checkboxes

router.post('/occupation-parents-answer', function (req, res) {

  const answers = req.session.data['occupation-parents']

  // If nothing selected
  if (!answers) {
    return res.redirect('../equalities/occupation-parents-5.html')
  }

  if (answers.includes('modern-occupation-parents')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('clerical-occupation-parents')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('managers-admin')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('technical-occupation-parents')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('manual-occupation-parents')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('routine-occupation-parents')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('junior-managers')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('professional-occupation-parents')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('unemployed')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('retired')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('dontknow')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else if (answers.includes('prefernotsay')) {
    return res.redirect('../equalities/occupation-parents-6.html')
  } else {
    return res.redirect('../equalities/occupation-parents-5.html')
  }

})


// "occupation-parents-6.html" answer checkboxes
router.post('/occupation-income-answer', function (req, res) {

  const answer = req.session.data['occupation-income']

  // If nothing selected
  if (!answer) {
    return res.redirect('../equalities/occupation-parents-6.html')
  }

  if (answer.includes('employee')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else if (answer.includes('selfemployed-employees')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else if (answer.includes('selfemployed-no-employees')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else if (answer.includes('notworking')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else if (answer.includes('dontknow')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else if (answer.includes('notappliacble')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else if (answer.includes('prefernotsay')) {
    return res.redirect('../equalities/occupation-parents-7.html')
  } else {
    return res.redirect('../equalities/occupation-parents-6.html')
  }

})


// "occupation-parents-7.html" answer checkboxes

router.post('/number-employees-answer', function (req, res) {

  const answer = req.session.data['number-employees']

  if (answer === 'oneto24') {
    // fix: add the missing hyphen
    return res.redirect('../equalities/occupation-parents-8.html')
  } else if (answer === '25more') {
    return res.redirect('../equalities/occupation-parents-8.html')
  } else if (answer === 'dontknow') {
    return res.redirect('../equalities/occupation-parents-8.html')
  } else if (answer === 'notapplicable') {
    return res.redirect('../equalities/occupation-parents-8.html')
  } else if (answer === 'prefernotsay') {
    return res.redirect('../equalities/occupation-parents-8.html')
  } else {
    // nothing selected → back to the same page
    return res.redirect('../equalities/occupation-parents-7.html')
  }
})





// "occupation-parents-8.html" answer checkboxes

router.post('/supervisor-status-answer', function (req, res) {

  const answer = req.session.data['supervisor-status']

  if (answer === 'yes') {
    // fix: add the missing hyphen
    return res.redirect('../equalities/school-meals-9.html')
  } else if (answer === 'no') {
    return res.redirect('../equalities/school-meals-9.html')
  } else if (answer === 'dontknow') {
    return res.redirect('../equalities/school-meals-9.html')
  } else if (answer === 'notapplicable') {
    return res.redirect('../equalities/school-meals-9.html')
  } else if (answer === 'prefernotsay') {
    return res.redirect('../equalities/school-meals-9.html')
  } else {
    // nothing selected → back to the same page
    return res.redirect('../equalities/occupation-parents-8.html')
  }
})



// "school-meals-9.html" answer checkboxes

router.post('/school-meals-answer', function (req, res) {

  const answer = req.session.data['school-meals']

  if (answer === 'yes') {
    // fix: add the missing hyphen
    return res.redirect('../equalities/assessment-10.html')
  } else if (answer === 'no') {
    return res.redirect('../equalities/assessment-10.html')
  } else if (answer === 'dontknow') {
    return res.redirect('../equalities/assessment-10.html')
  } else if (answer === 'notapplicable') {
    return res.redirect('../equalities/assessment-10.html')
  } else if (answer === 'prefernotsay') {
    return res.redirect('../equalities/assessment-10.html')
  } else {
    // nothing selected → back to the same page
    return res.redirect('../equalities/school-meals-9.html')
  }
})



// "assessment-10.html" answer checkboxes

router.post('/socio-economic-status-answer', function (req, res) {

  const answer = req.session.data['socio-economic-status']

  if (answer === 'yes') {
    // fix: add the missing hyphen
    return res.redirect('../equalities/check-answers.html')
  } else if (answer === 'no') {
    return res.redirect('../equalities/check-answers.html')
  } else if (answer === 'dontknow') {
    return res.redirect('../equalities/check-answers.html')
  } else if (answer === 'notapplicable') {
    return res.redirect('../equalities/check-answers.html')
  } else if (answer === 'prefernotsay') {
    return res.redirect('../equalities/check-answers.html')
  } else {
    // nothing selected → back to the same page
    return res.redirect('../equalities/assessment-10.html')
  }
})







module.exports = router