// The path a rule scopes on: a glob one folder deep, a double star reading
// past it, and the underscore parking a draft.
// [[spec/design_output/level0#the-path-a-rule-reads]]
package check

import "testing"

// [[spec/design_output/level0#the-path-a-rule-reads]]
func TestAGlobReadsOneFolderDeepAndADoubleStarReadsPastIt(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		glob, path string
		want       bool
	}{
		{"spec/rationales/*.md", "spec/rationales/a.md", true},
		{"spec/rationales/*.md", "spec/rationales/deep/a.md", false},
		{"spec/rationales/**", "spec/rationales/deep/a.md", true},
		{"spec/rationales/*.md", "spec/guidance/a.md", false},
		{"spec/**/*.md", "spec/a.md", true},
		{"spec/**/*.md", "spec/deep/down/a.md", true},
		{"spec/**/*.md", "other/a.md", false},
		{"*answer.md", "level0-answer.md", true},
	} {
		if got := matches(one.glob, one.path); got != one.want {
			t.Errorf("%s over %s answers %v, and wants %v", one.glob, one.path, got, one.want)
		}
	}
}

// [[spec/design_output/schema#the-underscore-parks-a-draft]]
func TestAnUnderscoreParksADraftAtAnyDepth(t *testing.T) {
	t.Parallel()
	for path, want := range map[string]bool{
		"_note.md": true, "spec/guidance/_note.md": true, "spec\\guidance\\_note.md": true, "_drafts/note.md": true,
		"spec/guidance/note.md": false, "spec/guidance/a_note.md": false,
	} {
		if got := isDraft(path); got != want {
			t.Errorf("%s parks a draft: %v, and wants %v", path, got, want)
		}
	}
}
