---
kind: [[funnel]]
about: reading the log this tree has yet to write
---

# Buy the viewer, and write the log to suit it

Two terminal viewers do what a person wants from a log. Both ship a Windows
binary the install script takes the way it takes Vale and Biome, so the build
here is the log format and the viewer is a download.

## What is on the shelf

| tool | version | what it is | fit |
|---|---|---|---|
| `jlv` | 1.9.2, 2026-08-20 | Go, one binary. A compact list, and Enter opens the full JSON tree | the behaviour asked for, almost exactly |
| `lnav` | 0.14.1, 2026-09-05 | C++, one binary. 80 formats, SQLite over the log, filters, highlighting | more than asked for, and more to learn |

Both read JSON lines. Both take a pipe, so `./RUNME.sh log | jlv` needs no file.

- jlv: https://github.com/hedhyw/json-log-viewer
- lnav: https://github.com/tstack/lnav

## Take jlv, and say why

A person wants a list they can walk, and a detail they can open. That is the
whole of jlv, and its keys are Enter and the arrows.

lnav earns its place the day somebody asks a question of the log that a filter
cannot answer, because it puts SQL over the rows. Nothing asks that yet.

## What this tree owes before either helps

1. Write the log at all. Nothing writes one today.
2. Write it as JSON lines, one object per line, because that is what both read.
3. Settle the fields every line carries, so a viewer groups and filters on them.
4. Add the viewer to `src/scripts/install.sh` and `install.ps1`, pinned.
5. Give the command line a `log` verb that prints the file or pipes it.

## What to decide first

- Which fields a line carries. A time, a session, a door, a verb, a subject and
  a result is the starting guess.
- Where the log lives. `.se/log/` keeps it off every clone, and a cloud box
  loses it with the box.
- Whether a cloud box ships its log back in the handover, or lets it go.
