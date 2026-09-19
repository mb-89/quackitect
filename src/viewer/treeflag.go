// A row carries one boolean key a flag, and one column draws them as letters.
// A letter stands lit where its key reads true, and dim where it reads false.
// The letters hold fixed places, so nothing shifts as one lights. The keys stay
// ordinary keys, so the filter reads them with no new word.
// [[spec/design_output/tree-view#a-flag-draws-a-letter]]

package main

import "strings"

// The column whose letters the flags draw in. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
const flagsKey = "flags"

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t *Tree) Flagged(said []Flag) {
	t.flags = append([]Flag(nil), said...)
}

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) Flags() []Flag { return append([]Flag(nil), t.flags...) }

// A lit letter stands upper, and a dim one lower, so every place stays filled. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) Letters(one Item) string {
	said := make([]string, 0, len(t.flags))
	for _, held := range t.flags {
		value, _ := one.Field(held.Key)
		if strings.EqualFold(strings.TrimSpace(value), "true") {
			said = append(said, strings.ToUpper(held.Letter))
			continue
		}
		said = append(said, strings.ToLower(held.Letter))
	}
	return strings.Join(said, "")
}
