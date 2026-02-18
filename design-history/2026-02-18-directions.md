---
title: Redesigning the direction list
date: 2026-02-18
---

Directions are court orders that must be complied with by a specific deadline. Unlike tasks - which can be more flexible - directions are fixed obligations that carry legal consequences if missed.

The direction list gives users a way to see all directions they're responsible for and act on the ones that need attention.

The current direction list has [the same problems as the task list](2026-02-18-task-list.md).

We redesigned the direction list to address these problems.

## How it works

Users reach the direction list by clicking "Directions" in the main navigation.

When users first visit the direction list, it is automatically filtered to show only their own directions. Paralegal officers see directions filtered to them as paralegal officer. Prosecutors see directions filtered to them as prosecutor.

Directions are grouped by due date so the most urgent work is always at the top:

- Overdue
- Due today
- Due tomorrow
- Due this week
- Due later

Each direction card shows:

- direction description (as a link)
- status tag (where applicable)
- URN
- operation name (where applicable)
- defendant
- prosecutor
- paralegal officer
- due date
- assignee
- latest note (where applicable)
- custody time limit (where applicable)
- unit
- hearing date and type (where applicable)

We only show fields that have values, so cards do not show empty rows.

![The direction list for Rachael Harvey showing 21 directions filtered to her as paralegal officer, grouped under Overdue, Due today, Due tomorrow, Due this week, and Due later headings.](directions/rachael-default-filters.png)

### Filters

The filter panel is visible on the left side of the page, not hidden behind dropdowns.

There are 5 filter groups:

- **Prosecutor** - searchable list of prosecutors
- **Paralegal officer** - searchable list of paralegal officers
- **Unit** - the units the user belongs to
- **Due** - filter by when the direction is due
- **Assignee** - filter by defence or prosecution

When filters are cleared, the full list of directions across all units is shown.

![The direction list with no filters applied, showing 372 directions across all units.](directions/rachael-no-filters.png)

### Prosecutors

Prosecutors see the same page with the prosecutor filter defaulted to their own name.

![The direction list for Simon Whatley (a prosecutor) showing 19 directions filtered to him as prosecutor, grouped under Overdue, Due today, Due tomorrow, and Due later headings.](directions/simon-default-filters.png)

## Future considerations

We considered combining tasks and directions into a single unified list. In practice, tasks and directions are modelled differently and have different fields, statuses, and workflows. Merging them would have required significant changes to the underlying data model.

We decided to keep them separate for now.
