// The dry probe. It stands the fresh box the cold probe stands, starts the
// clone's door, and raises a session's events on it with no model and no key,
// posting each to the door the way the hook module posts it. The smoke runs the
// same session over a shared clone with the root's built tools.
// [[spec/tickets/probes-leave-node]]
package main

import (
	"encoding/json"
	"fmt"
	// level0: OutsideInDoors - the probe stands a fresh clone in a temp folder, as the cold probe does
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"quackitect/src/modules/hooks"
	"quackitect/src/modules/hooks/brief"
)

// The checks the dry probe reads, in order. [[spec/tickets/probes-leave-node]]
var dryChecks = []string{"door", "rules", "prompt", "tools", "guard", "canary", "quiet", "clear"}

// The dry probe's numbers and words: the span an event and the standing take, the fill a measured event carries, the key under it, the characters a line of evidence shows, and the events the session raises. [[spec/tickets/probes-leave-node]]
const (
	dryEventWait    = 240 * time.Second
	dryStandingWait = 60 * time.Second
	dryFill         = 1000
	dryKey          = 500
	dryShown        = 160
	dryOwner        = "composer"
	dryStop         = "classic.Stop"
	dryTurnEnd      = "turn.complete"
	dryToolCall     = "tool.call"
	drySpoke        = "agent.spoke"
	dryClearKind    = "clear"
	dryRowsKind     = "rows"
	dryResultKind   = "result"
	dryEventKind    = "event"
	dryHookPath     = "/hook"
	dryOkFrom       = 200
	dryOkPast       = 300
)

// One post the dry session makes, and the door's answer to it. [[spec/tickets/probes-leave-node]]
type dryPost struct {
	url, event string
	e          map[string]any
	status     int
	effects    []hooks.Effect
}

// What one dry session leaves: whether the door stood, the prompt as given, the tools the index lists, every post, and the clear road. [[spec/tickets/probes-leave-node]]
type drySeen struct {
	door    bool
	prompt  string
	tools   []string
	posts   []dryPost
	cleared *dryCleared
}

// Runs the dry road: the fresh box at the revision --at names, or with the working change, and every check. [[spec/tickets/level0-runs-on-the-door]]
func probeDry(d boxDoors, argv []string) int {
	at := ""
	if i := slices.Index(argv, atFlag); i >= 0 && i+1 < len(argv) {
		at = argv[i+1]
	}
	delta := ""
	if at == "" && slices.Contains(argv, workingFlag) {
		delta = workingDelta(d)
	}
	stands := func(say func(string), box coldBox) bool {
		box.at = at
		return coldTree(d, say, box) != ""
	}
	return probed(d, delta, stands, true, dryChecks)
}

// Runs the smoke road: the shared clone with the root's built tools and the working change, and every check but the clear. [[spec/tickets/level0-smoke-runs-in-seconds]]
func probeSmoke(d boxDoors, argv []string) int {
	delta := ""
	if slices.Contains(argv, workingFlag) {
		delta = workingDelta(d)
	}
	stands := func(say func(string), box coldBox) bool { return smokeTree(d, say, box) }
	return probed(d, delta, stands, false, smokeChecks())
}

// The checks the smoke reads, which hold the clear road off. [[spec/tickets/level0-smoke-runs-in-seconds]]
func smokeChecks() []string {
	return slices.DeleteFunc(slices.Clone(dryChecks), func(one string) bool { return one == "clear" })
}

// Stands the box, runs the session on its door, prints each check, and removes the temp tree. [[spec/tickets/probes-leave-node]]
func probed(d boxDoors, delta string, stands func(func(string), coldBox) bool, clears bool, names []string) int {
	say := func(line string) { fmt.Fprintln(d.out, line) }
	temp, err := os.MkdirTemp("", "se-dry-")
	if err != nil {
		say("FAIL clone: " + err.Error())
		return exitFailed
	}
	box := coldBox{temp: temp, tree: filepath.Join(temp, "tree"), port: coldPort(d.pid), delta: delta}
	defer func() {
		stopsIndex(d, box.tree)
		leaves(os.RemoveAll, temp, say)
	}()
	if !stands(say, box) {
		return exitFailed
	}
	seen := drySession(d, box.tree, clears)
	checks := readsNamed(probeRows(d.disk, filepath.Join(box.tree, filepath.FromSlash(sessionLog))), seen, names)
	for _, line := range coldLines(checks) {
		say(line)
	}
	for _, one := range checks {
		if !one.pass {
			return exitFailed
		}
	}
	return 0
}

