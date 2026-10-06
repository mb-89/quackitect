// The dry probe over fake doors: the door the clone stands, every event posted
// to it, the rows ask answered with the transcript, the clear road, the working
// delta, and the checks read off the door's answers and the log.
// [[spec/tickets/probes-leave-node]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"quackitect/src/modules/hooks"
)

// The address and the token the fake standing file names. [[spec/tickets/probes-leave-node]]
const (
	dryPort  = 6977
	dryToken = "dry-token"
)

// The door's address the fake standing file names. [[spec/tickets/probes-leave-node]]
var dryHook = fmt.Sprintf("http://127.0.0.1:%d/hook", dryPort)

// One post the fake door takes: where, under which token, and the post. [[spec/tickets/probes-leave-node]]
type dryHeard struct {
	url, token string
	post       hooks.Post
}

// A fake door recording each post and answering off the test's answer. [[spec/tickets/probes-leave-node]]
type dryDoor struct {
	mu     sync.Mutex
	heard  []dryHeard
	answer func(post hooks.Post) hooks.Answer
}

func (f *dryDoor) events() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]string, len(f.heard))
	for i, one := range f.heard {
		out[i] = one.post.Event
	}
	return out
}

// The fake doors for a whole dry run: the index's standing writes the standing file in the clone, and the post door answers off the fake door. [[spec/tickets/probes-leave-node]]
func dryBox(t *testing.T, answer func(hooks.Post) hooks.Answer) (boxDoors, *fakeRunner, *dryDoor) {
	t.Helper()
	d, runner, _, _ := fakeBoxDoors(t)
	door := &dryDoor{answer: answer}
	inner := d.run
	d.run = func(argv []string, o runOpts) ranResult {
		if filepath.Base(argv[0]) == "se-index" && len(argv) > 1 && argv[1] == "standing" {
			at := filepath.Join(o.cwd, filepath.FromSlash(hooks.StandingFile))
			_ = os.MkdirAll(filepath.Dir(at), 0o755)
			_ = os.WriteFile(at, []byte(fmt.Sprintf(`{"port":%d,"token":%q}`, dryPort, dryToken)), 0o600)
		}
		return inner(argv, o)
	}
	d.post = func(url, token, body string, _ time.Duration) (int, string, error) {
		var post hooks.Post
		if err := json.Unmarshal([]byte(body), &post); err != nil {
			return 400, err.Error(), nil
		}
		door.mu.Lock()
		door.heard = append(door.heard, dryHeard{url: url, token: token, post: post})
		door.mu.Unlock()
		said := hooks.Answer{Effects: []hooks.Effect{}}
		if door.answer != nil {
			said = door.answer(post)
		}
		text, _ := json.Marshal(said)
		return 200, string(text), nil
	}
	return d, runner, door
}

// The canary block the door's prompt context answers. [[spec/tickets/probes-leave-node]]
func dryCanaryBlock() hooks.Effect {
	return hooks.Effect{Kind: "after", Name: "level0-canary", Text: "Open your first answer with this line:\n\n    " + coldSentence}
}

// The line the door's prompt answer sets before the owner's prompt. [[spec/tickets/probes-leave-node]]
const dryFirst = "Answer the owner's prompt in the chat first."

// A whole dry session: the door stood, every answer level zero gives, and the clear road whole. [[spec/tickets/probes-leave-node]]
func dryWhole() drySeen {
	post := func(event string, e map[string]any, effects ...hooks.Effect) dryPost {
		return dryPost{url: dryHook, event: event, e: e, status: 200, effects: effects}
	}
	return drySeen{
		door:   true,
		prompt: coldPrompt,
		tools:  []string{"mcp__level0__pull", "mcp__level0__find"},
		posts: []dryPost{
			post("session.start", nil),
			post("prompt.submit", map[string]any{"text": coldPrompt}, hooks.Effect{Kind: "event", Result: map[string]any{"text": dryFirst + "\n\n" + coldPrompt}}),
			post("prompt.context", nil, hooks.Effect{Kind: "after", Name: "level0-tools", Text: "the tools"}, dryCanaryBlock()),
			post("classic.MessageDisplay", map[string]any{"delta": coldSentence}),
			post("tool.call", map[string]any{"tool": "Read"}),
			post("tool.call", map[string]any{"tool": "Bash"}, hooks.Effect{Kind: "result", Text: "the cage refuses Bash here"}),
			post("classic.Stop", nil),
			post("prompt.submit", map[string]any{"text": "carry on"}),
			post("tool.call", map[string]any{"tool": "Read"}),
			post("classic.Stop", nil, hooks.Effect{Kind: "clear", Text: hooks.ResumePrompt}),
			post("turn.complete", nil),
			post("classic.Stop", nil),
			post("turn.complete", nil),
		},
		cleared: &dryCleared{
			runs:      []dryRan{{words: "mint dry-probe-clears"}, {words: ""}, {words: "handover --pass"}},
			pulled:    "read-handover stands in your hand.",
			read:      "work  dry-probe-leaf at do",
			committed: dryRan{words: "commit"},
		},
	}
}

