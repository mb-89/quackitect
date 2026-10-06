//go:build windows

// The child's end runs taskkill over its tree, as proc.Whole readies it, since
// Windows keeps no process group a kill reaches.
// [[spec/tickets/the-check-ends-what-it-drops]]
package main
