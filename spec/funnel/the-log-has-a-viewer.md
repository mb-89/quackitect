---
kind: [[funnel]]
about: reading the log this tree has yet to write
---

# Buy the viewer, and test it in the integrated terminal first

Two terminal viewers do what a person wants from a log. Both ship a Windows
binary the install script takes the way it takes Vale and Biome. So the build
here is the log format, and the viewer is a download.

The acceptance test is one thing: it runs inside the editor's integrated
terminal, where a person already sits.

## What an earlier line built, and what it cost

That line wrote its own viewer: 2426 lines of Go over Bubble Tea, Lipgloss and
fsnotify, reading a file and opening a detail beside it.

It carries a flag called `--keys`, whose help reads "print every key this
terminal sends, and nothing else". A flag like that exists because keys stopped
working somewhere, and the fastest way to find out was to ask the terminal.

So the cost of building was 2426 lines and a key problem that outlived them.

## What is on the shelf

| tool | version | stack | fit |
|---|---|---|---|
| `jlv` | 1.9.2, 2026-08-20 | Go, **Bubble Tea and Lipgloss** | a compact list, Enter opens the JSON tree |
| `lnav` | 0.14.1, 2026-09-05 | C++, ncurses | 80 formats, SQL over the rows, filters |

- jlv: https://github.com/hedhyw/json-log-viewer
- lnav: https://github.com/tstack/lnav

## Test lnav first, and jlv second

jlv matches the behaviour asked for almost exactly. It also runs on the same
Bubble Tea stack the earlier viewer ran on, so whatever made keys fail there is
a fair bet to fail here. Buying a second copy of a known problem buys nothing.

lnav is a different stack, so it fails differently or not at all. It offers more
than a person asked for, which costs a little learning and no correctness.

Neither can be judged from a piped shell, because a TUI wants a real terminal.
So this decision waits on somebody opening the integrated terminal and running
both.

## What this tree owes before either helps

1. Write the log at all. Nothing writes one today.
2. Write it as JSON lines, one object per line, because that is what both read.
3. Settle the fields every line carries, so a viewer groups and filters on them.
4. Add the winner to `src/scripts/install.sh` and `install.ps1`, pinned.
5. Give the command line a `log` verb that prints the file or pipes it.

## What to decide first

- Which viewer survives the integrated terminal. Run both there before anything.
- Which fields a line carries. A time, a session, a door, a verb, a subject and
  a result is the starting guess.
- Where the log lives. `.se/log/` keeps it off every clone, and a cloud box
  loses it with the box.
- Whether a cloud box ships its log back in the handover, or lets it go.
