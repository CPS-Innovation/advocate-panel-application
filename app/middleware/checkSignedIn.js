function checkSignedIn(req, res, next) {
  if (req?.session?.data?.user) {
    return next()
  }
  const returnUrl = req.originalUrl
  return res.redirect(`/account/sign-in?returnUrl=${returnUrl}`)
}

module.exports = checkSignedIn