// The module resolves a leaf's notes off their tags, their envs and the
// leaf's own reads.
// [[spec/tickets/the-guidance-topic-lands]]
package guidance

import (
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const process = `steps:
  - name: design
    tags: ["code"]
    steps:
      - name: draft
        does: writes the approach
      - name: tests-red
        tags: ["testing"]
        reads: ["spec/guidance/own"]
  - name: gate
    tags: ["review"]
`

// What the module answers over the files a case seeds. [[spec/design_output/model#the-fake-index]]
func stepsOver(t *testing.T, files map[string]string) map[string][]Read {
	t.Helper()
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	seeds := map[string]any{}
	for at, text := range files {
		seeds["files/"+at] = q.Content{Hash: "h", Text: text}
	}
	index.Seed(seeds)
	said, _ := index.Run(StepsPort).(map[string][]Read)
	return said
}

func notesOf(reads []Read) []string {
	out := []string{}
	for _, one := range reads {
		out = append(out, one.Note)
	}
	return out
}

func TestFolderTagsReachALeafHoldingThemAll(t *testing.T) {
	steps := stepsOver(t, map[string]string{
		"spec/processes/standard.yaml":      process,
		"spec/guidance/code/style.md":       "# Style\n",
		"spec/guidance/code/testing.md":     "---\ntags: [\"testing\"]\n---\n# Testing\n",
		"spec/guidance/review/reviewing.md": "# Reviewing\n",
	})
	if got := notesOf(steps["standard:design/draft"]); !reflect.DeepEqual(got, []string{"spec/guidance/code/style"}) {
		t.Errorf("design/draft reads %v, and wants the code note alone", got)
	}
	want := []string{"spec/guidance/code/style", "spec/guidance/code/testing", "spec/guidance/own"}
	if got := notesOf(steps["standard:design/tests-red"]); !reflect.DeepEqual(got, want) {
		t.Errorf("design/tests-red reads %v, and wants %v", got, want)
	}
	if got := notesOf(steps["standard:gate"]); !reflect.DeepEqual(got, []string{"spec/guidance/review/reviewing"}) {
		t.Errorf("gate reads %v, and wants the review note alone", got)
	}
}

func TestAnEnvNoteReachesEveryLeafWhereItBinds(t *testing.T) {
	steps := stepsOver(t, map[string]string{
		"spec/processes/standard.yaml": process,
		"spec/guidance/cloud/cloud.md": "---\nenv: [\"SE_CLOUD\"]\n---\n# Cloud\n",
	})
	for _, key := range []string{"standard:design/draft", "standard:gate"} {
		reads := steps[key]
		if !reflect.DeepEqual(reads, []Read{{Note: "spec/guidance/cloud/cloud", Env: []string{"SE_CLOUD"}}}) {
			t.Errorf("%s reads %v, and wants the cloud note under its env", key, reads)
		}
		if got := Notes(reads, map[string]string{}); len(got) != 0 {
			t.Errorf("%s hands %v on a desk, and wants nothing", key, got)
		}
		if got := Notes(reads, map[string]string{"SE_CLOUD": "1"}); !reflect.DeepEqual(got, []string{"spec/guidance/cloud/cloud"}) {
			t.Errorf("%s hands %v on a cloud box, and wants the cloud note", key, got)
		}
	}
}

func TestATopNoteReachesNoLeaf(t *testing.T) {
	steps := stepsOver(t, map[string]string{
		"spec/processes/standard.yaml": process,
		"spec/guidance/voice.md":       "# Voice\n",
	})
	if len(steps) == 0 {
		t.Fatal("the module answers no leaf")
	}
	for key, reads := range steps {
		for _, one := range reads {
			if one.Note == "spec/guidance/voice" {
				t.Errorf("%s reads the top note", key)
			}
		}
	}
}

func TestOwnReadsFollowTheResolved(t *testing.T) {
	steps := stepsOver(t, map[string]string{
		"spec/processes/standard.yaml": process,
		"spec/guidance/own.md":         "# Own\n",
		"spec/guidance/code/style.md":  "# Style\n",
	})
	want := []string{"spec/guidance/code/style", "spec/guidance/own"}
	if got := notesOf(steps["standard:design/tests-red"]); !reflect.DeepEqual(got, want) {
		t.Errorf("design/tests-red reads %v, and wants %v", got, want)
	}
}

// What the module resolves over the method root's files with the work root's layered over them, as quack guidance layers the two. [[spec/tickets/guidance-module-cases-cover-edges]]
func stepsOverBoth(method, work map[string]string) map[string][]Read {
	contents := func(files map[string]string) map[string]q.Content {
		out := map[string]q.Content{}
		for at, text := range files {
			out[at] = q.Content{Hash: "h", Text: text}
		}
		return out
	}
	return Resolve(Layered(contents(method), contents(work)))
}

func TestAWorkRootNoteStandsOverTheMethodRootNote(t *testing.T) {
	steps := stepsOverBoth(map[string]string{
		"spec/processes/standard.yaml":  process,
		"spec/guidance/code/testing.md": "---\ntags: [\"testing\"]\n---\n# Testing\n",
	}, map[string]string{
		"spec/guidance/code/testing.md": "# Testing, with no tag past its folder\n",
	})
	want := []string{"spec/guidance/code/testing"}
	if got := notesOf(steps["standard:design/draft"]); !reflect.DeepEqual(got, want) {
		t.Errorf("design/draft reads %v, and wants the work root's note, which names no testing tag", got)
	}
}

// The mint tool writes a flow list quoted, and a quoted tag reaches the leaf its bare word reaches. [[spec/design_input/level-two#guidance]]
func TestAQuotedTagReachesTheLeafItsBareWordReaches(t *testing.T) {
	steps := stepsOver(t, map[string]string{
		"spec/processes/standard.yaml": process,
		"spec/guidance/code/bare.md":   "---\ntags: [testing, code]\n---\n# Bare\n",
		"spec/guidance/code/flow.md":   "---\ntags: [\"testing\", 'code']\n---\n# Flow\n",
		"spec/guidance/code/block.md":  "---\ntags:\n  - \"testing\"\n  - 'code'\n---\n# Block\n",
	})
	want := []string{"spec/guidance/code/bare", "spec/guidance/code/block", "spec/guidance/code/flow", "spec/guidance/own"}
	if got := notesOf(steps["standard:design/tests-red"]); !reflect.DeepEqual(got, want) {
		t.Errorf("design/tests-red reads %v, and wants %v", got, want)
	}
	if got := notesOf(steps["standard:design/draft"]); len(got) != 0 {
		t.Errorf("design/draft reads %v, and wants none, since it holds no testing tag", got)
	}
}

func TestANoteOpeningWithAnUnderscoreStandsAsADraft(t *testing.T) {
	steps := stepsOver(t, map[string]string{
		"spec/processes/standard.yaml": process,
		"spec/guidance/code/_draft.md": "# Draft\n",
		"spec/guidance/code/style.md":  "# Style\n",
	})
	if got := notesOf(steps["standard:design/draft"]); !reflect.DeepEqual(got, []string{"spec/guidance/code/style"}) {
		t.Errorf("design/draft reads %v, and wants the draft note left out", got)
	}
}