// The working change as a patch, read untrimmed, since a trim cuts the blank context line a hunk ends on and git apply reads the rest as corrupt. [[spec/tickets/model-marks-io-names]]
func workingDelta(d boxDoors) string {
	ran := d.run([]string{"git", "diff", "HEAD", "--binary", "--no-renames"}, runOpts{cwd: d.root, timeout: probeWait})
	if ran.code != 0 {
		return ""
	}
	return ran.stdout
}

// The tree as it stands, in seconds: a shared clone carrying the working change and the root's built tools, so the index stands and nothing installs. [[spec/tickets/level0-smoke-runs-in-seconds]]
func smokeTree(d boxDoors, say func(string), box coldBox) bool {
	cloned := d.run([]string{"git", "clone", "--quiet", "--shared", d.root, box.tree}, runOpts{timeout: probeWait})
	if cloned.code != 0 {
		say("FAIL clone: " + tail(orElse(cloned.stderr, cloned.fault)))
		return false
	}
	if !takesDelta(d, box, say) {
		return false
	}
	from := filepath.Join(d.root, filepath.FromSlash(binFolder))
	to := filepath.Join(box.tree, filepath.FromSlash(binFolder))
	if err := d.disk.makeAll(to, coldFolderMode); err != nil {
		say("FAIL clone: " + err.Error())
		return false
	}
	built, _ := d.disk.list(from)
	for _, one := range built {
		if one.IsDir() || strings.HasSuffix(one.Name(), keptOld) {
			continue
		}
		text, err := d.disk.read(filepath.Join(from, one.Name()))
		if err == nil {
			err = d.disk.write(filepath.Join(to, one.Name()), text, coldFolderMode)
		}
		if err != nil {
			say("FAIL clone: " + err.Error())
			return false
		}
	}
	points(d.disk, box)
	return true
}

// The suffix of the build an update keeps behind, which the smoke copies none of. [[spec/tickets/level0-smoke-runs-in-seconds]]
const keptOld = ".old"

// Removes the probe's temp tree, and names it where the box still holds it, since a folder a process lets go of a moment after its stop says nothing of level zero. [[spec/tickets/the-doors-pr-goes-green]]
func leaves(remove func(string) error, temp string, say func(string)) {
	if err := remove(temp); err != nil {
		say("the temp tree stays at " + temp + ": " + err.Error())
	}
}

// The variables every run in the clone takes, so a verb and the index find the clone as their root. [[spec/tickets/the-clear-carries-no-local-work]]
func cloneEnv(tree string) map[string]string {
	return map[string]string{
		"CLAUDE_CODE_REMOTE":                "true",
		"CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1",
		"QUACKITECT_ROOT":                   tree,
	}
}

// One session on the clone's door: the address and token the standing file names, and the transcript the client keeps. [[spec/tickets/level0-runs-on-the-door]]
type dryRun struct {
	d                boxDoors
	tree, url, token string
	seen             *drySeen
	held             []map[string]any
}

