---
kind: [[guidance]]
scope: ["every agent or person writing or changing Go source"]
out_of_scope:
  - "a beginner's introduction to Go"
  - "the structure, which is [[shape-of-a-program]]"
  - "the craft of a change, which is [[writing-software]]"
  - "what a test depends on, which is [[testing]]"
depends_on:
  - "[[writing-software]]"
  - "[[shape-of-a-program]]"
  - "[[testing]]"
---

# Motivation

The reader is an expert who writes Go well and gains nothing from being told what a slice is.
Go is small, and it leaves the shape of a program to its author.
The compiler accepts one package of a hundred files, a string where a type belongs, and an error assigned to the blank identifier.
So the habits matter more than in a language that refuses them.

This file says how each general rule lands in Go, and adds the rules Go alone needs.
It follows the Google Go style guide and the Go team's code review comments, and names where it departs from them.
The toolchain is Go 1.27, and a rule that leans on a recent release says which.

# Actionables

1. A folder whose files only call each other is a package under `internal/`, named for what it holds. *
2. Return the error. Wrap it with `%w` last and the noun the caller lacks. Match it with `errors.Is` or `errors.AsType`.
3. Assign an error to `_` only with the reason on the same line. *
4. A set of known strings is a named type with constants. `map[string]any` stops where the JSON is decoded. *
5. A package-level `var` holds a flag, a table or a compiled pattern. State travels in a struct. *
6. `os.Exit` and `log.Fatal` live in `main`, once. Every other function returns.
7. Define an interface where it is used, with the methods that caller needs. Return a struct.
8. Write with `os.CreateTemp` beside the target, then `os.Rename`. *
9. `filepath` for a path on disk, `path` for a URL or a key. Convert once, at the edge. *
10. A `_windows.go` file holds the one call that differs. The decision stays in the shared file. *
11. A goroutine has an owner, `sync.WaitGroup.Go` or a channel it closes, and a `context.Context` that stops it.
12. `context.Context` is the first parameter. A doc comment starts with the name it documents.
13. Name for the scope: `i` in a loop, `roots` in a package, no stutter and no number suffix.
14. A test is a table under `t.Run`, calls `t.Parallel()`, uses `t.TempDir()` and `t.Context()`, and compares with `cmp.Diff`. *
15. Run `se format` and then `se lint` before every commit. Which programs those reach is the engine's business, and you name none. *

# Discussion

## 1. Packages

A Go package is the unit of naming, of visibility and of the import graph.
One package `main` of a hundred files has none of the three, so every identifier is global and every file reaches every other.
The call graph shows the seams: a group of files that reaches nothing outside itself is a package.
The Go module layout guide puts a private package under `internal/` and a second binary under `cmd/`, and names no `pkg/` folder.
The cost of a split is an import cycle, and a cycle found is a seam drawn wrong.

## 3. The blank identifier

`_ = f()` compiles, and so does `x, _ := f()`.
Some are right, a `Close` on a read-only file, a `Remove` of a temporary the next line replaces.
The reader cannot tell those from the ones that lost a write, because the line looks the same.
The Google guide asks for the comment, and the lint refuses the bare form.
A write assigned away is then a finding rather than a line nobody reads.

## 4. Strings and maps

A state name held as a string is compared by spelling, and a misspelling is a state that never matches.
A `type State string` with a `const` block gives the reader a list to count from and the lint something to check.
The untyped map has one job: to hold JSON that was decoded before the program knew its shape.
Past that edge, two readers of one map disagree about what it holds, and nothing tells them.
`encoding/json/v2` in Go 1.27 rejects duplicate keys and invalid UTF-8 by default, so decoding into a struct also gets stricter.

## 5. Globals

A package-level `var` is state that every function can reach and no test can isolate.
Go runs a package's tests in one process, so two parallel tests that touch one global race.
A test that sets the environment sets it for the whole process, so it runs alone and says why beside the call.
A struct built in `main` and handed down replaces most globals, and a test builds its own.
Uber's guide prefixes the ones that stay with an underscore, so a reader sees the reach.

## 8. Rename

`os.WriteFile` truncates the file and then writes, so a reader in between sees an empty or a partial file.
`os.CreateTemp` in the same folder, then `os.Rename`, replaces the target in one call.
The Go documentation says the replace is atomic on Unix and not on other platforms.
On Windows it is the narrowest window available, and a reader of the file still retries.
The temporary lives beside the target because a rename across volumes is a copy.

## 9. Two path packages

`filepath` follows the operating system, and `path` follows a slash.
A JSON key or a link written with `filepath` reads one way on Windows and another on Linux.
A check that compares them goes quiet on one of the two.
A value has one of the two shapes, and it is converted once, at the edge where it changes hands.
`filepath.ToSlash` is that edge going out, and `filepath.FromSlash` coming in.

## 10. Build tags

A build-tagged file is compiled on one platform and unread on the other, so nobody reviews it whole.
It holds the one call that differs, a console handle or a process check, behind a function with a common signature.
The condition, the retry and the message stay in the shared file, where every platform runs them and every test reads them.
A `runtime.GOOS` branch in shared code is the same split made worse, because both halves are compiled and one is never run.

## 14. Tests

The Go team's guidance:

- no assertion library
- a table with named fields
- `got` before `want`

Compare a structure with `cmp.Diff`, use `t.Error` to keep going and `t.Fatal` when the rest is meaningless.
`t.Parallel()` lets the package run on every core, and a test that cannot take it says why beside the call it makes instead.
`t.TempDir()` hands each test a tree that is its own, and `t.Context()` a context that ends with the test.
Time and goroutines go under `testing/synctest`, which runs them on a fake clock.
A five second wait is then a millisecond, and a flaky test is a red one.
`TestMain` builds a binary once, because the link is the cost and every test wants the same binary.

## 15. Two verbs

A rule a program can check is a check, and which program checks it is the engine's business.
An agent that names the program runs one the box may not have.
What it reads back is the operating system's error rather than an answer.
So there are two doors, and the agent names neither a program nor a folder.
`se format` settles layout wherever it can, and it runs first.
A formatter settles what a lint would otherwise report.
`se lint` reads the tokens, the guidance and the Go, and names what breaks a rule in any of them.
A program the engine wanted and this box has not got comes back as a line saying which one.
So a box that checked everything reads differently from one that could not.
