# Legal Compliance Concepts in the CPS Case Management System

This document explains the key legal compliance concepts tracked in the system, what they mean, and why they matter to prosecutors and stakeholders.

---

## 1. CTL (Custody Time Limit)

### What it is:
CTL is the maximum time a defendant can be held in custody (remanded in prison) before their trial. It's a legal protection to prevent people being held indefinitely without trial.

### Standard time limits:
- **Magistrates' court (summary offences)**: 56 days
- **Crown Court (indictable offences)**: 182 days from when the case is sent to Crown Court

### Why it matters:
- It's a **statutory duty** - the CPS is legally responsible for monitoring CTLs
- If the limit expires and the trial isn't ready, the defendant must be released on bail (unless the court grants an extension)
- **High compliance risk** - breaching CTLs damages public confidence in the justice system
- These are the **highest priority cases** in the system

### In the system:
- Stored on each `Charge` (because different charges can have different CTL dates)
- Cases with CTL are flagged with red tags throughout the interface
- Shows countdown displays ("3 days", "today", "overdue")
- The system calculates the earliest CTL across all defendants/charges to show the most urgent deadline

---

## 2. STL (Statutory Time Limit)

### What it is:
STL is the time limit for **starting criminal proceedings** for summary offences. For most summary offences, prosecutors have 6 months from the date of the offence to bring charges.

### Why it matters:
- If STL expires, the prosecution **cannot proceed** - the case dies
- Particularly relevant for domestic abuse cases where victims may delay reporting
- CPS must mark cases approaching STL expiry (within 8 weeks) in all police communications

### In the system:
- Stored on each `Charge` as `statutoryTimeLimit`
- Ensures prosecutors don't miss the window to prosecute summary offences
- Especially important for cases requiring pre-charge advice from CPS

---

## 3. PACE Clock

### What it is:
The PACE (Police and Criminal Evidence Act 1984) clock tracks how long **police** can hold someone in custody at a police station **before charging them**. This is different from CTL - PACE is about police detention, CTL is about court custody.

### Time limits:
- **Standard**: 24 hours from arrival at police station
- **Extended**: Up to 36 hours with Superintendent authorization
- **Maximum**: 96 hours with court authorization (Warrant of Further Detention)

### Why it matters:
- After the PACE clock expires, continued detention becomes **unlawful**
- Police must either: charge the person, release them, or get authorization to extend
- Creates urgency for charging decisions - CPS may need to provide rapid advice

### In the system:
- Stored on the `Defendant` model as `paceClock`
- Helps prosecutors understand when a defendant was first detained
- Shows the timeline from initial police detention through to court proceedings
- Relevant when police need urgent charging decisions

---

## 4. Hearing Dates

### What it is:
The scheduled court date(s) when the case will be heard. Cases may have multiple hearings (initial appearance, plea hearing, trial, sentencing, etc.).

### Why it matters:
- **Hard deadline** - all case preparation must be complete before the hearing
- Influences task and direction due dates (everything must be ready before court)
- Affects CTL calculations (if trial can't happen before CTL expires, that's a problem)
- Witness availability, evidence disclosure, legal arguments must all be prepared in time

### In the system:
- Stored in the `Hearing` model (multiple hearings per case)
- Has `startDate`, `endDate`, `type`, `status`, and `venue`
- Tasks and directions are often grouped/sorted by hearing date
- Shows prosecutors what's coming up and helps them prioritize work

---

## 5. Task Due Dates

### What they are:
Tasks are work items that prosecutors must complete (e.g., "Serve evidence", "Review witness statements", "Prepare trial bundle"). Each task has three key dates:

1. **Reminder Date** - When to start thinking about the task
2. **Due Date** - When it should be completed
3. **Escalation Date** - When it becomes critical/overdue

### Severity levels (calculated automatically):
- **Pending** (blue) - All dates in future
- **Due** (yellow) - Past reminder date, due date approaching
- **Overdue** (orange) - Past due date, not yet escalated
- **Escalated** (red) - Past escalation date, urgent action needed

### Why it matters:
- Ensures prosecutors don't miss critical case preparation steps
- Helps managers identify bottlenecks and workload issues
- Prioritizes work across multiple cases
- Prevents last-minute scrambles before hearings

---

## 6. Direction Due Dates

### What they are:
Directions are court orders (from a judge) requiring parties to do something by a specific date. For example:
- "Defence must serve witness list by [date]"
- "Prosecution must disclose unused material by [date]"
- "Both parties must file legal arguments by [date]"

### Assignee types:
- **Prosecution** - CPS must do this
- **Defence** - Defence lawyers must do this (CPS monitors for compliance)

### Why it matters:
- Court orders are **legally binding** - non-compliance can result in case dismissal or sanctions
- Prosecution directions are critical tasks
- Defence directions must be monitored - if defence doesn't comply, prosecution may need to apply for court orders
- Often tied to hearing dates (directions prepare the case for court)

### In the system:
- Stored in `Direction` model with `dueDate` and `assignee`
- Can be defendant-specific (some directions apply to specific defendants)
- Includes outcome tracking and notes
- Shows as separate tab on case overview so prosecutors can see all court orders at a glance

---

## How They Work Together

Think of the system as managing **nested deadlines**:

1. **PACE Clock** (police custody) → triggers need for charging decision
2. **STL** (time to bring charges) → deadline for starting prosecution
3. **CTL** (pre-trial custody) → absolute deadline for trial, drives urgency
4. **Hearing Dates** → fixed court dates that everything works backwards from
5. **Directions** → court orders that prepare the case for hearings
6. **Tasks** → work items to complete directions and prepare for hearings

### Priority hierarchy:
- **CTL cases** = highest priority (someone's in custody, legal deadline)
- **Escalated tasks/directions** = urgent (past critical date)
- **Approaching hearings** = high priority (court date is immovable)
- **Overdue tasks** = medium-high priority (past due date)
- **Due tasks** = normal priority (approaching due date)

---

## Why This Matters to Stakeholders

### Compliance Risk
Missing CTLs, STLs, or direction deadlines can:
- Force release of defendants (CTL)
- Kill prosecutions entirely (STL)
- Result in case dismissal or judicial criticism (directions)
- Damage public confidence in CPS

### Operational Efficiency
The system helps prosecutors:
- See all their critical deadlines in one place
- Prioritize work across multiple cases automatically
- Identify which cases need immediate attention (red flags)
- Track compliance in real-time

### Performance Monitoring
Managers can:
- Identify workload bottlenecks
- Ensure no cases are falling through the cracks
- Demonstrate compliance to inspectors
- Allocate resources to high-priority cases

---

## Sources

- [Custody Time Limits | The Crown Prosecution Service](https://www.cps.gov.uk/prosecution-guidance/custody-time-limits)
- [Police and Criminal Evidence Act 1984 (PACE) – Code C](https://assets.publishing.service.gov.uk/media/652951336b6fbf000db75646/Revised_PACE_Code_C.pdf)
- [24-hour PACE clock | HMICFRS](https://hmicfrs.justiceinspectorates.gov.uk/glossary/24-hour-pace-clock/)
- [Police powers: detention and custody | UK Parliament](https://researchbriefings.files.parliament.uk/documents/CBP-8757/CBP-8757.pdf)
