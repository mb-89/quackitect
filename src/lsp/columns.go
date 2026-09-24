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

// The byte of the row an editor's column names, and the row's end where the column runs past it. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func byteAt(row string, character int) int {
	counted := 0
	for at, said := range row {
		if counted >= character {
			return at
		}
		counted += utf16.RuneLen(said)
	}
	return len(row)
}
