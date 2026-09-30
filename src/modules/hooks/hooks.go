// The hooks IO module: it writes each hook event of a session under
// events/<id>, lands it on the folds over session/, and answers the effects
// the hook module runs. Its fake replays a recording.
// [[spec/tickets/the-hooks-door-lands]]
package hooks

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"quackitect/src/modules/hooks/command"
	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The local names the module declares: its out-port, and its default wait in seconds. [[spec/design_output/model#a-caller-sets-its-wait]]
const (
	EventsName  = "events/<id>"
	WaitKey     = "wait"
	defaultWait = 1
)

// The file the listen writes its port to, under the root, which the bridge reads in shadow. .claude/skills/level0/lib/folders.js owns the folder, and a module spells it again. [[spec/tickets/the-hooks-door-lands]]
const StandingFile = ".se/.runtime/hooks.json"

// The protocol's words: the events the door reads, the effects it answers, the harness a post naming none comes from, and the tool prefix and arguments /v1/tools writes. [[spec/design_output/model#the-hook-protocol]]
const (
	toolEvent      = "tool.call"
	stopEvent      = "classic.Stop"
	passKind       = "pass"
	afterKind      = "after"
	resultKind     = "result"
	builtInHarness = "claude-code"
	sessionKey     = "<id>"
	foldsUnder     = "session/<id>/"
	noSession      = "unknown"
	percent        = 100
)

// The cap on a post's body, the span a request's header takes to read, the bytes of the token, and the scheme the post carries it under. [[spec/tickets/hooks-standing-file-names-token]]
const (
	bodyCap           = 1 << 20
	headerReadTimeout = 5 * time.Second
	tokenBytes        = 16
	bearer            = "Bearer "
)

// One post of the hook protocol. Old carries the bridge's own decision, in shadow. [[spec/design_output/model#a-post-and-its-answer]]
type Post struct {
	Event   string         `json:"event"`
	E       map[string]any `json:"e"`
	Root    string         `json:"root,omitempty"`
	Session string         `json:"session,omitempty"`
	Harness string         `json:"harness,omitempty"`
	Fill    any            `json:"fill,omitempty"`
	Old     any            `json:"old,omitempty"`
}

// [[spec/design_output/model#the-effects]]
type Effect struct {
	Kind   string `json:"kind"`
	Text   string `json:"text,omitempty"`
	Result any    `json:"result,omitempty"`
	// The id an effect asking back carries, which the hook module's answer names. [[spec/design_output/model#an-effect-asks-back]]
	Call string `json:"call,omitempty"`
}

// [[spec/design_output/model#a-post-and-its-answer]]
type Answer struct {
	Effects []Effect `json:"effects"`
}

// The result within the wait, or the operation still running past it, field for field as the manager answers it. [[spec/design_output/model#a-caller-sets-its-wait]]
type Called struct {
	Result   any           `json:"result,omitempty"`
	Error    string        `json:"error,omitempty"`
	Running  bool          `json:"running"`
	Handle   string        `json:"handle"`
	Fraction float64       `json:"fraction"`
	Gone     time.Duration `json:"gone"`
}

// The manager's call of an action. [[spec/design_output/model#a-caller-sets-its-wait]]
type Call func(name string, input any, caller string, wait time.Duration) (Called, error)

// One operation of a session, as the manager's book holds it. [[spec/design_output/model#the-agent-does-not-poll]]
type Op struct {
	Handle   string        `json:"handle"`
	Action   string        `json:"action"`
	State    string        `json:"state"`
	Fraction float64       `json:"fraction"`
	Gone     time.Duration `json:"gone"`
	Result   any           `json:"result,omitempty"`
	Error    string        `json:"error,omitempty"`
}

// What the door reaches: the store and the writer of its out-port, the name a local name binds to, the manager's call and its book, and the clock IO module's time. [[spec/tickets/hooks-at-reads-clock-module]]
type Outside struct {
	Store *q.Store
	As    q.Writer
	Bound func(local string) string
	Call  Call
	Ops   func(caller string) []Op
	Now   func() time.Time
	// Takes the shadow row of a live post the door decides apart from its old decision. None writes nothing. [[spec/tickets/copilot-meets-the-hooks-door]]
	Shadow func(row map[string]any) error
	// The tree a post naming no root stands in, what the config says there, and a git read's output there. None reads no tree, no cap and no git. [[spec/tickets/cage-command-rules-port]]
	Root   string
	Config func(root string) Settings
	Git    func(root string, args ...string) string
}

// What the doors read off the config and the box: the words a name holds, whether the box stands in the cloud, the owner's hold and ask, the binding, the graces, the plan's numbers, and each helper tier's model. [[spec/tickets/cage-command-rules-port]] [[spec/tickets/cage-call-holds-port]]
type Settings struct {
	Words        int
	Cloud        bool
	Hold         string
	Ask          string
	Binding      string
	FinishGrace  int
	UpdateGrace  int
	PlanEvery    int
	PlanGrace    int
	PlanMostOpen int
	Helpers      map[string]string
}

// The door keeps each session's place, and the operations it has told the session of. [[spec/design_output/model#the-agent-does-not-poll]]
type Door struct {
	from Outside
	mu   sync.Mutex
	seqs map[string]int64
	told map[string]bool
	// The session of the newest call the holds held under each root, which a spoke post meets. [[spec/tickets/cage-call-holds-port]]
	heldIn map[string]string
}

// One line of a recording whose answer differs from the door's. [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// The module type the wiring loads as hooks. [[spec/tickets/the-hooks-door-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.OutIn(c, EventsName, q.Event{}, q.IO(), q.Doc("the newest hook event of a session")),
		q.CfgIn(c, WaitKey, defaultWait, q.Doc("the seconds an agent's call waits on its action, where the call sets none")),
		q.FoldIn(c, HoldsName, Holds{}, stepHolds, q.Doc("the state the holds keep over a session, and the answer to its newest event")),
	)
}

