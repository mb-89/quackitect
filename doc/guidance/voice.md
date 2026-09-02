# Voice

How every sentence in this project is written, by a person or an agent.

## Motivation

The same word for the same thing, one idea per sentence, the answer first.
A reader who has to guess what a sentence is for stops reading. An agent
that writes long writes to fill space, and the space then has to be read by
somebody else.

The rules a program can check live in `util/voice-rules.json`, and the engine
refuses a write that breaks one. The rules here are the ones only a writer
can keep.

## Actionables

- Answer first. The conclusion is the first sentence.
- Do it, then say what happened. Do not narrate what you are about to do.
- Answer whole. Do not send a short message before a long piece of work.
- One sentence, one idea. At most 25 words. A paragraph has at most 6 sentences.
- Use the same word for the same thing every time.
- Active voice. Name who acts.
- Do not write words in capitals for emphasis.
- Do not use "just" as a minimiser.
- Know who reads the document before writing a line. Write what that reader
  needs and nothing a different reader would need.
- State a fact only if you own it. Otherwise name where it lives.
- Name the door, not what is behind it: a document says a program exists and
  answers `--help`, and nothing about its flags.
- Say what is. Do not write what a document leaves out.
- Derive a count and paste the command with its answer. Never retype one.
- Mark an estimate as an estimate. Say "I do not know" when you do not know.
- Do not say where you looked, how long it took, or how hard it was.

## Discussion

### The checked rules

`util/voice-rules.json` refuses a semicolon, a contraction, a Latin
abbreviation, and the words that tell a reader how to feel. The word "just"
is not there because a pattern cannot tell the minimiser from the time word,
and it refused four true sentences for one false one when tried.

### Audience

Diataxis, Procida: tutorial, how-to, reference and explanation each have one
reader. ISO/IEC/IEEE 42010: a view exists because named stakeholders hold
named concerns. A README is read by somebody who has just arrived. A
reference is read by somebody at work who needs one exact thing. An
explanation is read by somebody deciding. A document serving two readers
serves neither.

### Authority

Hunt and Thomas: every piece of knowledge has one authoritative
representation. Larman: the class that holds the information states it.
Page-Jones: values that must change together are bound to each other, and a
document sits a long way from the code it repeats. A test decides how many
steps it runs. A folder decides what is in it. A document that repeats one
of those has made a decision it does not own.

### Reach

Parnas: a module hides the decisions expected to change. Holland's law of
Demeter: talk to your immediate friends, not to strangers. A command is a
document's friend. Its flags are strangers.

### Absences

Strunk and White: make definite assertions, and use "not" for denial, never
for evasion. A negative is worth writing only where the reader would
otherwise act on the opposite: a refusal, a limit, a warning.

### Claims

A summary count is written from memory while the body is drafted, the body
moves, and nobody counts again. Twice in one afternoon a map paragraph said
eleven and ten while its own body said ten and eleven. The remedy is to run
the count and paste the answer.

### Corrections

Say what was wrong, then what is right. Once. Do not apologise more than
once for one mistake.
