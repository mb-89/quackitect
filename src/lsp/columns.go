// A column in bytes and in units. A finding and a Go string count bytes, and the protocol
// counts UTF-16 units, so a column crossing the pipe turns from one to the
// other here.
// [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
package main

import (
	"unicode/utf16"
	"unicode/utf8"
)

// The UTF-16 units before a byte of the row. A byte inside a character counts from that character's start. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func unitsTo(row string, at int) int {
	if at > len(row) {
		at = len(row)
	}
	for at > 0 && at < len(row) && !utf8.RuneStart(row[at]) {
		at--
	}
	return units(row[:at])
}

// A column in UTF-16 units, the unit the protocol counts by default. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func units(said string) int {
	return len(utf16.Encode([]rune(said)))
}
