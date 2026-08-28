---
form: sweep-consistency
judgment: passed at 2026-08-24T13:02:55.694Z
by: agent
signed_off: 2026-08-24T13:02:51.948Z
authors: agent
files: null
---

# Evidence form / sweep-consistency

## current_situation

SIX SURFACES TAUGHT A BEHAVIOUR THAT CHANGED, and all six are corrected. Three of them sat in the code this round edited, which is where a stale teaching surface is easiest to miss.

WHAT CHANGED AND HAD TO BE RE-TAUGHT.

- The job listing shows what is running and nothing else. It used to show every job the session started.
- A finished entry rides one answer and then drops itself. It used to stay in the table for the life of the session.
- Every record still marked running is reaped when the engine starts.
- A run ends itself when its child is killed, even if the output pipes never close.
- The repair state may ask a scoped test question.
- Startup compares the installed editor extension against the rendered source.

THE SIX CORRECTIONS.

- The acknowledge note told the caller the listing still held every settled job. It now points at the record's own id, which is where the record actually is.
- A refusal remedy said the listing shows the jobs this session started. It now says it lists what is running.
- The standing comment said the listing is the history door and sets none. The listing sets `running`, because running is all it lists.
- The account's own doc comment said an entry never leaves the table inside one session. That stopped being true when a finished entry began dropping itself after one ride.
- The boot card told the agent to watch for hung jobs and kill them by hand. The engine closes them now, and noticing is not the agent's job.
- The entry document named the stale-extension trap without naming the guard that now catches it.

ONE DESIGN CLAIM WAS FALSE AND IS NOW ACCURATE. The account's design specification said a judgment whose process dies is settled as failed, and that the table never leaves an entry deciding for ever. One path defeated it: a killed child that never closes its output pipes leaves the promise unsettled, with no process to read and no record standing behind the step. That path is now written into the specification with the two guards that close it.

NO BOOK CHAPTER EXISTS in this tree, so that class is clean by absence rather than by inspection, and this line is the reason.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

NO RESIDUE WAS LEFT STALE. Every surface this sweep found teaching a superseded behaviour was corrected in the same pass, and none was skipped with a reason.

ONE CLASS IS CLEAN BY ABSENCE. No book chapter exists in this tree, so nothing in that class could teach anything.

THE PANEL'S MARKUP CHANGED HOW IT KEEPS THE READER'S PLACE, not what it says. Every surface now asks one function where the reader was, so the behaviour moved while the words a reader sees did not.

## anything_else

