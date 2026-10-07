---
kind: [[guidance]]
scope: ["every source file in this tree"]
rationale: [[spec/rationales/code]]
---

# Actionables

1. Write code that carries no comment. The name and the shape say what a comment says. The rules below are one principle over code: one place owns a thing. [[spec/guidance/working]] *
2. Open a file with a header of five lines at most, saying what the file is for. It counts nothing and lists no section.
3. Move an explanation into `spec/design_output/<file>.md`, under its own section. An explanation inside the code goes stale with the next edit, and nobody reads it there. *
4. Point at that section from the code: `// [[spec/design_output/<file>#<section>]]`.
5. Name a rule and a reason to switch one off: `// level0: <Rule> - <why>`.
6. Let the formatter own the layout. It runs at the write door, and its result stands.
7. Run `./RUNME.sh check` before you finish, and read what the linter names.
8. Keep the shebang on line one where a file runs as a program.
9. Name a number that carries a meaning once. A number a person sets is a config key, and every other a constant at the top of its module. [[spec/design_output/config#the-magic-numbers-take-names]]
10. Search for the function before you write it. Where one stands, call it, and where one stands close, take it further. *
11. Write a function pure, and give each one reaching the outside a one-line reason: `// level0: Impure - <why>`. The `purity` guard names an unmarked one. A function reaching the outside in place takes the box into every test of it. [[spec/design_output/model#the-guards-hold-a-baseline]]
12. Promote a step you repeat into a verb or an engine function, and leave no script beside the engine. The `script` guard names a script standing outside it. [[spec/design_output/model#the-guards-hold-a-baseline]]

# Examples

| the rule | do | do not |
|---|---|---|
| 1 | a name saying what the line does | a comment saying what the line does |
| 9 | a constant at the top of the module | the same number in three places |
| 10 | a call to the standing function | a second function doing the same |
