package main

import (
	"testing"
)

// NO TOKEN, NO WRITING. And naming one is what puts it in work, so the agent
// never opens a token as a separate act.
//
// THE OWNER'S WORDS: whenever you do something that writes or can write, you
// have to say which token it is about, and that flips the token to in work. It
// flips any other token per agent to not in work. So one agent never holds more
// than one token, and there are never more tokens open than there are agents
// working.

// THE EXCEPTION IS THE ENGINE BEING THE PROGRAM, NOT THE WORD APPEARING.
//
// It split the command into fields and answered true if ANY field was se after
// quote and path stripping. So the write gate was skipped for any command that
// merely mentioned the engine, and for the whole of a compound whose first half
// ran it: .bin/se pull && python -c "open(...).write(...)" ran the engine and
// then wrote, and the gate saw one string and let it through.
//
// AND NOTHING COULD SEE IT. Every case of the exception in this suite is a case
// that must be ALLOWED, so a test suite full of them cannot notice the exception
// being too wide. These are the negative side.
func TestTheEngineExceptionIsAnchoredToTheProgram(t *testing.T) {
	t.Parallel()
	allowed := []string{
		".bin/se work --on wk-1111111111 --by main",
		"se pull --actor main",
		`"C:\Users\x\.bin\se.exe" --answer "a sentence; with punctuation"`,
		`./.bin/se --answer "one thing && another"`,
	}
	for _, c := range allowed {
		if !runsTheEngine(c) {
			t.Errorf("this runs the engine and nothing else, and was taken out of the exception: %s", c)
		}
	}
	refused := []string{
		"echo se",
		"echo se && rm -rf src/engine",
		".bin/se pull --actor main && python -c print(1)",
		".bin/se pull --actor main; touch notes.md",
		".bin/se pull --actor main | tee notes.md",
		"python -c print(1) && .bin/se pull --actor main",
		"echo $(.bin/se pull --actor main) > notes.md",
		// A REDIRECTION IS A WRITE AND IT NEEDS NO SECOND PROGRAM. This was in
		// the exception, so se --version > src/engine/gate.go was an ungated
		// write of the gate's own source. A reviewer found it on the shipped
		// binary: the redirection was allowed while a plain rg was refused.
		"se --version > src/engine/gate.go",
		".bin/se pull --actor main >> notes.md",
		"se query > q.json 2>&1",
	}
	for _, c := range refused {
		if runsTheEngine(c) {
			t.Errorf("this does not run the engine alone and the write gate was skipped for it: %s", c)
		}
	}
}
