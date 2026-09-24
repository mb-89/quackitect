// The hover over a term: the line the dictionary holds for it, and the source it cites.
// [[spec/design_output/lsp#the-hover-shows-a-term]]
package main

type hover struct {
	Contents markup `json:"contents"`
}

type markup struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}

type stems struct{}

type stemCase struct {
	word    string
	reaches string
}

func hoverAt(tree *Tree, path string, at position) *hover { return nil }

func stemsIn(text string) stems { return stems{} }

func casesIn(text string) []stemCase { return nil }

func (one stems) reaches(word string, held map[string]bool) bool { return false }