// A door with no book tells nothing, and one with no binding reads its local names. [[spec/tickets/the-hooks-door-lands]]
func New(from Outside) *Door {
	if from.Bound == nil {
		from.Bound = func(local string) string { return local }
	}
	if from.Ops == nil {
		from.Ops = func(string) []Op { return nil }
	}
	return &Door{from: from, seqs: map[string]int64{}, told: map[string]bool{}, heldIn: map[string]string{}}
}

// Writes the event, calls the action a tool names, and answers the effects: pass where nothing answers the call, and the operations the session meets as added context. [[spec/design_output/model#the-agent-does-not-poll]]
func (d *Door) Hook(post Post) (Answer, error) {
	root := post.Root
	if root == "" {
		root = d.from.Root
	}
	var settings Settings
	if d.from.Config != nil {
		settings = d.from.Config(root)
	}
	session := d.sessionFor(post, root)
	if err := d.writes(session, post, settings, root); err != nil {
		return Answer{}, err
	}
	effects := []Effect{}
	if said, ok := d.held(session, post, root); ok {
		effects = append(effects, said)
	} else if refused := d.refuses(post, root, settings); post.Event == toolEvent && refused != "" {
		effects = append(effects, Effect{Kind: resultKind, Text: refused})
	} else if post.Event == toolEvent {
		said, ok, err := d.calls(session, post.E)
		if err != nil {
			return Answer{}, err
		}
		if ok {
			effects = append(effects, said)
		}
	}
	if len(effects) == 0 {
		effects = append(effects, Effect{Kind: passKind})
	}
	told := d.ended(session)
	if post.Event == stopEvent {
		told = d.running(session)
	}
	if told != "" {
		effects = append(effects, Effect{Kind: afterKind, Text: told})
	}
	said := Answer{Effects: effects}
	d.shadows(post, said)
	return said, nil
}