// The nth post of the event in the session. [[spec/tickets/probes-leave-node]]
func dryAt(seen *drySeen, event string, nth int) *dryPost {
	for i := range seen.posts {
		if seen.posts[i].event != event {
			continue
		}
		if nth == 0 {
			return &seen.posts[i]
		}
		nth--
	}
	return nil
}

// The check the name reads, and whether the reading holds one. [[spec/tickets/probes-leave-node]]
func dryVerdict(checks []coldCheck, name string) (coldCheck, bool) {
	for _, one := range checks {
		if one.check == name {
			return one, true
		}
	}
	return coldCheck{}, false
}

func TestTheDryProbeStandsTheDoorAndPostsEveryEventToIt(t *testing.T) {
	t.Parallel()
	d, runner, door := dryBox(t, nil)
	probeVerb(d, []string{"dry"})
	ran := ranWords(runner)
	stood := slices.IndexFunc(runner.ran, func(one []string) bool {
		return filepath.Base(one[0]) == "se-index" && len(one) > 1 && one[1] == "standing"
	})
	if stood < 0 {
		t.Fatalf("the index's standing never runs: %v", ran)
	}
	tree := cloneOf(t, runner)
	installed := slices.IndexFunc(ran, func(one string) bool { return strings.HasPrefix(one, "sh ") })
	if installed < 0 || installed > stood || runner.opts[stood].cwd != tree {
		t.Errorf("the standing runs at %d under %+v: %v", stood, runner.opts[stood], ran)
	}
	want := []string{"session.start", "prompt.submit", "prompt.context", "classic.MessageDisplay", "tool.call", "tool.call", "classic.Stop"}
	if got := door.events(); len(got) < len(want) || !slices.Equal(got[:len(want)], want) {
		t.Errorf("the door hears %v", got)
	}
	for _, one := range door.heard {
		if one.url != dryHook || one.token != dryToken || one.post.Root != tree {
			t.Errorf("%s posts to %s under %q from %q", one.post.Event, one.url, one.token, one.post.Root)
		}
	}
	var tools []string
	for _, one := range door.heard {
		if one.post.Event == "tool.call" {
			tools = append(tools, fmt.Sprint(one.post.E["tool"]))
		}
	}
	if len(tools) < 2 || tools[0] != "Read" || tools[1] != "Bash" {
		t.Errorf("the calls read %v", tools)
	}
}

func TestAWholeDryRunPassesEveryCheck(t *testing.T) {
	t.Parallel()
	checks := readsDry(coldWhole(), dryWhole())
	if len(checks) != len(dryChecks) {
		t.Fatalf("the dry probe reads %d check(s): %+v", len(checks), checks)
	}
	for i, one := range checks {
		if one.check != dryChecks[i] || !one.pass {
			t.Errorf("%s fails: %s", one.check, one.evidence)
		}
	}
}

