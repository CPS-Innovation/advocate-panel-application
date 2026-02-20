# Case allocation: Problems to explore

These are problems we've identified around case allocation and the case list.

## Problem 1: Charging managers have no clear way to find cases that need assigning after triage

A charging manager needs to assign all the cases that have just been triaged. But there's no direct way to find these cases.

Some users currently work around this by going to the task list and filtering by specific task types that they know are created after completing the triage:

- 28 day PCD review
- 5 day PCD review
- Further PCD review

They can only filter by one unit at a time and one task type at a time which makes this work even more laborious.

This workaround only works because these users understand the internal system mechanics - they know that these review tasks are created after the initial triage tasks are completed. They have to know that those triage tasks are:

- Check new PCD case
- Check resubmitted PCD case
- Priority PCD review
- Priority resubmitted PCD case

An added complication: the "Priority PCD review" task is dual-purpose. A casework assistant does the triage part first, then the task stays open for the prosecutor. So to know whether a case is ready for allocation, the user has to open the task and check whether the triage part has been done.

Users have to go into tasks when what they actually want is to assign a prosecutor to a case. They filter by task type to infer what's happened. This requires understanding the internal workings of the system - which tasks trigger which other tasks - and even then they sometimes have to open individual tasks to check their status.

### A solution

A prompt on the overview only shown to users with permission to assign cases that says something like:

===

You have 5 cases ready to assign as a result of the triage being completed recently

These are cases where:

- the prosecutor is unassigned
- there are no hearings
- they have a task of 28 day PCD review, 5 day PCD review, or Further PCD review

[Link to cases with filters applied etc]

===

This is not a good solution for multiple reasons:

- A lot of complex content is needed to be clear and transparent
- Having to explain how something simple (cases that need to be assigned) are derived (by inferring multiple attributes)
- It’s not robust - cases may fall through the gaps as the properties of a case are updated independently of triage (happens today)
- It relies on users using the overview page when some may skip the overview to go into cases

## Problem 2: Crown court paralegal business managers have no clear way to find cases sent from magistrates court

A paralegal business manager (PBM) at a crown court needs to allocate cases that have had their first hearing in the magistrates court and been sent to the crown court for trial. Every case - even murder - must have a first hearing in the magistrates court first.

But there's no easy way for users to see this.

We know of two workarounds that some users use:

### Workaround #1 - filtering the task list:

The PBM goes to the task list and filters by type = "Post Sending Review". If they belong to multiple units, they also filter by the crown court unit they're allocating for. Then they scan the results for tasks where the owner is their crown court team.

Even if you ignore how long-winded this is, it only works because the user understands the chain of events:

1. A case has its first hearing in the magistrates court
2. A "Record hearing outcome" task is automatically created on the day of the hearing
3. Someone completes that task, setting the next hearing type (e.g. PTPH) and changing the venue to a crown court
4. This triggers the creation of a "Post Sending Review" task

### Workaround #2 - filtering cases:

The PBM uses "find cases" and filters by:

- Hearing type = PTPH (or other relevant hearing types)
- Court = one of the crown courts
- Live cases = true

Then they sort by prosecutor so that all the cases assigned to their crown court team are grouped together.

Again, even if you ignore how long-winded this is, it only works because the user understands the chain of events.

It's also worth noting that the hearing filters aren't particularly easy to understand. The hearing type filter matches on any hearing associated with the case (past or future), but the results only display the next upcoming hearing.

### Potential solution:

A prompt (similar to solution for problem 1) on the overview only shown to users with permission to assign cases that says something like:

===

You have 5 cases to assign

These are cases where:

- the prosecutor is unassigned
- it has a hearing of type PTPH (or other relevant types)

[Link to cases with filters applied etc]

===

It has the same downsides as problem 1.

## Problem 3: Casework assistants want to allocate immediately after triage

In some areas, the casework assistant allocates a case straight after completing the triage flow. But currently, completing triage returns the user to the task list with no prompt or easy path to allocate the case they just triaged.

### Potential solution:

Two options came to mind:

1. Ask at the end of the triage flow whether they want to allocate, then take them into that flow. However, this is an extra step for users who do not want to allocate immediately.
2. Take the user into the case automatically after completing triage (instead of back to the task list), where they can find actions like allocate and create contacts. However, there's currently nothing in the UI that nudges them towards these actions. And therefore nothing to remind them later once they sign back into the service.

## Problem 4: The case list lacks the filtering and sorting needed for allocation workflows

The current case list in work management only shows the user's cases, so there's no way to see cases that do not have a prosecutor.

The new case list in the prototype hasn't been thought through fully in terms of what we show, how we show it, and what filtering and sorting controls we provide.

## Background: Pre-charge and post-charge

- Pre-charge: Police send a case file for CPS to decide whether to charge.
- Police charged cases: CPS should have charged, but the police had to do it as an emergency (e.g. PACE clock running out).
- Post-charge: The charge has been made by CPS.

In the current system, you can see "not yet charged" next to a case, derived from information against a defendant. But one defendant could have a charge while another doesn't - this would still be treated as post-charge because the uncharged defendant has been added to the case.

Potential filter options to explore:

- Has a charge
- Does not have a charge
- Some have charges
