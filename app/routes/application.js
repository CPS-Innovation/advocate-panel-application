/////////// app/routes/application.js

module.exports = router => {

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