// The session a client runs on a cold box: the index stands its door, the owner's prompt arrives, the context reads, the answer's step opens on the canary, a read and a guarded call run, and the turn stops. [[spec/tickets/level0-runs-on-the-door]]
func drySession(d boxDoors, tree string, clears bool) drySeen {
	seen := drySeen{prompt: coldPrompt}
	env := cloneEnv(tree)
	index := filepath.Join(tree, filepath.FromSlash(indexBinary))
	d.run([]string{index, "standing"}, runOpts{cwd: tree, env: env, timeout: dryStandingWait})
	text, ok := readText(filepath.Join(tree, filepath.FromSlash(hooks.StandingFile)))
	var standing hooks.Standing
	if !ok || json.Unmarshal([]byte(text), &standing) != nil {
		return seen
	}
	seen.door = true
	seen.tools = listedTools(d, index, tree, env)
	s := &dryRun{d: d, tree: tree, url: fmt.Sprintf("http://127.0.0.1:%d%s", standing.Port, dryHookPath), token: standing.Token, seen: &seen}
	s.raise("session.start", map[string]any{"session_id": fmt.Sprintf("dry-%d", d.pid), "cwd": tree})
	submitted := coldPrompt
	for _, one := range s.raise("prompt.submit", map[string]any{"text": coldPrompt, "origin": map[string]any{"kind": dryOwner}}) {
		if rewritten, ok := one.Result.(map[string]any); ok && one.Kind == dryEventKind {
			submitted = fmt.Sprint(rewritten["text"])
		}
	}
	s.held = append(s.held, map[string]any{"role": "user", "id": "u1", "text": submitted})
	sentence := canaryOf(s.raise("prompt.context", map[string]any{}))
	answer := sentence + "\nThis session probes a fresh box, so it reads README.md and runs git log."
	s.raise("turn.said", map[string]any{"turnId": "t1", "index": 0, "kinds": map[string]any{"text": 1}, "text": answer})
	s.held = append(s.held, map[string]any{"role": "assistant", "id": "a1", "text": answer})
	s.raise("classic.MessageDisplay", map[string]any{"delta": answer})
	s.raise(dryToolCall, map[string]any{"tool": "Read", "file_path": filepath.Join(tree, "README.md")})
	s.raise(dryToolCall, map[string]any{"tool": "Bash", "command": "git log -1 --oneline", "description": "show the newest commit"})
	s.raise(dryStop, map[string]any{})
	if clears {
		seen.cleared = s.clearRun(env)
	}
	return seen
}

// The tools the clone's index lists, as the harness names them, beside the pull the hook registers itself. [[spec/tickets/the-hook-registers-index-tools]]
func listedTools(d boxDoors, index, tree string, env map[string]string) []string {
	out := []string{pullCall}
	ran := d.run([]string{index, "tools"}, runOpts{cwd: tree, env: env, timeout: dryStandingWait})
	var listed []struct {
		Name string `json:"name"`
	}
	if ran.code != 0 || json.Unmarshal([]byte(ran.stdout), &listed) != nil {
		return out
	}
	for _, one := range listed {
		out = append(out, servedTools+one.Name)
	}
	return out
}

// The canary sentence the context's canary block sets on a line of its own, or nothing. [[spec/design_output/level0#the-canary]]
func canaryOf(effects []hooks.Effect) string {
	for _, one := range effects {
		if one.Name != "level0-canary" {
			continue
		}
		for _, line := range strings.Split(one.Text, "\n") {
			if line = strings.TrimSpace(line); brief.CanaryIn(line, line) == brief.Same {
				return line
			}
		}
	}
	return ""
}

// Posts one event to the door with the bearer token, records the post and the answer, and answers a rows ask back with the transcript on agent.spoke. [[spec/design_output/model#a-post-and-its-answer]] [[spec/tickets/spoke-answer-reaches-the-door]]
func (s *dryRun) raise(event string, e map[string]any) []hooks.Effect {
	post := hooks.Post{Event: event, E: e, Root: s.tree}
	if event == dryToolCall || event == dryStop {
		post.Fill = dryFill
	}
	body, _ := json.Marshal(post)
	status, said, err := s.d.post(s.url, s.token, string(body), dryEventWait)
	var answer hooks.Answer
	if err == nil && status >= dryOkFrom && status < dryOkPast {
		_ = json.Unmarshal([]byte(said), &answer)
	}
	s.seen.posts = append(s.seen.posts, dryPost{url: s.url, event: event, e: e, status: status, effects: answer.Effects})
	for _, one := range answer.Effects {
		if one.Kind == dryRowsKind {
			s.raise(drySpoke, s.spoken(e, one.Call))
			break
		}
	}
	return answer.Effects
}

