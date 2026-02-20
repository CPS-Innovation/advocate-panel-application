const _ = require('lodash')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const documentTypes = require('../data/document-types')

function resetFilters(req) {
  _.set(req, 'session.data.documentListFilters.documentTypes', null)
}

module.exports = router => {
  router.get("/cases/:caseId/documents", async (req, res) => {
    const caseId = parseInt(req.params.caseId)

    let selectedDocumentTypeFilters = _.get(req.session.data.documentListFilters, 'documentTypes', [])

    let selectedFilters = { categories: [] }

    // Document type filter display
    if (selectedDocumentTypeFilters?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Type' },
        items: selectedDocumentTypeFilters.map(function(label) {
          return { text: label, href: `/cases/${caseId}/documents/remove-type/${label}` }
        })
      })
    }

    // Build Prisma where clause for documents
    let where = { caseId: caseId, AND: [] }

    if (selectedDocumentTypeFilters?.length) {
      where.AND.push({ type: { in: selectedDocumentTypeFilters } })
    }

    if (where.AND.length === 0) {
      delete where.AND
    }

    // Fetch case
    const _case = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        witnesses: { include: { statements: true } },
        prosecutors: {
          include: {
            user: true
          }
        },
        paralegalOfficers: {
          include: {
            user: true
          }
        },
        defendants: true,
        hearings: true,
        location: true,
        tasks: true,
        dga: true
      }
    })

    // Fetch documents with filters
    let documents = await prisma.document.findMany({
      where: where
    })

    // Search by document name
    let keywords = _.get(req.session.data.documentSearch, 'keywords')

    if(keywords) {
      keywords = keywords.toLowerCase()
      documents = documents.filter(document => {
        let documentName = document.name.toLowerCase()
        return documentName.indexOf(keywords) > -1
      })
    }

    let documentTypeItems = documentTypes.map(docType => ({
      text: docType,
      value: docType
    }))

    res.render("cases/documents/index", {
      _case,
      documents,
      documentTypeItems,
      selectedFilters
    })
  })

  router.get('/cases/:caseId/documents/remove-type/:type', (req, res) => {
    _.set(req, 'session.data.documentListFilters.documentTypes', _.pull(req.session.data.documentListFilters.documentTypes, req.params.type))
    res.redirect(`/cases/${req.params.caseId}/documents`)
  })

  router.get('/cases/:caseId/documents/clear-filters', (req, res) => {
    resetFilters(req)
    res.redirect(`/cases/${req.params.caseId}/documents`)
  })

  router.get('/cases/:caseId/documents/clear-search', (req, res) => {
    _.set(req, 'session.data.documentSearch.keywords', '')
    res.redirect(`/cases/${req.params.caseId}/documents`)
  })

}