// Commits the event at the session's next place, a call stamped with the config its holds read, and lands it on every fold over the session. [[spec/design_output/model#the-events-of-a-session]] [[spec/tickets/cage-call-holds-port]]
func (d *Door) writes(session string, post Post, settings Settings, root string) error {
	d.mu.Lock()
	defer d.mu.Unlock()
	store := d.from.Store
	name := d.from.Bound(strings.Replace(EventsName, sessionKey, session, 1))
	seq := d.seqs[session]
	if seq == 0 {
		if last, ok := store.Snapshot().Read(name).(q.Event); ok {
			seq = last.Seq
		}
	}
	hand := q.Hand{Session: session, Agent: textOf(post.E, "agentId", "agent_id")}
	fields := fieldsOf(post)
	if post.Event == toolEvent {
		fields[heldField] = heldOf(settings, root)
	}
	event := q.Event{Seq: seq + 1, At: d.now(), Kind: post.Event, Harness: harnessOf(post), Hand: hand, Fields: fields}
	if _, err := store.Commit(store.Snapshot().Revision, d.from.As, map[string]any{name: event}); err != nil {
		return err
	}
	d.seqs[session] = event.Seq
	for _, fold := range store.Folds(foldsUnder) {
		if err := store.Land(strings.Replace(fold, sessionKey, session, 1), event); err != nil {
			return err
		}
	}
	return store.Land(d.holdsOf(session), event)
}

func (d *Door) now() time.Time {
	if d.from.Now == nil {
		return time.Now()
	}
	return d.from.Now()
}

// The action a tool of /v1/tools names, called within the call's wait or the key's, and its result or the line saying it still runs. [[spec/design_output/model#a-caller-sets-its-wait]]
func (d *Door) calls(session string, e map[string]any) (Effect, bool, error) {
	action, ok := tool.Action(d.from.Store, textOf(e, "tool"))
	if !ok || d.from.Call == nil {
		return Effect{}, false, nil
	}
	args, _ := e["input"].(map[string]any)
	input, err := tool.Input(d.from.Store, action, args)
	if err != nil {
		return Effect{Kind: resultKind, Text: err.Error()}, true, nil
	}
	said, err := d.from.Call(action, input, session, d.waitOf(args))
	if err != nil {
		return Effect{}, true, err
	}
	if said.Running {
		text := tool.Running(action, said.Fraction, said.Gone, said.Handle) + ". Its result reaches your next turn."
		return Effect{Kind: resultKind, Text: text}, true, nil
	}
	d.tells(said.Handle)
	if said.Error != "" {
		return Effect{Kind: resultKind, Text: fmt.Sprintf("%s fails: %s", action, said.Error)}, true, nil
	}
	return Effect{Kind: resultKind, Result: said.Result}, true, nil
}

// The tools the command door reads, and the git read the pull rule asks. [[spec/tickets/cage-command-rules-port]]
const (
	bashTool       = "Bash"
	powerShellTool = "PowerShell"
	subjectFormat  = "--format=%s"
)

// The refusal of a tool's own door, which the god binding lets through as letsThrough does. [[spec/tickets/cage-call-holds-port]]
func (d *Door) refuses(post Post, root string, settings Settings) string {
	if post.Event != toolEvent || settings.Binding == godBinding {
		return ""
	}
	if textOf(post.E, "tool") == agentTool {
		return agentRefusal(post.E, settings)
	}
	return d.commands(post, root, settings)
}

// The first refusal of a Bash call, in the bridge's order: the ticket door, the bless guard, the command rules, the version guard, then the git write door. PowerShell meets the ticket door alone. A post standing in no tree meets none. [[spec/tickets/cage-command-rules-port]]
func (d *Door) commands(post Post, root string, settings Settings) string {
	tool := textOf(post.E, "tool")
	if tool != bashTool && tool != powerShellTool || root == "" {
		return ""
	}
	line, description := callField(post.E, "command"), callField(post.E, "description")
	tree := disk{root}
	if said := command.TicketDoor(line, description, tree); said != "" || tool == powerShellTool {
		return said
	}
	if said := command.BlessGuard(line, tree.text); said != "" {
		return said
	}
	var rules, writes []command.Row
	for _, one := range command.Findings(line, settings.Words, command.It{Cloud: settings.Cloud, Script: tree.text, Subjects: d.subjects(root)}) {
		if one.Rule == command.GitWrite {
			writes = append(writes, one)
		} else {
			rules = append(rules, one)
		}
	}
	if len(rules) > 0 {
		return command.RefusedCommand(line, rules)
	}
	if said := command.VersionGuard(line); said != "" {
		return said
	}
	if len(writes) > 0 {
		return command.RefusedCommand(line, writes)
	}
	return ""
}

