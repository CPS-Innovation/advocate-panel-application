/////////// app/routes/referees.js

module.exports = router => {

  router.post('/referee/level', (req, res) => {
    req.session.data['refereeJourneyLevel'] = req.body['refereeJourneyLevel']
    res.redirect('/referee')
  })

}