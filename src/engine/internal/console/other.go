//go:build !windows

package console

// Only Windows hands a console to a process that did not ask for one.
func Hide() {}
