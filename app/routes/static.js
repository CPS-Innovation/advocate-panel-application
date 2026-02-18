module.exports = router => {
  router.get('/static', (req, res) => {
    res.render("static/index")
  })

  router.get('/static/500', (req, res) => {
    res.render("static/500")
  })
  router.get('/static/403-case', (req, res) => {
    res.render("static/403-case")
  })

  router.get('/static/show-more', (req, res) => {
    res.render("static/show-more")
  })
}
