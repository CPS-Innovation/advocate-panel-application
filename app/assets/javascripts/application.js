//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

import accessibleAutocomplete from 'accessible-autocomplete'

window.accessibleAutocomplete = accessibleAutocomplete;


const { dateFilters } = require('@x-govuk/govuk-prototype-filters')
app.get('locals.filters', () => ({ ...dateFilters }))