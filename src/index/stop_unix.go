//go:build !windows

// A unix folder takes its removal while a process stands in it, so the caller of a stop waits on nothing.
// [[spec/tickets/smoke-waits-for-the-door]]
package index

// [[spec/tickets/smoke-waits-for-the-door]]
func awaitsExit(int) {}
