---
title: Designing the add reminder flow
date: 2026-02-18
---

Users sometimes need to create their own reminders to follow up on something related to a case - for example, chasing a witness statement or checking on a document request. The add reminder flow lets users create a reminder task directly from the case task list.

Users reach the flow by clicking "Add reminder" on the [case task list](2026-02-18-case-task-list.md).

## How it works

The flow has 5 steps:

1. Description
2. Asset recovery
3. Reminder dates
4. Owner
5. Check answers

### Description

The user enters a free-text description of the reminder using a character count component with a 5,000 character limit.

![The description page, showing a text area labelled "Description" with a character count, and a Continue button.](case-task-new/step-1-description.png)

### Asset recovery

The user answers whether this reminder is about asset recovery. This determines the reminder type stored against the task.

![The asset recovery page, showing a yes/no radio question "Is this reminder about asset recovery?" with a Continue button.](case-task-new/step-2-asset-recovery.png)

### Reminder dates

The user enters three dates:

- **Reminder date** - when the user should first be reminded
- **Due date** - when the task must be completed by
- **Escalation date** - when the task should escalate if still incomplete

![The reminder dates page, showing three date input fields: reminder date, due date, and escalation date, each with day, month, and year fields.](case-task-new/step-3-dates.png)

### Owner

The user selects who the reminder is assigned to. The list includes all users in the case's unit, with the signed-in user shown first as "(you)". Admin pool and other team options for the unit appear at the bottom of the list.

![The owner page, showing a long list of radio options including the signed-in user listed first as "Rachael Harvey (you)", followed by other users and then team pools.](case-task-new/step-4-owner.png)

### Check answers

The user reviews all their answers before confirming. Each row has a Change link to go back and edit that step.

![The check answers page showing description, asset recovery, reminder date, due date, escalation date, and owner, each with a Change link. An "Add reminder" button appears at the bottom.](case-task-new/step-5-check.png)

### Confirmation

After submitting, the user is taken to the new task's detail page. A success banner confirms "Reminder added".

![The task details page for "Chase victim personal statement" with a green success banner saying "Reminder added" at the top.](case-task-new/success.png)
