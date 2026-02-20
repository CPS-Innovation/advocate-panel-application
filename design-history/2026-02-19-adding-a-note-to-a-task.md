---
title: Adding a note to a task
date: 2026-02-19
---

Notes are currently accessed via an icon on the task list, which opens a modal dialogue - a pattern we wanted to avoid. The modal has several problems:

- it's cramped and requires scrolling because the form is taller than the viewport
- it has two toggle switches - "flag as urgent note" and "flag as urgent task" - that behave confusingly: selecting both disables "flag as urgent note"
- the previous notes section is blank and takes up a lot of space when there are no notes
- the "Add note" button is pinned to the bottom of the modal, away from the form

We redesigned the flow to use dedicated pages instead.

## How it works

Clicking "Add note" on the [task details page](2026-02-17-adding-a-task-details-page.md) takes the user to a page to enter a note. An inset shows the task name so users can confirm they are adding a note to the right task.

![The note page showing "Note" as the heading, an inset showing the task name "Check directions", a Note textarea, and a Continue button.](adding-a-note-to-a-task/step-1-note.png)

After entering a note, the user is taken to the check answers page:

![The check answers page showing "Check details and add note" as the heading, with task name and note rows, and an "Add note" button.](adding-a-note-to-a-task/step-2-check.png)

The note has a change link to go back and edit it.

After clicking "Add note", the user is taken back to the task details page. A success banner confirms "Note added" and the new note appears at the top of the notes list.

![The task details page for "Check directions" with a green success banner saying "Note added" and the new note appearing at the top of the notes section.](adding-a-note-to-a-task/success.png)

### Activity log

The action is recorded in the activity log as "Task note added", showing the task name and the note text.

![The case activity log showing a "Task note added" entry by Rachael Harvey, with task name "Check directions" and the note text.](adding-a-note-to-a-task/activity-log.png)

## Error messages

### Note

- No note entered: Enter a note
