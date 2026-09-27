---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. No central
config topic stood: each module's keys stood under `<instance>/config/`, and a key
came off its layers. The layers ran override, context, environment, local,
default and built-in. A small config module the index always loaded
resolved them. An agent reads this note before it asks again.

## 1. What it bought

| what the ruling gave | why |
|---|---|
| a run changed with no file changing | `quack cfg set` held an override in memory, gone at restart |
| a script's own values, gone with the script | a context held a lease, so a crash closed it too |
| a value that named its source | `quack cfg show` printed the stack, the way `git config --show-origin` did |
| a file that drifted nowhere unseen | `show` listed the file values under an override standing |
| a switch every machine read alike | a shared key read the default file alone |

Overrides replaced the wipe of the local file a new editor window made in
`src/extension/lib/session.js`.

## 2. Why a module

The core stayed dumb, and the index manager stayed about the system's health.
So the layers went to a module of their own. Declaring a key under
`<instance>/config/` registered an input, and the config module stood as its
writer. That was the
one place a module declared a name another wrote, and the ownership rule said
so.

A module knew nothing about where its config values came from, and read a key
like any other input. So a test seeded a config value the way it seeded any
other.

## 3. Why built-in

The word default had named two things: the project's file and a registration's
value. The owner gave the file the word, and the registration's value became
the built-in value, for config keys and every output name alike.

## 4. What it gave up

A value took a look at the stack before a reader trusted it. A key the project
shared could not change on one machine, even for a test.

## 5. What would make it wrong

A shared key a machine needed apart, such as a path on one platform. That key
then left the shared set, and the ruling held for the rest.
