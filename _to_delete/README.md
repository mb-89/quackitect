# quackitect v4

Level 0. Nothing above it exists yet.

## What is here

| Folder | What it holds |
|---|---|
| `docs/` | The design. Start with `user-stories.md`, then `level-0-design.md`. |
| `viewer/` | The log window. A general program that reads log files. Go. |
| `bin/` | Built viewers. `logview.exe` is Windows, `logview` is Linux. |
| `engine/` | Empty. Next. |
| `extension/` | Empty. Next. |
| `setup/` | Empty. Next. |

## Look at the log window

Windows:

    bin\logview.exe --demo

Linux:

    bin/logview --demo

Demo mode writes a made-up log twice a second and views it. It exists so the
window can be seen before there is an engine to fill it.

To read a real log file:

    bin\logview.exe <file>

## Keys

    up down        move the selection, or scroll the pane that has focus
    page up down   move a screen at a time
    home end       first line, newest line
    tab            move focus between the list and the details
    ctrl+d         open the details, and close them again
    esc            clear the filter
    ctrl+c         quit

There is no mouse. Mouse tracking takes selection and copy away from the
terminal, and a log nobody can copy from has a hole in it.

## Filter

Type. There is no key to press first.

    word              every column contains "word"
    name:word         that column contains "word"
    /pattern/         every column matches the regular expression
    name:/pattern/    that column matches it
    -word             lines that contain "word" are removed
    "two words"       one term, not two

Terms narrow together. Columns are `time src kind actor msg session ok`, and
any field inside a record's details can also be named.

An unfinished pattern is not an error. The last filter that worked stays on
screen and the status line says which.

## Build

Go 1.24 or later.

    cd viewer
    go test ./...
    go build -o ../bin/logview .

Cross-compile for Windows from Linux:

    GOOS=windows GOARCH=amd64 go build -o ../bin/logview.exe .
