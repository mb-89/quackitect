---
form: generalize-use-cases
by: agent
signed_off: 2026-08-17T11:41:53.192Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

One story from this delta generalizes into a use case that did not exist: the arrival itself.

The corpus's use cases all begin with an agent already on a lane. uc-adjudicate-a-gate, uc-walk-a-record and the rest take the lane as a precondition, which is exactly the assumption this delta found to be unfunded.

## use_cases

- uc-arrive-on-an-unattended-machine

## follow_up

- Extension 8a is the open one: the pull answers wait because the dial stops it. It stays an extension until the owner sets the cloud default, and then it becomes rare rather than certain.
- The failed branch of the guarantee has no test. Nothing asserts that a broken arrival leaves the agent told rather than silently uncaged.

## anything_else

THE GUARANTEE IS DELIBERATELY TWO-SIDED, and that is the one thing worth arguing about this use case.

Most use cases here guarantee a success. This one guarantees either a caged agent on a live lane OR an agent that knows it failed, because the dangerous state is neither of those: an agent holding native tools while believing it is caged.

THAT SHAPE IS ALREADY IN THE REGISTER as raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them. A cage that denies too little fails silently, and this use case is where that failure would have to be caught.
