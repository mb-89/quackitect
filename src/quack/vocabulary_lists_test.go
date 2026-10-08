// The word lists this tree ships, read off the disk through the Go slug, the
// Go word set and the Go table of endings: every term says what it means in
// listed words, and points at no note.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
package main

import (
	"regexp"
	"strings"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/prose"
	"quackitect/src/yaml"
)

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
const (
	stemsList  = "spec/config/stems.yaml"
	slugCases  = "spec/config/slug.yaml"
	fewTerms   = 100
	fewCore    = 5000
	shortWords = 3
)

var (
	listRow   = regexp.MustCompile(`^\s*-\s*\{(.*)\}\s*$`)
	rowField  = regexp.MustCompile(`([a-z_]+):\s*("[^"]*"|[^,]*)`)
	meansWord = regexp.MustCompile(`[^a-z-]+`)
)

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func listRowsIn(text string) []map[string]string {
	out := []map[string]string{}
	for _, line := range strings.Split(text, "\n") {
		found := listRow.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		row := map[string]string{}
		for _, field := range rowField.FindAllStringSubmatch(found[1], -1) {
			row[field[1]] = strings.Trim(strings.TrimSpace(field[2]), `"`)
		}
		out = append(out, row)
	}
	return out
}

func listedWords(t *testing.T) map[string]bool {
	t.Helper()
	return prose.Words(shippedText(t, coreList), shippedText(t, termsList), shippedText(t, swapsList))
}

// [[spec/design_output/vocabulary#the-slug-reads-one-source]]
func TestTheSlugAnswersEveryCaseTheSourceHolds(t *testing.T) {
	t.Parallel()
	cases := yaml.AsList(yaml.AsDoc(yaml.Read(shippedText(t, slugCases))).Get("cases"))
	if len(cases) == 0 {
		t.Fatalf("%s holds no case", slugCases)
	}
	for _, one := range cases {
		heading, anchor := yaml.AsString(yaml.AsDoc(one).Get("heading")), yaml.AsString(yaml.AsDoc(one).Get("anchor"))
		if got := check.SlugOf(heading); got != anchor {
			t.Errorf("%q slugs to %q, and wants %q", heading, got, anchor)
		}
	}
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func TestNoTermPointsAtANote(t *testing.T) {
	t.Parallel()
	rows := listRowsIn(shippedText(t, termsList))
	if len(rows) < fewTerms {
		t.Fatalf("the terms hold %d rows, and want %d at least", len(rows), fewTerms)
	}
	for _, one := range rows {
		_, defines := one["defines"]
		for _, value := range one {
			defines = defines || strings.Contains(value, "[[")
		}
		if defines {
			t.Errorf("the term %s points at a note", one["word"])
		}
	}
}

// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func TestEveryTermSaysWhatItMeansInListedWords(t *testing.T) {
	t.Parallel()
	held, stems := listedWords(t), check.StemsIn(shippedText(t, stemsList))
	for _, one := range listRowsIn(shippedText(t, termsList)) {
		loose := []string{}
		for _, word := range meansWord.Split(strings.ToLower(one["means"]), -1) {
			for _, part := range strings.Split(word, "-") {
				if len(part) >= shortWords && !stems.Reaches(part, held) {
					loose = append(loose, part)
				}
			}
		}
		if strings.TrimSpace(one["means"]) == "" || len(loose) > 0 {
			t.Errorf("the term %s means %q, and the lists leave out %v", one["word"], one["means"], loose)
		}
	}
}

// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func TestTheTableOfEndingsReachesEveryCaseItNames(t *testing.T) {
	t.Parallel()
	text := shippedText(t, stemsList)
	cases := yaml.AsList(yaml.AsDoc(yaml.Read(text)).Get("cases"))
	if len(cases) == 0 {
		t.Fatalf("%s holds no case", stemsList)
	}
	for _, one := range cases {
		word, reaches := yaml.AsString(yaml.AsDoc(one).Get("word")), yaml.AsString(yaml.AsDoc(one).Get("reaches"))
		if !check.StemsIn(text).Reaches(word, map[string]bool{reaches: true}) {
			t.Errorf("%s reaches no %s through the table", word, reaches)
		}
	}
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func TestTheCoreHoldsTheStandardTheSeedAndTheCommonWords(t *testing.T) {
	t.Parallel()
	rows := listRowsIn(shippedText(t, coreList))
	from := map[string]bool{}
	for _, one := range rows {
		from[one["from"]] = true
	}
	if len(rows) < fewCore || !from["ste"] || !from["openste"] || !from["common"] {
		t.Fatalf("the core holds %d rows from %v, and wants %d at least from ste, openste and common", len(rows), from, fewCore)
	}
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func TestEverySwapWritesAWordTheListsHold(t *testing.T) {
	t.Parallel()
	held := listedWords(t)
	for _, one := range listRowsIn(shippedText(t, swapsList)) {
		for _, word := range strings.Fields(strings.ToLower(one["write"])) {
			if !held[word] {
				t.Errorf("the swap for %s writes %s, which the lists leave out", one["word"], word)
			}
		}
	}
}
