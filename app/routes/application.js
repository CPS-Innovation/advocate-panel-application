/////////// app/routes/application.js

module.exports = router => {

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
      res.redirect('/about-you-questions/check-answers')
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

  ////////// EXAMPLES OF WORK - ADVOCACY
  router.post('/examples-work/examples-work-advocacy', (req, res) => {
    const completed = req.session.data['haveYouCompletedThisSection']
    const advocacy = req.session.data['advocacyExample']

    if (completed === 'yes') {
      req.session.data['advocacyStatus'] = 'completed'
    } else if (advocacy && advocacy.trim() !== '') {
      req.session.data['advocacyStatus'] = 'inProgress'
    } else {
      req.session.data['advocacyStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })
  

}