package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// A BUCKET IS THE PERSON'S OWN NAME FOR A GROUP.
//
// It does not move the work. The status stays exactly as it was and only the
// grouping changes, which is the whole difference between a bucket and a state.
// The view groups by if(bucket, bucket, status), so a token carrying a bucket
// groups under it and one carrying none groups under its status.
//
// THE BUCKET IS MADE FIRST AND NAMED AFTERWARDS. v3 learned this the hard way:
// a webview refuses a browser prompt, so the control that asked for a name did
// nothing at all when pressed. An empty name asks for a fresh one, because the
// engine knows which names are taken and a client would have to guess.
//
// ONLY A PERSON MAKES ONE. WriteFieldBy already refuses a bucket from anybody
// else, and these verbs go through it.

// FileInBucket puts every token in one bucket and answers its name.
func FileInBucket(r Roots, ids []string, name, by string) (string, error) {
	if len(ids) == 0 {
		return "", fmt.Errorf("say which tokens: a bucket with nothing in it is a bucket nobody can see")
	}
	name = strings.TrimSpace(name)
	if name == "" {
		name = freeBucketName(r)
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
// A STATUS CAN NEVER BE RENAMED FROM HERE, and the refusal says so rather than
// quietly doing nothing. A status is the system's word for where work stands.
func RenameBucket(r Roots, from, to, by string) (int, error) {
	from, to = strings.TrimSpace(from), strings.TrimSpace(to)
	if from == "" || to == "" {
		return 0, fmt.Errorf("say both the name it has and the name it should have")
	}
	if isStatus(from) {
		return 0, fmt.Errorf("%s is a status, not a bucket. "+
			"A status is the system's word for where work stands, and the pull moves it. "+
			"File the tokens into a bucket of your own first, and then the bucket can be renamed", from)
	}
	if isStatus(to) {
		return 0, fmt.Errorf("%s is a status, so a bucket cannot be called that. "+
			"Two things with one name is two things a reader cannot tell apart", to)
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

// isStatus answers whether this word is one of the states a token can be in.
// The list is the engine's, so nothing else has to keep a copy.
func isStatus(name string) bool {
	for _, s := range []Status{Backlogged, Open, InWork, Submitted, InReview, Closed} {
		if string(s) == name {
			return true
		}
	}
	return false
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
		if !taken[want] && !isStatus(want) {
			return want
		}
	}
}
