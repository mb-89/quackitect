package main

import (
	"sync"
	"testing"
)

// THE ENGINE'S GIT CALLS REACH THE PROXY THIS BOX IS RUNNING.
//
// Outbound HTTPS on a cloud box goes through an agent proxy on a local port,
// named in HTTPS_PROXY. A container restart moves the port, and a resumed
// session carries the old one, so every git call the engine makes reaches a
// port nothing listens on.
//
// MEASURED. Four claims in a row answered: the push did not run, git fetch,
// unable to access, failed to connect to 127.0.0.1 port 33243. Nothing was
// wrong with the claim or the remote. The same call with the variable set to
// 37347 answered the branch head.
func TestTheEngineFindsTheProxyThatMoved(t *testing.T) {
	const live = "http://127.0.0.1:37347"
	const dead = "http://127.0.0.1:33243"
	t.Setenv("HTTPS_PROXY", dead)
	t.Setenv("https_proxy", dead)
	reads := aProxyNote(t, "Outbound HTTPS from this session goes through a local proxy at "+live+"\n", live)

	got := TheProxyEnv()
	if len(got) == 0 {
		t.Fatal("the engine kept a proxy nothing answers on, so its git calls still cannot leave the box")
	}
	for _, want := range []string{"HTTPS_PROXY=" + live, "https_proxy=" + live} {
		if !has(got, want) {
			t.Errorf("the child environment does not carry %q: %v", want, got)
		}
	}
	if *reads != 1 {
		t.Errorf("the note was read %d times for one answer", *reads)
	}
}

// AND A BOX WITH NO AGENT PROXY IS LEFT ALONE.
func TestABoxWithNoProxyNoteIsLeftAlone(t *testing.T) {
	t.Setenv("HTTPS_PROXY", "http://127.0.0.1:33243")
	was, wasA := readsTheProxyNote, theProxyAnswers
	t.Cleanup(func() { readsTheProxyNote, theProxyAnswers = was, wasA; forgetTheProxy() })
	readsTheProxyNote = func() ([]byte, error) { return nil, errNoNote }
	theProxyAnswers = func(string) bool { return false }
	forgetTheProxy()

	if got := TheProxyEnv(); len(got) != 0 {
		t.Errorf("a box that documents no proxy had its environment written over: %v", got)
	}
}

// AND THE PORT IS ASKED FOR ONCE A RUN, not once a git call.
func TestTheProxyIsAskedForOnce(t *testing.T) {
	const live = "http://127.0.0.1:37347"
	t.Setenv("HTTPS_PROXY", "http://127.0.0.1:33243")
	reads := aProxyNote(t, "a local proxy at "+live+"\n", live)

	for i := 0; i < 3; i++ {
		TheProxyEnv()
	}
	if *reads != 1 {
		t.Errorf("three calls read the note %d times", *reads)
	}
}

// aProxyNote answers the two questions this asks of the box, and counts the
// reads, so a test can drive it without one.
func aProxyNote(t *testing.T, note, live string) *int {
	t.Helper()
	reads := 0
	wasNote, wasAnswers := readsTheProxyNote, theProxyAnswers
	t.Cleanup(func() {
		readsTheProxyNote, theProxyAnswers = wasNote, wasAnswers
		forgetTheProxy()
	})
	readsTheProxyNote = func() ([]byte, error) { reads++; return []byte(note), nil }
	theProxyAnswers = func(url string) bool { return url == live }
	forgetTheProxy()
	return &reads
}

func has(all []string, one string) bool {
	for _, s := range all {
		if s == one {
			return true
		}
	}
	return false
}

var _ = sync.Once{}
