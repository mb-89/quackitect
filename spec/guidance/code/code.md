---
kind: [[guidance]]
scope: ["every source file in this tree"]
rationale: [[spec/rationales/code]]
---

# Actionables

1. Write code that carries no comment. The name and the shape say what a comment says. The rules below are one principle over code: one place owns a thing. [[spec/guidance/working]] *
2. Open a file with a header of five lines at most, saying what the file is for. It counts nothing and lists no section.
3. Move an explanation into `spec/design_output/<file>.md`, under its own section. *
4. Point at that section from the code: `// [[spec/design_output/<file>#<section>]]`.
5. Name a rule and a reason to switch one off: `// level0: <Rule> - <why>`.
6. Let the formatter own the layout. It runs at the write door, and its result stands.
7. Run `./RUNME.sh check` before you finish, and read what the linter names.
8. Keep the shebang on line one where a file runs as a program.
9. Name a number that carries a meaning once. A number a person sets is a config key, and every other a constant at the top of its module. [[spec/design_output/config#the-magic-numbers-take-names]]
10. Search for the function before you write it. Where one stands, call it, and where one stands close, take it further. *