// The subjects of the commits an undo drops, off git under the root, or none where the door reaches no git. [[spec/design_output/bash#a-pull-commit-stands]]
func (d *Door) subjects(root string) func(command.Undo) []string {
	if d.from.Git == nil {
		return nil
	}
	return func(undo command.Undo) []string {
		args := []string{"log"}
		if !undo.Walks {
			args = append(args, "--no-walk")
		}
		args = append(append(args, subjectFormat), undo.Revs...)
		var out []string
		for _, one := range strings.Split(d.from.Git(root, args...), "\n") {
			if one != "" {
				out = append(out, one)
			}
		}
		return out
	}
}

// A field of the call, off the event or the input a harness nests it in. [[spec/tickets/copilot-meets-the-hooks-door]]
func callField(e map[string]any, key string) string {
	if said := textOf(e, key); said != "" {
		return said
	}
	input, _ := e["input"].(map[string]any)
	return textOf(input, key)
}

// The tree under a root, as the command rules read it: a path under the root or an absolute one. [[spec/tickets/cage-command-rules-port]]
type disk struct{ root string }

func (one disk) at(path string) string {
	if filepath.IsAbs(path) || strings.HasPrefix(path, "/") {
		return path
	}
	return filepath.Join(one.root, filepath.FromSlash(path))
}

func (one disk) Read(path string) (string, bool) {
	body, err := os.ReadFile(one.at(path))
	return string(body), err == nil
}

func (one disk) List(folder string) []string {
	found, _ := os.ReadDir(one.at(folder))
	out := make([]string, 0, len(found))
	for _, each := range found {
		out = append(out, each.Name())
	}
	return out
}

// A file's text, or nothing where it stands nowhere. [[spec/tickets/one-door-joins-a-path]]
func (one disk) text(path string) string {
	said, _ := one.Read(path)
	return said
}

func (d *Door) tells(handle string) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.told[handle] = true
}

// The wait the call sets, or the one its key reads, or the built-in second. [[spec/design_output/model#a-caller-sets-its-wait]]
func (d *Door) waitOf(args map[string]any) time.Duration {
	return tool.Wait(args, d.from.Store.Snapshot().Read(d.from.Bound("config/"+WaitKey)), defaultWait*time.Second)
}

// Every operation of the session that ends untold, once, with its result or its reason. [[spec/design_output/model#the-agent-does-not-poll]]
func (d *Door) ended(session string) string {
	d.mu.Lock()
	defer d.mu.Unlock()
	var lines []string
	for _, one := range d.from.Ops(session) {
		if open(one) || d.told[one.Handle] {
			continue
		}
		d.told[one.Handle] = true
		said := one.Error
		if said == "" {
			said = textOfValue(one.Result)
		}
		lines = append(lines, fmt.Sprintf("%s ends %s after %s: %s", one.Action, one.State, one.Gone, said))
	}
	if len(lines) == 0 {
		return ""
	}
	return "An operation you started ends:\n" + strings.Join(lines, "\n")
}

// Every operation of the session still running, which the Stop names and lets through. [[spec/design_output/model#the-agent-does-not-poll]]
func (d *Door) running(session string) string {
	var lines []string
	for _, one := range d.from.Ops(session) {
		if open(one) {
			lines = append(lines, tool.Running(one.Action, one.Fraction, one.Gone, one.Handle))
		}
	}
	if len(lines) == 0 {
		return ""
	}
	return "These operations still run past your turn, and each result reaches your next one:\n" + strings.Join(lines, "\n")
}

func open(one Op) bool { return one.State == "queued" || one.State == "running" }

// The session id where the post or its event names one, in every spelling the harnesses send. [[spec/design_output/pull#the-hand-and-the-hold]]
func sessionOf(post Post) string {
	if post.Session != "" {
		return post.Session
	}
	if nested, ok := post.E["session"].(map[string]any); ok {
		if id := textOf(nested, "id"); id != "" {
			return id
		}
	}
	if id := textOf(post.E, "sessionId", "session_id"); id != "" {
		return id
	}
	return noSession
}

