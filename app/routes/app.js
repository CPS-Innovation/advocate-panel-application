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
      res.redirect('/question-what-describes-you')
    } else {
      res.redirect('/question-what-describes-you')
    }
  })

  ////////// EMPLOYMENT TYPE 
  router.post('/current-chambers/employment-type', (req, res) => {
    const employmentType = req.session.data['employmentType']

    // Redirect depending on the value
    if (employmentType === 'memberChambers') {
      res.redirect('../current-chambers/name-chambers')
    } else if (employmentType === 'soleTrader') {
      res.redirect('../current-chambers/sole-trader-adding-address')
    } else if (employmentType === 'solicitorsFirm') {
      res.redirect('../current-chambers/solicitor-firm-adding-address')
    } else {
      // If nothing selected, redirect back or show an error page
      res.redirect('/#')
    }  
  })

}