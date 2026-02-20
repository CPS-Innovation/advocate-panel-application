# Why we should switch from delivering a vertical slice to a horizontal slice

We’re replacing a 20+ year-old case working system by building individual features across the entire system (vertical slicing). 

This means users have to switch between old and new systems to do their work. Users have told us they will not work this way. And to keep both systems in sync, the new system has to work the same way as the old one - including the same workarounds.

Because users cannot complete their work in the new system alone, every feature we deliver is partial. It's harder to measure real impact or demonstrate clear return on investment. We’re spending money to rebuild technical debt in a modern interface which has merit, but it does not properly solve problems.

## An example: finding cases that need to be assigned after they’re triaged

A charging manager needs to find cases that are ready to assign after triage. 

Ideally they’d go to the case list and filter by something like "ready to assign". But the “status” concept does not exist in the system.

Instead, users have had to learn to go to the task list and filter by specific task types - one unit and one task type at a time. 

This only works because they understand the internal system mechanics: they know these review tasks are created after triage tasks have been completed. They also have to know that one task type (Priority PCD review) is dual-purpose, so they have to open individual tasks to check whether the triage part has been done.

Users are navigating tasks when what they actually want is to assign a prosecutor to a case. This is long-winded, unintuitive and increases cost through additional training, support tickets and slower case processing.

In the new system, to maintain sync with legacy, we’d have to recreate the same roundabout way of working. 

We cannot just let users filter the case list by "ready to assign" because the legacy database does not model that concept - it’s inferred from task states. 

So users get a new interface with the same broken workflow, plus the overhead of using two systems.

## The solution: horizontal slicing

Instead of building individual features - which means an incomplete journey for all cases - build a complete end-to-end journey for one type of case. 

For example, we could start by designing an end-to-end journey for “basic” complexity cases within a specific specialism, in a specific unit. 

The exact slice needs working out with the team, but the principle is to start with the simplest cases with the fewest moving parts.

Users in that slice complete their entire job in the new system. No switching.

### What changes technically

- One-way sync only (legacy feeds new cases in, no write-back)
- Database designed around user needs, not legacy constraints
- For case allocation: we can model "cases ready to assign" directly, no workarounds needed

### What changes for delivery

- Easier to design a coherent end-to-end experience when the team is focused on one complete journey rather than separate features in isolation
- The work done for the first unit carries forward - it can be reused and adapted for new units
- Can measure real impact: processing time, error rates, satisfaction
- Less risk if something goes wrong


## Common concerns

### Concern 1: "We’ve already built vertical features"

Those features inform what works. But continuing down a path the evidence says will fail compounds the mistake rather than correcting it.

### Concern 2: "What if it only works for the first unit?"

That’s the point. 

Start with one unit, meet their needs, then adapt it for the next unit and the next. 

Each expansion tests the system against different ways of working. And if something does not work, the impact is limited to one unit - not the entire system. 

By the time you’ve scaled across several units, you’ve built something that works for everyone.

### Concern 3: "Building end-to-end for one unit will take longer"

Yes, upfront it will.

But we can tie that in with the new tech-stack.

And once you have a complete system working for one unit, you have a solid base to build from. Expanding to the next unit is significantly easier than starting from scratch. 

Slow down now to go much faster later.

We also reduce risk by testing regularly with those users throughout. 

We’ll get to know their needs well, and anything that seems too specific to their situation, we challenge along the way. 

We could even start with two units in parallel to reduce the risk of building something too tailored - that’s a choice within our control.

## What we’d need to decide

1. Which case type and which area for the first slice
2. Success criteria - what "working" looks like before we expand
3. A willing partner unit

## Summary

Most units handle cases in broadly similar ways. 

Building a complete system for one unit will likely cover the majority of what other units need too. The first slice is the hard part - after that, expansion gets faster with each rollout.

The evidence from our team and our users is clear: the current path recreates the problems we’re trying to solve. 

Every vertical feature we build carries the cost of bidirectional sync, legacy schema constraints, and integration testing across two systems. That overhead does not shrink as we build more - it compounds. 

A horizontal slice removes that cost entirely.
