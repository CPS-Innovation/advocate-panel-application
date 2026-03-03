module.exports = function (router) {

  // ---------------------------------------------
  // MTD MINI JOURNEY
  // ---------------------------------------------

  // Step 1 – Start page
  router.get('/mtd-complex/start', function (req, res) {
    res.render('mtd-complex/start')
  })

  // Handle form submit on the start page
  router.post('/mtd-complex/start', function (req, res) {
    res.redirect('/mtd-complex/task-list')
  })

  // Step 2 – Task list
  router.get('/mtd-complex/task-list', function (req, res) {
    res.render('mtd-complex/task-list')
  })

    // Handle form submit on the start page
  router.post('mtd-complex/task-list', function (req, res) {
    res.redirect('/mtd-complex/step1-property-type')
  })

  // Example additional MTD pages
  router.get('/mtd/property-type', function (req, res) {
    res.render('mtd/property-type')
  })

  router.post('/mtd/property-type-answer', function (req, res) {
    req.session.data['propertyType'] = req.body.propertyType
    res.redirect('/mtd/task-list')
  })




}