// The spoke post a held call asks back for: the newest texts and rows of the transcript, with the effect's call id. [[spec/tickets/spoke-answer-reaches-the-door]]
func (s *dryRun) spoken(e map[string]any, call string) map[string]any {
	var texts []any
	rows := make([]any, len(s.held))
	for i, one := range s.held {
		rows[i] = one
		if one["role"] == "assistant" {
			texts = append(texts, one["text"])
		}
	}
	text := ""
	if len(texts) > 0 {
		text = fmt.Sprint(texts[len(texts)-1])
	}
	return map[string]any{"tool": e["tool"], "text": text, "texts": texts, "rows": rows, "call": call}
}

// The turn's two ends, in the order the live host names: the Stop, then the turn's completion. [[spec/tickets/the-clear-runs-live-remote]]
func (s *dryRun) ends() {
	s.raise(dryStop, map[string]any{})
	s.raise(dryTurnEnd, map[string]any{"reason": "answer", "answer": dryAnswer})
}

// Reads every dry check off the rows and the session. [[spec/tickets/level0-runs-on-the-door]]
func readsDry(rows []probeRow, seen drySeen) []coldCheck { return readsNamed(rows, seen, dryChecks) }

// Reads every dry check but the clear, which the smoke holds off. [[spec/tickets/level0-smoke-runs-in-seconds]]
func readsSmoke(rows []probeRow, seen drySeen) []coldCheck {
	return readsNamed(rows, seen, smokeChecks())
}

// Reads the named checks, in order. [[spec/tickets/level0-runs-on-the-door]]
func readsNamed(rows []probeRow, seen drySeen, names []string) []coldCheck {
	reads := map[string]func() (bool, string){
		"door":   func() (bool, string) { return doorStood(seen) },
		"rules":  func() (bool, string) { return rulesHanded(rows, seen) },
		"prompt": func() (bool, string) { return promptHeld(seen) },
		"tools":  func() (bool, string) { return toolsRegistered(coldSteps{tools: seen.tools}) },
		"guard":  func() (bool, string) { return guardHeld(seen) },
		"canary": func() (bool, string) { return canaryHeard(rows) },
		"quiet":  func() (bool, string) { return quietRun(rows, seen) },
		"clear":  func() (bool, string) { return clearHeld(seen) },
	}
	out := make([]coldCheck, len(names))
	for i, name := range names {
		pass, evidence := reads[name]()
		out[i] = coldCheck{check: name, pass: pass, evidence: evidence}
	}
	return out
}

// The nth post of the event, or nil. [[spec/tickets/level0-runs-on-the-door]]
func postAt(seen drySeen, event string, nth int) (int, *dryPost) {
	for i := range seen.posts {
		if seen.posts[i].event != event {
			continue
		}
		if nth == 0 {
			return i, &seen.posts[i]
		}
		nth--
	}
	return -1, nil
}

// The effects that answer the post: its own, or the spoke's where it asked back for rows. [[spec/tickets/spoke-answer-reaches-the-door]]
func answeredAt(seen drySeen, at int) []hooks.Effect {
	effects := seen.posts[at].effects
	if !slices.ContainsFunc(effects, func(one hooks.Effect) bool { return one.Kind == dryRowsKind }) {
		return effects
	}
	for _, one := range seen.posts[at+1:] {
		if one.event == drySpoke {
			return one.effects
		}
	}
	return nil
}

// The text the first refusal of the effects carries, and whether one stands. [[spec/design_output/model#the-effects]]
func refusalOf(effects []hooks.Effect) (string, bool) {
	for _, one := range effects {
		if one.Kind == dryResultKind {
			return orElse(one.Text, probeValueText(one.Result)), true
		}
	}
	return "", false
}

func doorStood(seen drySeen) (bool, string) {
	if seen.door {
		return true, hooks.StandingFile + " stands"
	}
	return false, "the index's standing left no " + hooks.StandingFile
}

// The rules reach the session as the blocks the context read hands the client. [[spec/design_output/level0#rules-ride-the-first-answer]]
func rulesHanded(rows []probeRow, seen drySeen) (bool, string) {
	var names []string
	var effects []hooks.Effect
	if _, context := postAt(seen, "prompt.context", 0); context != nil {
		effects = context.effects
	}
	for _, one := range effects {
		if one.Name != "" {
			names = append(names, one.Name)
		}
	}
	handed := orElse(strings.Join(names, " "), "no block")
	if !slices.Contains(names, "level0-canary") {
		return false, "no level0-canary block: the context read hands the client " + handed
	}
	if canaryOf(effects) == "" {
		return false, "the level0-canary block holds no canary sentence"
	}
	if !slices.ContainsFunc(rows, func(one probeRow) bool { return one.text("kind") == "context" }) {
		return false, "no context row"
	}
	return true, "the context read hands the client " + handed
}

