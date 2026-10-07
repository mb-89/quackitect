// The stamp verb: whether the stamp beside a binary the install builds holds
// the hash of the source its build reads, and the write of that stamp.
// [[spec/tickets/scripts-folder-leaves]]
package main

func init() { registerBox("stamp", stampVerb) }

// A stub until implement lands the stamp. [[spec/tickets/scripts-folder-leaves]]
func stampVerb(_ boxDoors, _ []string) int { return 0 }