func harnessOf(post Post) string {
	if post.Harness != "" {
		return post.Harness
	}
	return builtInHarness
}

// The event's payload, with the root and the fill the post carries beside it. [[spec/design_output/model#a-post-and-its-answer]]
func fieldsOf(post Post) map[string]any {
	fields := make(map[string]any, len(post.E))
	for key, value := range post.E {
		fields[key] = value
	}
	if post.Root != "" {
		fields["root"] = post.Root
	}
	if post.Fill != nil {
		fields["fill"] = post.Fill
	}
	return fields
}

func textOf(from map[string]any, keys ...string) string {
	for _, key := range keys {
		if text, ok := from[key].(string); ok && text != "" {
			return text
		}
	}
	return ""
}

func textOfValue(value any) string {
	if text, ok := value.(string); ok {
		return text
	}
	body, err := json.Marshal(value)
	if err != nil {
		return fmt.Sprint(value)
	}
	return string(body)
}

// What the standing file holds: the port, and the token a post carries. [[spec/tickets/hooks-standing-file-names-token]]
type Standing struct {
	Port  int    `json:"port"`
	Token string `json:"token"`
}

// Serves POST /hook on a loopback port behind a token, and writes both under the root. The listener stands in the index process until the IO process holds every listener. [[spec/tickets/hooks-listener-joins-io-process]]
func Listen(root string, door *Door) (func(), error) {
	secret := make([]byte, tokenBytes)
	if _, err := rand.Read(secret); err != nil {
		return nil, err
	}
	token := hex.EncodeToString(secret)
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /hook", door.serves(token))
	server := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}
	go server.Serve(listen)
	at := filepath.Join(root, filepath.FromSlash(StandingFile))
	body, err := json.Marshal(Standing{Port: listen.Addr().(*net.TCPAddr).Port, Token: token})
	if err == nil {
		err = os.MkdirAll(filepath.Dir(at), 0o755)
	}
	if err == nil {
		err = os.WriteFile(at, body, 0o600)
	}
	if err != nil {
		server.Close()
		return nil, err
	}
	return func() {
		server.Close()
		os.Remove(at)
	}, nil
}

// A post short of the token answers 401, a body past the cap or short of JSON 400, and a door that fails 500. [[spec/tickets/hooks-standing-file-names-token]]
func (d *Door) serves(token string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != bearer+token {
			http.Error(w, "the post carries no token the standing file names", http.StatusUnauthorized)
			return
		}
		var post Post
		if err := json.NewDecoder(io.LimitReader(r.Body, bodyCap)).Decode(&post); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		said, err := d.Hook(post)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(said)
	}
}

// One line of a recording: the post as the harness sends it, and the answer the module gives. [[spec/design_output/model#an-inbound-fake-replays]]
type recorded struct {
	Post   Post   `json:"post"`
	Answer Answer `json:"answer"`
}

// The inbound fake: it drives the door off a recording, one post a line, and answers each line whose answer differs. [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(door *Door, recording []byte) ([]Mismatch, error) {
	var missed []Mismatch
	lines := bufio.NewScanner(bytes.NewReader(recording))
	lines.Buffer(nil, bodyCap)
	for at := 1; lines.Scan(); at++ {
		text := bytes.TrimSpace(lines.Bytes())
		if len(text) == 0 {
			continue
		}
		var one recorded
		if err := json.Unmarshal(text, &one); err != nil {
			return nil, fmt.Errorf("line %d of the recording reads as no JSON: %w", at, err)
		}
		said, err := door.Hook(one.Post)
		if err != nil {
			return nil, fmt.Errorf("line %d of the recording: %w", at, err)
		}
		want, _ := json.Marshal(one.Answer)
		got, _ := json.Marshal(said)
		if !bytes.Equal(want, got) {
			missed = append(missed, Mismatch{Line: at, Want: string(want), Got: string(got)})
		}
	}
	return missed, lines.Err()
}