// An owner's prompt reaches the model with the answer-first line before it. [[spec/design_output/level0#which-prompt-opens-a-turn]]
func promptHeld(seen drySeen) (bool, string) {
	said := seen.prompt
	if _, submitted := postAt(seen, "prompt.submit", 0); submitted != nil {
		for _, one := range submitted.effects {
			if rewritten, ok := one.Result.(map[string]any); ok && one.Kind == dryEventKind {
				said = fmt.Sprint(rewritten["text"])
			}
		}
	}
	if said == seen.prompt || !strings.HasSuffix(said, seen.prompt) {
		return false, "the client reads the prompt as given: " + firstLineOf(said)
	}
	return true, "the prompt opens on: " + firstLineOf(said)
}

// A read passes to the client, and a call the rules refuse comes back refused. [[spec/rationales/the-cage-refuses-while-down]]
func guardHeld(seen drySeen) (bool, string) {
	read, _ := postAt(seen, dryToolCall, 0)
	guarded, _ := postAt(seen, dryToolCall, 1)
	if read < 0 || guarded < 0 {
		return false, "the session posts no read and no guarded call"
	}
	if said, refused := refusalOf(answeredAt(seen, read)); refused {
		return false, "the read never reaches the client: " + firstLineOf(said)
	}
	deny, refused := refusalOf(answeredAt(seen, guarded))
	if !refused {
		return false, "the guarded call comes back passed"
	}
	if answersNought.MatchString(deny) {
		return false, "the guarded call comes back: " + firstLineOf(deny)
	}
	return true, "the read passes, and the door refuses: " + firstLineOf(deny)
}

// The door hears the canary off the answer's text. [[spec/design_output/level0#the-line-lands-once]]
func canaryHeard(rows []probeRow) (bool, string) {
	for _, one := range rows {
		if one.text("kind") != "level0" {
			continue
		}
		return one.text("said") == heardSame, "the door hears: " + one.text("said")
	}
	return false, "no level0 row names the canary"
}

// Every post reaches the hooks door and lands, and no row past the rules says level zero answers nothing. [[spec/tickets/level0-runs-on-the-door]]
func quietRun(rows []probeRow, seen drySeen) (bool, string) {
	var astray []dryPost
	for _, one := range seen.posts {
		if !strings.HasSuffix(one.url, dryHookPath) {
			astray = append(astray, one)
		}
	}
	if len(astray) > 0 {
		return false, fmt.Sprintf("%d post(s) go past the door, first %s to %s", len(astray), astray[0].event, astray[0].url)
	}
	for _, one := range seen.posts {
		if one.status < dryOkFrom || one.status >= dryOkPast {
			return false, fmt.Sprintf("the door answers %d to %s", one.status, one.event)
		}
	}
	ruled := slices.IndexFunc(rows, func(one probeRow) bool { return one.text("kind") == "context" })
	for _, one := range rows[ruled+1:] {
		if answersNought.MatchString(one.text("said")) {
			return false, "a row past the rules says: " + one.text("said")
		}
	}
	return true, fmt.Sprintf("%d post(s), every one to the hooks door", len(seen.posts))
}

// The first line of a text, cut to the characters a line of evidence shows. [[spec/tickets/level0-runs-on-the-door]]
func firstLineOf(text string) string {
	line, _, _ := strings.Cut(strings.TrimSpace(text), "\n")
	return evidenceCut(line)
}

// The last line of a text, cut to the characters a line of evidence shows. [[spec/tickets/the-clear-continues-the-session]]
func lastLineOf(text string) string {
	lines := strings.Split(strings.TrimSpace(text), "\n")
	return evidenceCut(lines[len(lines)-1])
}

func evidenceCut(line string) string {
	if runes := []rune(line); len(runes) > dryShown {
		return string(runes[:dryShown])
	}
	return line
}