func TestEveryDryCheckFailsOnItsOwnRoad(t *testing.T) {
	t.Parallel()
	fall := probeRow{"level": "warn", "kind": "bridge", "event": "tool.call", "said": "the door answers nothing at " + dryHook}
	cases := []struct {
		name, check string
		rows        []probeRow
		bends       func(seen *drySeen)
		evidence    string
	}{
		{"no standing file", "door", coldWhole(), func(s *drySeen) { s.door = false }, "hooks.json"},
		{"a context naming no canary block", "rules", coldWhole(), func(s *drySeen) { dryAt(s, "prompt.context", 0).effects = nil }, "level0-canary"},
		{"no context row", "rules", []probeRow{coldStarted(), coldStands(), coldHeard(heardSame)}, func(*drySeen) {}, "no context row"},
		{"a prompt read as given", "prompt", coldWhole(), func(s *drySeen) { dryAt(s, "prompt.submit", 0).effects = nil }, "as given"},
		{"no level zero tool", "tools", coldWhole(), func(s *drySeen) { s.tools = nil }, "no level0 tool"},
		{"the pull alone", "tools", coldWhole(), func(s *drySeen) { s.tools = []string{"mcp__level0__pull"} }, "pull alone"},
		{"a refused read", "guard", coldWhole(), func(s *drySeen) {
			dryAt(s, "tool.call", 0).effects = []hooks.Effect{{Kind: "result", Text: "refused"}}
		}, "the read"},
		{"a guarded call passing", "guard", coldWhole(), func(s *drySeen) { dryAt(s, "tool.call", 1).effects = nil }, "guarded call"},
		{"a guarded call the door never answers", "guard", coldWhole(), func(s *drySeen) {
			dryAt(s, "tool.call", 1).effects = []hooks.Effect{{Kind: "result", Text: "the server answers nothing"}}
		}, "answers nothing"},
		{"no level0 row", "canary", []probeRow{coldStarted(), coldStands(), coldContext("level0-tools level0-canary")}, func(*drySeen) {}, "no level0 row"},
		{"a canary with other counts", "canary", []probeRow{coldStarted(), coldStands(), coldContext("level0-tools level0-canary"), coldHeard(heardOther)}, func(*drySeen) {}, heardOther},
		{"a post past the door", "quiet", coldWhole(), func(s *drySeen) { s.posts[3].url = "http://127.0.0.1:6510/event" }, "past the door"},
		{"a post the door refuses", "quiet", coldWhole(), func(s *drySeen) { s.posts[4].status = 500 }, "500"},
		{"a fall past the rules", "quiet", append(coldWhole(), fall), func(*drySeen) {}, "answers nothing"},
		{"no clear road", "clear", coldWhole(), func(s *drySeen) { s.cleared = nil }, "never reaches the clear"},
		{"a pull failing", "clear", coldWhole(), func(s *drySeen) { s.cleared.runs[2] = dryRan{words: "handover --pass", exit: 1, said: "no handover"} }, "answers 1"},
		{"no clear", "clear", coldWhole(), func(s *drySeen) { dryAt(s, "classic.Stop", 1).effects = nil }, "no clear"},
		{"a read the pull never hands", "clear", coldWhole(), func(s *drySeen) { s.cleared.pulled = "nothing waits" }, "after the clear"},
		{"a read handing no leaf", "clear", coldWhole(), func(s *drySeen) { s.cleared.read = "nothing waits" }, "no leaf"},
		{"a commit that falls", "clear", coldWhole(), func(s *drySeen) { s.cleared.committed = dryRan{exit: 1, said: "nothing to commit"} }, "commit"},
	}
	for _, one := range cases {
		seen := dryWhole()
		one.bends(&seen)
		got, ok := dryVerdict(readsDry(one.rows, seen), one.check)
		if !ok || got.pass || !strings.Contains(got.evidence, one.evidence) {
			t.Errorf("%s: %s reads %+v (read %v)", one.name, one.check, got, ok)
		}
	}
}

func TestTheDryProbeAnswersARowsAskBackWithTheTranscript(t *testing.T) {
	t.Parallel()
	d, _, door := dryBox(t, func(post hooks.Post) hooks.Answer {
		switch {
		case post.Event == "prompt.context":
			return hooks.Answer{Effects: []hooks.Effect{dryCanaryBlock()}}
		case post.Event == "tool.call" && post.E["tool"] == "Bash":
			return hooks.Answer{Effects: []hooks.Effect{{Kind: "rows", Call: "c1"}}}
		case post.Event == "agent.spoke":
			return hooks.Answer{Effects: []hooks.Effect{{Kind: "result", Text: "refused"}}}
		}
		return hooks.Answer{Effects: []hooks.Effect{}}
	})
	probeVerb(d, []string{"dry"})
	events := door.events()
	at := slices.Index(events, "agent.spoke")
	if at < 1 || events[at-1] != "tool.call" || door.heard[at-1].post.E["tool"] != "Bash" {
		t.Fatalf("no agent.spoke follows the Bash call: %v", events)
	}
	spoke := door.heard[at].post.E
	if spoke["call"] != "c1" {
		t.Errorf("the spoke post answers call %v", spoke["call"])
	}
	rows, _ := spoke["rows"].([]any)
	var user, assistant bool
	for _, each := range rows {
		row, _ := each.(map[string]any)
		text := fmt.Sprint(row["text"])
		user = user || (row["role"] == "user" && strings.HasSuffix(text, coldPrompt))
		assistant = assistant || (row["role"] == "assistant" && strings.HasPrefix(text, coldSentence))
	}
	if !user || !assistant || !strings.HasPrefix(fmt.Sprint(spoke["text"]), coldSentence) {
		t.Errorf("the spoke post carries %v", spoke)
	}
}

