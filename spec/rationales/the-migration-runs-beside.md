---
kind: [[rationale]]
---

# Why

The owner decided this for the migration, and the decision is final. Every step
landed on `main`. The new system grew beside the old, one slice at a time, and
moved through build, shadow, switch and delete. A switch the owner turned held
each phase. An agent reads this note before it asks again.

## 1. Why `main`

The cloud boxes and the routines pulled `main` alone, so a long-lived branch
would have reached none of them. The cage kept `main` whole on every push.

## 2. Why a shadow

Old and new both computed, and each mismatch wrote a `shadow` row. A difference
showed on real traffic before any reader moved, and one commit rolled a switch
back.

## 3. Why the owner's switch

The cloud answered every other question itself. A switch per phase gave the
owner one moment a phase, after the shadow ran clean, and held nothing else.

## 4. What it gave up

Two paths ran for a while, so a slice cost its shadow code and the rows. A
phase waited on the owner's switch, even where its shadow read clean.

## 5. What would make it wrong

A slice whose old and new paths could not run side by side, such as one writing
the same file. That slice needed a cut over at once, behind its switch.
