/////////// app/routes/application.js

module.exports = router => {


  ////////// CLEAR COMPLETION FLAG ON EVERY POST
  router.use((req, res, next) => {
    if (req.method === 'POST') {
      const completed = req.session.data['haveYouCompletedThisSection']
      res.locals.haveYouCompletedThisSection = completed
      req.session.data['haveYouCompletedThisSection'] = null
    }
    next()
  })

   ////////// COURT PANEL
  router.post('/about-you-questions/question-court-panel', (req, res) => {
    const courtPanel = req.session.data['courtPanel']

    if (courtPanel === 'General crime') {
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

  ////////// REFEREE
  router.post('/references-questions/reference-page', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const refereeFullName = req.session.data['refereeFullName']

    if (completed === 'yes') {
      req.session.data['refereeStatus'] = 'completed'
      res.redirect('/start-application')
    } else if (refereeFullName && refereeFullName.trim() !== '') {
      req.session.data['refereeStatus'] = 'inProgress'
      res.redirect('/start-application')
    } else {
      req.session.data['refereeStatus'] = 'notStarted'
      res.redirect('/start-application')
    }
  })

  ////////// EXAMPLES OF WORK - ADVOCACY
  router.post('/examples-work/examples-work-advocacy', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
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

  ////////// EXAMPLES OF WORK - ADVISORY
  router.post('/examples-work/examples-work-advisory', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const advisory = req.session.data['advisoryWork']

    if (completed === 'yes') {
      req.session.data['advisoryStatus'] = 'completed'
    } else if (advisory && advisory.trim() !== '') {
      req.session.data['advisoryStatus'] = 'inProgress'
    } else {
      req.session.data['advisoryStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })

  ////////// ADVISORY DRAFTING EXAMPLES (UPLOAD)
  router.post('/upload-page', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const uploadedFiles = req.session.data['uploadedFiles']

    if (completed === 'yes') {
      req.session.data['uploadStatus'] = 'completed'
    } else if (uploadedFiles && uploadedFiles.trim() !== '') {
      req.session.data['uploadStatus'] = 'inProgress'
    } else {
      req.session.data['uploadStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })

  ////////// PUBLIC INTEREST IMMUNITY
  router.post('/examples-work/examples-work-public-interest-immunity', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const immunity = req.session.data['publicInterestImmunity']

    if (completed === 'yes') {
      req.session.data['piiStatus'] = 'completed'
    } else if (immunity && immunity.trim() !== '') {
      req.session.data['piiStatus'] = 'inProgress'
    } else {
      req.session.data['piiStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })

  ////////// OTHER RELEVANT KNOWLEDGE, SKILLS & EXPERIENCE
  router.post('/examples-work/examples-work-knowledge-skills-experience', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const knowledge = req.session.data['otherRelevantSkills']

    if (completed === 'yes') {
      req.session.data['knowledgeStatus'] = 'completed'
    } else if (knowledge && knowledge.trim() !== '') {
      req.session.data['knowledgeStatus'] = 'inProgress'
    } else {
      req.session.data['knowledgeStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })

  ////////// APPRECIATION OF THE ROLE OF A PANEL ADVOCATE
  router.post('/examples-work/examples-work-appreciation', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const appreciation = req.session.data['apreciationExample']

    if (completed === 'yes') {
      req.session.data['appreciationStatus'] = 'completed'
    } else if (appreciation && appreciation.trim() !== '') {
      req.session.data['appreciationStatus'] = 'inProgress'
    } else {
      req.session.data['appreciationStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })


  ////////// ADDITIONAL INFORMATION
  router.post('/examples-work/examples-work-additional', (req, res) => {
    const completed = res.locals.haveYouCompletedThisSection
    const additional = req.session.data['additionalInfoExample']

    if (completed === 'yes') {
      req.session.data['additionalStatus'] = 'completed'
    } else if (additional && additional.trim() !== '') {
      req.session.data['additionalStatus'] = 'inProgress'
    } else {
      req.session.data['additionalStatus'] = 'notStarted'
    }

    res.redirect('/start-application')
  })

}