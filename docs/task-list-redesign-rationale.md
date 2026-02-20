# Why we need to redesign tasks and directions

The task list is an important part of the service. 

It's where many different types of users — across roles and units — go to process and progress cases in different states. Getting this right has a direct impact on how quickly cases are processed and the operating costs of the service.

The current task list is hard to use, inaccessible in several ways and does not follow GOV.UK design standards. 

We've also had feedback from users that confirms this. For example, users don't understand why they can only see one unit at a time when they work across multiple units, and some have resorted to maintaining their own separate lists of tasks outside the system because the task list doesn't support their needs well enough.

We've been redesigning the task list to address all of this. We're doing it iteratively — we have not changed the underlying model of tasks and directions. But we've made many improvements that we hope we can ship now.

We're also using this work to document the constraints in the current model that degrade UX, so we can challenge them in future iterations.

Many of these issues were flagged in the last service assessment and we committed to improving them.

## Some problems with the current design

1. The tables have too many columns, are not responsive, and break on smaller screens
2. Dates are not shown in the correct GOV.UK style - likely due to the narrow table cells
3. Icons are used instead of text - probably to save space, which the Service Standard recommends against
4. Rows expand to show nested accordions, burying information users miss
5. Expanded rows show empty fields, wasting space
6. Some information has been added because users asked for it, without understanding why or when they need it
7. It's hard to see which tasks are high priority
8. The language is confusing — for example, "escalated" means very overdue but does not say that
9. The notes interface is confusing and hard to use
10. The page has to be refreshed to see updated information
11. Filters are hidden behind dropdowns, adding an unnecessary click — GOV.UK guidance recommends against this
12. Filters are central to the task list but are treated as a secondary feature
13. Users have to create, save, and maintain their own filter sets — if the filters were easy to use, this would not be needed
14. The button says "search" when it should say "apply filters"
15. The hearing date filter uses a single input that does not follow the GOV.UK date input standard
16. Users can only see one unit at a time, but they work across multiple units
17. Tabs split the same list into separate views, fragmenting the user's workflow
18. The page heading says "Hi {name}" which does not describe what the user is looking at
19. "Add an owner" is placed next to the filters, which is confusing
20. The visual design does not match GOV.UK — for example, solid tags with chunky close buttons
21. The pagination styling is non-standard and shows a previous link on page one

## Hypothesis

If we improve the task list, then users will be able to process cases more quickly, helping meet SLAs, reducing costs, and meeting the Service Standard — including making sure the service is accessible to everyone.

====

Our users have to use spreadsheet to keep on top of what they have to do on a case. Task list isn't cutting it. The cost of switching, maintaining and using spreadsheets outside of the service must be huge.