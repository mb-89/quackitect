---
id: ref-executable-documentation
title: Executable documentation — doctest and rustdoc
url: https://docs.python.org/3/library/doctest.html
kind: tool
version: Python 3 standard library, and the rustdoc book
accessed: 2026-08-25
tags:
  - overhaul
  - documentation-drift
  - prior-art
---

The mature answer to prose going stale, and it is twenty-five years old.

## Python's doctest

Its own stated first use case: to check that a module's docstrings are up to
date, by verifying that every interactive example still works as documented.

## Rust's documentation tests

Code blocks inside doc comments are compiled and run by the ordinary test
command. The rustdoc book's stated purpose is to make sure the tests are up
to date and working.

https://doc.rust-lang.org/rustdoc/documentation-tests.html

A PUBLISHED LIMIT: they work in library crates, not in binary crates.

## Why it belongs in the overhaul's reading

IT CONVERTS A JUDGMENT FINDING INTO A MACHINE FINDING. "Is this document
still true?" is the most expensive question an overhaul asks. Wherever the
document carries an example that can be RUN, the question answers itself on
every build and never reaches a sweep at all.

WHAT IT CANNOT DO. Most of this corpus is rules and reasoning rather than
examples, and a rule has nothing to execute. So this closes part of the
prose half and not the whole of it.

READ ON 2026-08-25 through a search engine's extraction of both publishers'
own pages.
