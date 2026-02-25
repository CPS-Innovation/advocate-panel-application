const accessibleAutocomplete = require("accessible-autocomplete");

const countries = [
  "France",
  "Germany",
  "United Kingdom"
];

accessibleAutocomplete({
  element: document.querySelector("#my-autocomplete-container"),
  id: "my-autocomplete",
  source: countries
});