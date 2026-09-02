package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// A BUCKET IS THE PERSON'S OWN NAME FOR A GROUP.
//
// It does not move the work. The state stays exactly as it was and only the
// grouping changes, which is the whole difference between a bucket and a state.
//
// TWO KINDS OF GROUP, AND THE EDITOR DRAWS BOTH. A query is a filter written
// into the view file: it says which rows it takes and a row draws under every
// query that takes it. A bucket is a place somebody put a row. The view groups
// by the bucket and declares the queries beside it, so neither one can answer
// the other's question.
//
// THE BUCKET IS MADE FIRST AND NAMED AFTERWARDS. v3 learned this the hard way:
// a webview refuses a browser prompt, so the control that asked for a name did
// nothing at all when pressed. An empty name asks for a fresh one, because the
// engine knows which names are taken and a client would have to guess.
//
// ONLY A PERSON MAKES ONE. WriteFieldBy refuses a bucket from anybody else, and
// these verbs go through it.

// FileInBucket puts every token in one bucket and answers its name.
func FileInBucket(r Roots, ids []string, name, by string) (string, error) {
	if len(ids) == 0 {
		return "", fmt.Errorf("say which tokens: a bucket with nothing in it is a bucket nobody can see")
	}
	name = strings.TrimSpace(name)
	if name == "" {
		name = freeBucketName(r)
	}
	if state, taken := isState(r, name); taken {
		return "", fmt.Errorf("%s is a state of the %s process, so a bucket cannot be called that. "+
			"Two things with one name is two things a reader cannot tell apart", name, state)
	}
	for _, id := range ids {
		t, err := LoadToken(r, id)
		if err != nil {
			return "", err
		}
		if err := WriteFieldBy(&t, "bucket", name, by); err != nil {
			return "", err
		}
		if err := SaveToken(r, t); err != nil {
			return "", err
		}
	}
	return name, nil
}

// RenameBucket writes one name over another, on every token carrying it.
//
// A STATE CAN NEVER BE RENAMED FROM HERE, and the refusal says so rather than
// quietly doing nothing. A state is the process's word for where work stands,
// and it is in the process file where a person can change it once for every
// token at a time.
func RenameBucket(r Roots, from, to, by string) (int, error) {
	from, to = strings.TrimSpace(from), strings.TrimSpace(to)
	if from == "" || to == "" {
		return 0, fmt.Errorf("say both the name it has and the name it should have")
	}
	if state, taken := isState(r, from); taken {
		return 0, fmt.Errorf("%s is a state of the %s process, not a bucket. "+
			"A state is where work stands and the process moves it. "+
			"File the tokens into a bucket of your own first, and then the bucket can be renamed",
			from, state)
	}
	if state, taken := isState(r, to); taken {
		return 0, fmt.Errorf("%s is a state of the %s process, so a bucket cannot be called that. "+
			"Two things with one name is two things a reader cannot tell apart", to, state)
	}
	moved := 0
	for _, t := range Tokens(r) {
		if t.Bucket != from {
			continue
		}
		if err := WriteFieldBy(&t, "bucket", to, by); err != nil {
			return moved, err
		}
		if err := SaveToken(r, t); err != nil {
			return moved, err
		}
		moved++
	}
	if moved == 0 {
		return 0, fmt.Errorf("no token is in a bucket called %s", from)
	}
	return moved, nil
}

// isState answers whether a word is a state of any process this copy knows,
// and which process that is.
//
// IT ASKS THE PROCESS FILES RATHER THAN A LIST HERE. The engine held eleven
// states and this walked them; a process declares its own now, so a bucket
// colliding with one is a question only the files can answer.
func isState(r Roots, name string) (string, bool) {
	for _, which := range AvailableProcesses(r.Method) {
		p, err := LoadProcess(r.Method, which)
		if err != nil {
			continue
		}
		for _, s := range p.StateNames() {
			if s == name {
				return which, true
			}
		}
	}
	return "", false
}

// freeBucketName answers a name nothing is using yet.
//
// THE ENGINE PICKS IT because the engine knows what is taken. A client guessing
// would collide with a bucket it cannot see, and two buckets with one name are
// one bucket as far as the grouping is concerned.
func freeBucketName(r Roots) string {
	taken := map[string]bool{}
	for _, t := range Tokens(r) {
		if t.Bucket != "" {
			taken[t.Bucket] = true
		}
	}
	var names []string
	for n := range taken {
		names = append(names, n)
	}
	sort.Strings(names)
	for n := 1; ; n++ {
		want := "group " + strconv.Itoa(n)
		if _, isState := isState(r, want); !taken[want] && !isState {
			return want
		}
	}
}
