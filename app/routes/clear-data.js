const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

module.exports = router => {
  router.get('/clear-data', function (req, res) {
    delete req.session.data
    const redirectUrl = req.query.returnUrl || '/'

    const dataFolder = path.join(__dirname, '../../data')

    try {
      if (!fs.existsSync(dataFolder)) {
        fs.mkdirSync(dataFolder, { recursive: true })
        console.log(`Created folder: ${dataFolder}`)
      }
    } catch (err) {
      console.error('Error creating data folder:', err)
      return res.status(500).json({ error: 'Failed to prepare database folder' })
    }

    exec("npx prisma db push --force-reset", (resetError, resetStdout, resetStderr) => {
      if (resetError) {
        console.error('Error resetting DB:', resetError)
        console.error(resetStderr)
        return res.status(500).json({ error: 'Failed to reset database' })
      }
      console.log('DB reset output:', resetStdout)

      exec("npx prisma db seed", (seedError, seedStdout, seedStderr) => {
        if (seedError) {
          console.error('Error seeding DB:', seedError)
          console.error(seedStderr)
          return res.status(500).json({ error: 'Failed to seed database' })
        }
        console.log('DB seeded successfully:', seedStdout)
        res.redirect(redirectUrl)
      })
    })
  })
}
