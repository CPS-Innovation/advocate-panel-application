const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {
  router.get("/paralegal-officers", async (req, res) => {
    res.render("paralegal-officers/index")
  })

}
