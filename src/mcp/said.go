package main

// THE ONE RULE ABOUT RECORDING WHAT SOMEBODY SAID.
//
// It is written in doc/guidance/driving-the-engine.md, projected from there into
// every file an agent reads, and repeated here because a tool description is not a
// projection. Two copies of one rule drift, and these two have drifted twice.
// First this layer said look in the log first, which is the forgettable
// condition the guidance exists to remove. Then the guidance was rewritten and
// this sentence was the one left behind, quoting a rule no file carried.
//
// TestTheToolSaysWhatTheGuidanceSays in said_test.go is what keeps them
// together. It reads the guidance and refuses if this sentence is not in it,
// word for word. When the guidance is rewritten, this moves with it.
const saidRule = "Copy their sentence. Do not shorten it, tidy it or join " +
	"two of them."
