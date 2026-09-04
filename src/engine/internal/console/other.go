//go:build !windows

package main

// Only Windows hands a console to a process that did not ask for one.
func hideOwnConsole() {}
