// app/routes/app.js

module.exports = router => {

  ////////// START PAGE
  router.post('/account', (req, res) => {
    const hasAccount = req.session.data['new']['hasAccount']
    
    if (hasAccount === 'yes') {
      res.redirect('/login')
    } else {
      res.redirect('/register')
    }
  })

  ///////// REGISTER 
  router.post('/register', (req, res) => {
    res.redirect('/question-what-describes-you')
  })

  ////// ROLE 
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

}