func TestTheClearPassesOnTheResumePromptAndFailsOtherwise(t *testing.T) {
	t.Parallel()
	if got, ok := dryVerdict(readsDry(coldWhole(), dryWhole()), "clear"); !ok || !got.pass {
		t.Errorf("the resume prompt reads %+v (read %v)", got, ok)
	}
	other := dryWhole()
	dryAt(&other, "classic.Stop", 1).effects = []hooks.Effect{{Kind: "clear", Text: "carry on"}}
	if got, ok := dryVerdict(readsDry(coldWhole(), other), "clear"); !ok || got.pass || !strings.Contains(got.evidence, "opens on: carry on") {
		t.Errorf("another prompt reads %+v (read %v)", got, ok)
	}
	twice := dryWhole()
	dryAt(&twice, "classic.Stop", 2).effects = []hooks.Effect{{Kind: "clear", Text: hooks.ResumePrompt}}
	if got, ok := dryVerdict(readsDry(coldWhole(), twice), "clear"); !ok || got.pass || !strings.Contains(got.evidence, "2 clear") {
		t.Errorf("a second clear reads %+v (read %v)", got, ok)
	}
}

func TestTheDryProbeRaisesTheStopBeforeTheTurnsCompletion(t *testing.T) {
	t.Parallel()
	d, _, door := dryBox(t, nil)
	probeVerb(d, []string{"dry"})
	events := door.events()
	ends := 0
	for at, one := range events {
		if one != "turn.complete" {
			continue
		}
		ends++
		if at == 0 || events[at-1] != "classic.Stop" {
			t.Errorf("turn.complete at %d follows no Stop: %v", at, events)
		}
	}
	if ends < 2 {
		t.Errorf("the clear road raises %d turn end(s): %v", ends, events)
	}
}

func TestTheProbeMintsItsGroupUnderTheClonesRoot(t *testing.T) {
	t.Parallel()
	d, runner, _ := dryBox(t, nil)
	probeVerb(d, []string{"dry"})
	minted := slices.IndexFunc(runner.ran, func(one []string) bool {
		return filepath.Base(one[0]) == "RUNME.sh" && len(one) > 1 && one[1] == "mint"
	})
	if minted < 0 {
		t.Fatalf("no mint runs: %v", ranWords(runner))
	}
	tree := cloneOf(t, runner)
	want := []string{filepath.Join(tree, "RUNME.sh"), "mint", "ticket", "spec/tickets/dry-probe-clears.md", "--process=trivial"}
	if !slices.Equal(runner.ran[minted], want) || runner.opts[minted].cwd != tree {
		t.Errorf("the mint runs %v under %+v", runner.ran[minted], runner.opts[minted])
	}
	for i, one := range runner.ran {
		if filepath.Base(one[0]) == "RUNME.sh" && runner.opts[i].env["QUACKITECT_ROOT"] != tree {
			t.Errorf("%v runs under the root %q", one, runner.opts[i].env["QUACKITECT_ROOT"])
		}
	}
}

func TestTheWorkingDeltaReadsTheDiffUntrimmed(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	patch := "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1,2 +1,2 @@\n-a\n+b\n \n"
	runner.answers["git diff"] = ranResult{stdout: patch}
	if got := workingDelta(d); got != patch {
		t.Errorf("the delta reads %q", got)
	}
	if len(runner.ran) != 1 || !slices.Equal(runner.ran[0], []string{"git", "diff", "HEAD", "--binary", "--no-renames"}) || runner.opts[0].cwd != d.root {
		t.Errorf("the delta runs %v", runner.ran)
	}
	refused, runs, _, _ := fakeBoxDoors(t)
	runs.answers["git diff"] = ranResult{code: 128, stdout: "partial"}
	if got := workingDelta(refused); got != "" {
		t.Errorf("a refused diff reads %q", got)
	}
}

