package main

import (
	"encoding/json"
	"os"
	"strings"
)

// AN ANSWER THAT IS OWED, BY THE AGENT IT WAS SAID TO.
//
// A prompt going in flips this. An answer going in clears it. Nothing reads
// the log back to work it out: the engine was told the prompt arrived, and a
// program that re-derives a fact it was handed will disagree with itself the
// first time the record and the events part company.
//
// WHILE ONE IS OWED, THAT AGENT DOES NOTHING ELSE. The order was a rule the
// agent kept, and a rule the agent keeps is a rule the agent can forget. It
// forgot twice, once by answering before recording and once by working first.
// So it is a refusal instead.
//
// IT IS KEYED BY ACTOR, because several agents run here at once. One flag for
// the project blocked every one of them on a message given to one, and let any
// of them clear it by answering. That drew three answers to one question.
//
// IT IS A FILE for the same reason the hold is one. The guard is a fresh
// process per event and holds nothing between them.
type Owed map[string][]string

func owedPath(r Roots) string { return r.Private("owed.json") }

// TheyAsked is called where a prompt arrives, and nowhere else.
//
// IT APPENDS. A person who asks two things before either is answered has asked
// two things, and a slot that held one erased the first. The refusal then
// showed the newest question and the older one was handed to nobody.
func TheyAsked(r Roots, actor, said string) error {
	o := loadOwed(r)
	o[actor] = append(o[actor], said)
	return writeOwed(r, o)
}

// TheyWereAnswered is called where an answer arrives, and nowhere else. It
// clears one agent's obligation and leaves everybody else's.
func TheyWereAnswered(r Roots, actor string) error {
	o := loadOwed(r)
	delete(o, actor)
	return writeOwed(r, o)
}

// AnswerOwed answers everything this agent was told and whether it still owes.
// One answer settles the lot, because a person waiting on two questions is
// waiting for one reply that covers both.
func AnswerOwed(r Roots, actor string) (string, bool) {
	said := loadOwed(r)[actor]
	if len(said) == 0 {
		return "", false
	}
	return strings.Join(said, "\n\n"), true
}

// WHERE THIS LIVES, AND WHY IT IS THE ENGINE.
//
// The owner asked whether the flag belongs in the stub instead, since the stub
// is what an agent talks to. It stays in the engine, for now, and wk-4b67d7126a
// settles it.
//
// THE GUARD IS WHAT ENFORCES IT, AND THE GUARD IS THE ENGINE. The stub sees
// only the calls an agent chooses to make through it, and this refusal has to
// reach every call, including the ones that go nowhere near the stub. A flag in
// the stub would be a flag the guard cannot read.
//
// WHAT CHANGES IF A RESIDENT ENGINE LANDS: this file goes away. The obligation
// becomes a field in memory, the guard asks over the port, and .se/owed.json
// stops existing. Nothing about who owns the rule changes, only where the state
// sits, which is the whole point of that token.
func loadOwed(r Roots) Owed {
	o := Owed{}
	b, err := os.ReadFile(owedPath(r))
	if err != nil || json.Unmarshal(b, &o) != nil {
		return Owed{}
	}
	return o
}

func writeOwed(r Roots, o Owed) error {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return err
	}
	b, err := json.Marshal(o)
	if err != nil {
		return err
	}
	return os.WriteFile(owedPath(r), append(b, '\n'), 0o644)
}
