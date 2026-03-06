// app/routes/app.js

module.exports = router => {

  router.post('/account', (req, res) => {
    const hasAccount = req.session.data['new']['hasAccount']
    
    if (hasAccount === 'yes') {
      res.redirect('/login')
    } else {
      res.redirect('/register')
    }
  })

}