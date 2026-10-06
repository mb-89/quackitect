//go:build !windows

// The child stands in a process group of its own, and its end kills the group,
// as proc.Whole readies it.
// [[spec/tickets/the-check-ends-what-it-drops]]
package main
