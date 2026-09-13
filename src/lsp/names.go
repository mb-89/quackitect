// A name holds the words the config allows: a file, a folder, a branch. Vale
// counts a heading's words, and this counts a name's, because Vale reads what
// a file holds.
// [[spec/design_output/level0#a-name-holds-five-words]]
package main

import (
	"regexp"
	"strings"
)

var (
	ending = regexp.MustCompile(`\.[^.]*$`)
	joiner = regexp.MustCompile(`[-_.]+`)
)

func wordsIn(name string) int {
	said := ending.ReplaceAllString(name, "")
	count := 0
	for _, part := range joiner.Split(said, -1) {
		if part != "" {
			count++
		}
	}
	return count
}

func overLong(path string, most int) string {
	if most == 0 {
		return ""
	}
	for _, part := range strings.Split(slashed(path), "/") {
		if part != "" && wordsIn(part) > most {
			return part
		}
	}
	return ""
}
