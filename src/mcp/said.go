package main

// THE ONE RULE ABOUT RECORDING WHAT SOMEBODY SAID.
//
// It is written in doc/guidance/behaviour.md, projected from there into every
// file an agent reads, and repeated here because the tool description is not a
// projection. Two copies of one rule drift, and these two already had: the
// guidance said use it whenever you are unsure and this layer said look in the
// log first, which is the forgettable condition the guidance exists to remove.
//
// SaidRuleHolds in said_test.go is what keeps them together. It reads the
// guidance and refuses if this sentence is not in it, word for word.
const saidRule = "Use it whenever you are unsure. " +
	"The verb refuses a repeat, so recording one twice is not a thing " +
	"you can do, and a rule with no condition on it is a rule you cannot apply " +
	"wrongly."
