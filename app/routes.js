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
    res.redirect('../current-chambers/address-details.html')
  } else if (answer === 'solicitorsFirm') {
    res.redirect('../current-chambers/firm-name.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})








module.exports = router