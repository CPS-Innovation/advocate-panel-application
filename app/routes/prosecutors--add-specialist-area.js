const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = router => {

  router.get("/prosecutors/:prosecutorId/specialist-areas/new", async (req, res) => {
    const prosecutor = await prisma.user.findUnique({
      where: { id: parseInt(req.params.prosecutorId) }
    })

    const specialisms = await prisma.specialism.findMany()


    const specialismItems = specialisms.map(specialism => {
      return {
        text: specialism.name,
        value: specialism.id
      }
    })

    res.render("prosecutors/specialist-areas/new/index", {
      prosecutor,
      specialismItems
    })
  })

  router.post("/prosecutors/:prosecutorId/specialist-areas/new", async (req, res) => {
    res.redirect(`/prosecutors/${req.params.prosecutorId}/specialist-areas/new/preferred-areas`)
  })

  router.get("/prosecutors/:prosecutorId/specialist-areas/new/preferred-areas", async (req, res) => {
    const prosecutor = await prisma.user.findUnique({
      where: { id: parseInt(req.params.prosecutorId) }
    })

    const specialisms = await prisma.specialism.findMany()

    const specialismItems = specialisms.map(specialism => {
      return {
        text: specialism.name,
        value: specialism.id
      }
    })

    res.render("prosecutors/specialist-areas/new/preferred-areas", {
      prosecutor,
      specialismItems
    })
  })

  router.post("/prosecutors/:prosecutorId/specialist-areas/new/preferred-areas", async (req, res) => {
    res.redirect(`/prosecutors/${req.params.prosecutorId}/specialist-areas/new/restricted-areas`)
  })

  router.get("/prosecutors/:prosecutorId/specialist-areas/new/restricted-areas", async (req, res) => {
    const prosecutor = await prisma.user.findUnique({
      where: { id: parseInt(req.params.prosecutorId) }
    })

    const specialisms = await prisma.specialism.findMany()

    const specialismItems = specialisms.map(specialism => {
      return {
        text: specialism.name,
        value: specialism.id
      }
    })

    res.render("prosecutors/specialist-areas/new/restricted-areas", {
      prosecutor,
      specialismItems
    })
  })

  router.post("/prosecutors/:prosecutorId/specialist-areas/new/restricted-areas", async (req, res) => {
    res.redirect(`/prosecutors/${req.params.prosecutorId}/specialist-areas/new/check`)
  })

  router.get("/prosecutors/:prosecutorId/specialist-areas/new/check", async (req, res) => {
    const prosecutor = await prisma.user.findUnique({
      where: { id: parseInt(req.params.prosecutorId) }
    })

    const specialismIds = req.session.data.addSpecialistArea?.specialisms?.map(Number) || []
    let specialistAreas = await prisma.specialism.findMany({ where: { id: { in: specialismIds } } })

    const preferredIds = req.session.data.addSpecialistArea?.preferredAreas?.map(Number) || []
    let preferredAreas = await prisma.specialism.findMany({ where: { id: { in: preferredIds } } })

    const restrictedIds = req.session.data.addSpecialistArea?.restrictedAreas?.map(Number) || []
    let restrictedAreas = await prisma.specialism.findMany({ where: { id: { in: restrictedIds } } })

    res.render("prosecutors/specialist-areas/new/check", {
      prosecutor,
      specialistAreas,
      preferredAreas,
      restrictedAreas
    })
  })

  router.post("/prosecutors/:prosecutorId/specialist-areas/new/check", async (req, res) => {
    const specialismIds = req.session.data.addSpecialistArea?.specialisms?.map(Number) || []
    const preferredIds = req.session.data.addSpecialistArea?.preferredAreas?.map(Number) || []
    const restrictedIds = req.session.data.addSpecialistArea?.restrictedAreas?.map(Number) || []

    await prisma.user.update({
      where: { id: parseInt(req.params.prosecutorId) },
      data: {
        specialistAreas: {
          set: specialismIds.map(id => ({ id }))
        },
        preferredAreas: {
          set: preferredIds.map(id => ({ id }))
        },
        restrictedAreas: {
          set: restrictedIds.map(id => ({ id }))
        }
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.session.data.user.id,
        model: 'User',
        recordId: parseInt(req.params.prosecutorId),
        action: 'UPDATE',
        title: 'Specialist areas updated'
      }
    })

    req.flash('success', 'Specialist areas added')

    res.redirect(`/prosecutors/${req.params.prosecutorId}`)
  })

}
