package main

import (
	"path/filepath"
	"strings"
)

// GUIDANCE IS SENT ONCE, AND NEVER IF IT IS ALREADY IN THE PROMPT.
//
// THE OWNER'S WORDS: the guidance is in the system prompt, so we do not need it
// again; and the idea is that guidance is only read once, the engine keeps a
// list of what each agent has read, and that list is cleared on a compact.
//
// MEASURED. Every pull carried the whole Actionables chapter of work-token.md,
// 1,201 bytes, and all fourteen of its rules were already in the system prompt
// the same agent was reading from. It was a quarter of the pull answer, sent
// again on every pull, saying what the agent had been told before it started.
//
// TWO REASONS NOT TO SEND, AND THEY ARE DIFFERENT.
//
// STANDING means the projection already put this file in the prompt. It is
// there on every turn, for every agent, for ever, so the pull never sends it and
// there is nothing to remember.
//
// READ means this agent has been handed it once in this session. That is for
// guidance the standing layer does NOT carry: a lane's own rules, named by a
// token. It is sent the first time and named after that, and a compaction
// forgets it, because a compacted agent no longer holds what it read.

// TheStandingLayer answers which guidance files the projection already puts in
// front of every agent.
//
// IT ASKS THE PROJECTION RATHER THAN A LIST HERE. Which files are standing is
// decided in util/projections.json, and a second list would disagree with it
// the first time anybody parked a file.
func TheStandingLayer(methodRoot string) map[string]bool {
	out := map[string]bool{}
	list, err := LoadProjections(methodRoot)
	if err != nil {
		return out
	}
	for _, p := range list {
		// Only a projection that takes the Actionables chapter is the standing
		// layer. One that copies a cage file is not guidance at all.
		if p.Section != "Actionables" {
			continue
		}
		srcs, err := sourcesOf(methodRoot, p)
		if err != nil {
			continue
		}
		for _, s := range srcs {
			// KEYED ON THE PATH UNDER doc/guidance, not on the file name. Two
			// files called guidance.md, one at the top and one in a lane's
			// folder, are two different files and only one is standing.
			out[strings.TrimPrefix(filepath.ToSlash(s), "doc/guidance/")] = true
		}
	}
	return out
}

// TheGuidanceFor answers what a pull hands this actor, and what to say about
// what it did not hand over.
//
// A NAME IS NOT NOTHING. Where the rules are not sent, the answer says where
// they are, so an agent that has lost them knows what to open.
func TheGuidanceFor(r Roots, actor, name string) (text, says string) {
	if name == "" {
		return "", ""
	}
	if !strings.HasSuffix(name, ".md") {
		name += ".md"
	}
	// A NAME MAY CARRY A FOLDER. A lane's rules live under doc/guidance/<lane>/,
	// and a token names them the way a link does: software-development/writing-go.
	name = filepath.ToSlash(filepath.Clean(filepath.FromSlash(name)))
	if strings.HasPrefix(name, "..") || filepath.IsAbs(name) {
		return "", ""
	}
	where := "doc/guidance/" + name
	if TheStandingLayer(r.Method)[name] {
		return "", where + " is in your prompt already"
	}
	path := filepath.Join(GuidanceDir(r.Method), filepath.FromSlash(name))
	if WasRead(r, actor, path) {
		return "", where + ", which you have read this session"
	}
	text = method(r, name)
	NoteRead(r, actor, path)
	return text, where
}

// WasRead says whether this actor has been handed this file since the last
// compaction. Another actor's read is not this one's: they are separate
// contexts and what one holds the other never saw.
func WasRead(r Roots, actor, path string) bool {
	read, ok := LoadEvidence(r).Reads[clean(path)]
	return ok && read.Actor == actor
}
