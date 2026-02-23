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


// 4. Route to handle "Select a membership type" answer
router.post('/membership-type-answer', function (req, res) {

  // Read form value (Prototype Kit stores it in req.session.data)
  const answer = req.session.data['membership']

  // Redirect depending on the value
  if (answer === 'permanent') {
    res.redirect('./about-you-questions/level-2-4-permanent.html')
  } else if (answer === 'temporary') {
    res.redirect('./about-you-questions/nlevel-2-4-temporary.html')
  } else {
    // If nothing selected, redirect back or show an error page
    res.redirect('/#')
  }
})








module.exports = router