func TestTheSmokeStandsTheCloneWithTheRootsBuiltToolsAndInstallsNothing(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	bin := filepath.Join(d.root, filepath.FromSlash(runFolder), "bin")
	for _, one := range []string{"se-index", "se-index.old"} {
		if err := os.MkdirAll(bin, 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(bin, one), []byte(one), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	temp := t.TempDir()
	box := coldBox{temp: temp, tree: filepath.Join(temp, "tree"), port: 7001}
	if !smokeTree(d, func(string) {}, box) {
		t.Fatalf("the smoke stands no tree: %v", ranWords(runner))
	}
	if len(runner.ran) == 0 || !slices.Equal(runner.ran[0], []string{"git", "clone", "--quiet", "--shared", d.root, box.tree}) {
		t.Errorf("the smoke clones with %v", ranWords(runner))
	}
	for _, one := range ranWords(runner) {
		if strings.HasPrefix(one, "sh ") {
			t.Errorf("the smoke installs: %s", one)
		}
	}
	copied := filepath.Join(box.tree, filepath.FromSlash(runFolder), "bin")
	if text, err := os.ReadFile(filepath.Join(copied, "se-index")); err != nil || string(text) != "se-index" {
		t.Errorf("the clone's index reads %q, %v", text, err)
	}
	if _, err := os.Stat(filepath.Join(copied, "se-index.old")); err == nil {
		t.Error("the clone carries the build an update keeps behind")
	}
	pointer, _ := os.ReadFile(filepath.Join(box.tree, filepath.FromSlash(vehiclePointer)))
	if !strings.Contains(string(pointer), jsonString(box.tree)) || !strings.Contains(string(pointer), `"port":7001`) {
		t.Errorf("the pointer reads %q", pointer)
	}
}

func TestTheSmokeReadsEveryCheckButTheClear(t *testing.T) {
	t.Parallel()
	seen := dryWhole()
	seen.cleared = nil
	checks := readsSmoke(coldWhole(), seen)
	if len(checks) != len(dryChecks)-1 {
		t.Fatalf("the smoke reads %d check(s): %+v", len(checks), checks)
	}
	for _, one := range checks {
		if one.check == "clear" || !one.pass {
			t.Errorf("the smoke reads %s as %+v", one.check, one)
		}
	}
}

func TestTheColdTreeChecksTheCloneOutAtTheRevisionItNames(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	temp := t.TempDir()
	box := coldBox{temp: temp, tree: filepath.Join(temp, "tree"), port: 7002, at: "abc123"}
	coldTree(d, func(string) {}, box)
	ran := ranWords(runner)
	checked := slices.Index(ran, "git checkout --quiet --detach abc123")
	installed := slices.IndexFunc(ran, func(one string) bool { return strings.HasPrefix(one, "sh ") })
	if checked < 1 || installed < checked || runner.opts[checked].cwd != box.tree {
		t.Errorf("the checkout runs at %d of %v", checked, ran)
	}
	plain, runs, _, _ := fakeBoxDoors(t)
	box.at = ""
	coldTree(plain, func(string) {}, box)
	for _, one := range ranWords(runs) {
		if strings.HasPrefix(one, "git checkout") {
			t.Errorf("a box naming no revision runs %s", one)
		}
	}
}

func TestATempTreeTheBoxStillHoldsStaysNamedAndTheVerdictStands(t *testing.T) {
	t.Parallel()
	var said []string
	leaves(func(string) error { return fmt.Errorf("EBUSY") }, "/tmp/se-dry-1", func(line string) { said = append(said, line) })
	if len(said) != 1 || said[0] != "the temp tree stays at /tmp/se-dry-1: EBUSY" {
		t.Errorf("a held temp tree says %q", said)
	}
	said = nil
	removed := ""
	leaves(func(at string) error { removed = at; return nil }, "/tmp/se-dry-2", func(line string) { said = append(said, line) })
	if removed != "/tmp/se-dry-2" || len(said) != 0 {
		t.Errorf("a free temp tree removes %q and says %q", removed, said)
	}
}

func TestTheProbeDropsEveryParkInItsCloneAndCommitsIt(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	tree := t.TempDir()
	parked := filepath.Join(tree, "spec", "tickets", "a.md")
	if err := os.MkdirAll(filepath.Dir(parked), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(parked, []byte("---\ntodo: true\nstate: open\n---\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	runner.answers["git grep"] = ranResult{stdout: "spec/tickets/a.md\n"}
	unparked(d, tree)
	if text, _ := os.ReadFile(parked); string(text) != "---\nstate: open\n---\n" {
		t.Errorf("the parked ticket reads %q", text)
	}
	committed := slices.IndexFunc(runner.ran, func(one []string) bool { return slices.Contains(one, "commit") })
	if committed < 0 || runner.opts[committed].cwd != tree || !slices.Equal(runner.ran[committed][len(runner.ran[committed])-2:], []string{"--", "spec/tickets/a.md"}) {
		t.Errorf("the unpark commits with %v", ranWords(runner))
	}
}
