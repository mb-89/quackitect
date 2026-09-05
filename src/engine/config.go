package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// ONE TREE.
//
// Everything that changes how the system runs is declared in
// util/parameters.json: what it is called, what type it is, what it defaults
// to, and which way it may be narrowed. The panel is a subtree of the same
// tree, chosen by a flag on a group.
//
// Why is [[one-tree-holds-every-parameter]].
//
// The word "setting" is not used. A value is a PARAMETER. A parameter that
// appears in the panel is SHOWN. v3 kept interface state in a file called
// settings, and the name hid which of two things was meant.
//
// The type words come from pyqtgraph and JSON Schema: group, bool, int,
// float, str, list, and the two that draw rather than hold a value, action
// and status.

// AN OPTION IS A VALUE, AND IT MAY ALSO SAY WHAT IT MEANS.
//
// A short value is what a control shows when it is closed, and a long one is
// what it says when it is open. Both shapes are written, because a list of
// plain strings is what most controls want and spelling one out as an object
// would be noise.
type Option struct {
	Value string `json:"value"`
	Says  string `json:"says,omitempty"`
}

func (o *Option) UnmarshalJSON(b []byte) error {
	var s string
	if json.Unmarshal(b, &s) == nil {
		o.Value, o.Says = s, ""
		return nil
	}
	var full struct {
		Value string `json:"value"`
		Says  string `json:"says"`
	}
	if err := json.Unmarshal(b, &full); err != nil {
		return fmt.Errorf("an option is a value, or a value and what it says: %s", b)
	}
	o.Value, o.Says = full.Value, full.Says
	return nil
}

func (o Option) MarshalJSON() ([]byte, error) {
	if o.Says == "" {
		return json.Marshal(o.Value)
	}
	type plain Option
	return json.Marshal(plain(o))
}

type Node struct {
	Name    string   `json:"name"`
	Title   string   `json:"title,omitempty"`
	Type    string   `json:"type"`
	Help    string   `json:"help,omitempty"`
	Default any      `json:"default,omitempty"`
	Min     *float64 `json:"min,omitempty"`
	Max     *float64 `json:"max,omitempty"`
	Step    *float64 `json:"step,omitempty"`
	Options []Option `json:"options,omitempty"`

	// OptionsFrom names where the choices come from, when they are not a list
	// somebody typed. The schema's x-enum-from says the same thing about a
	// field's values, and this is the panel's half of it.
	//
	// A LIST TYPED HERE GOES STALE. The mint picker offered four values naming
	// a scope and whether the token was tracked, and the process owns both of
	// those now, so the panel offered four words the engine would refuse. A
	// picker whose choices are files cannot be wrong about which files exist.
	OptionsFrom string `json:"optionsFrom,omitempty"`

	// How the panel draws it. The engine does not read these, and it must not
	// drop them: --tree prints the tree AS DECLARED, and a field this program
	// happens not to use is still part of what somebody wrote.
	Placeholder string `json:"placeholder,omitempty"`

	// WHAT THE NUMBER IS COUNTED IN. The engine does not read it: the panel
	// draws it beside the box. It is declared here because --tree prints the
	// tree as declared, and a row that reads "a claim lasts: 3" is a fact with
	// its unit missing.
	Unit     string `json:"unit,omitempty"`
	Span     int    `json:"span,omitempty"`
	Narrow   string `json:"narrow,omitempty"` // smaller, larger, on, off, or empty for free
	Shown    bool   `json:"shown,omitempty"`
	Children []Node `json:"children,omitempty"`

	// Drawn rather than held.
	Label       string            `json:"label,omitempty"`
	Command     string            `json:"command,omitempty"`
	StopCommand string            `json:"stopCommand,omitempty"`
	Labels      map[string]string `json:"labels,omitempty"`
	Titles      map[string]string `json:"titles,omitempty"`

	// A PRESS COUNT THAT MEANS SOMETHING ELSE, and the command it means.
	//
	// The engine does not read these: the panel counts the presses. They are
	// here because --tree prints the tree AS DECLARED, and a field this program
	// happens not to use is still part of what somebody wrote. Left out, the
	// engine answered a tree with the gesture silently missing from it, which
	// is the same defect the comment above this block warns about.
	Gesture        int    `json:"gesture,omitempty"`
	GestureCommand string `json:"gestureCommand,omitempty"`
}

func (n Node) holdsValue() bool {
	switch n.Type {
	case "bool", "int", "float", "str", "list", "strlist":
		return true
	}
	return false
}

func LoadTree(methodRoot string) (Node, error) {
	b, err := os.ReadFile(filepath.Join(methodRoot, "util", "parameters.json"))
	if err != nil {
		return Node{}, err
	}
	var root Node
	if err := json.Unmarshal(b, &root); err != nil {
		return Node{}, fmt.Errorf("util/parameters.json is not readable: %w", err)
	}
	// A CONTROL NAMES AN ICON AND NEVER CARRIES ONE. The table decides what the
	// name looks like, so the same mark is the same mark everywhere and one
	// edit changes it. Resolving here is the one place a tree is read.
	icons, err := Icons(Roots{Method: methodRoot})
	if err != nil {
		return root, err
	}
	drawIcons(&root, icons)
	fillOptions(&root, methodRoot)
	return root, nil
}

// fillOptions answers every picker that names where its choices come from.
// It is here because LoadTree is the one place a tree is read, which is where
// the icons are resolved for the same reason.
func fillOptions(n *Node, methodRoot string) {
	if n.OptionsFrom == "processes.names" {
		n.Options = nil
		for _, name := range AvailableProcesses(methodRoot) {
			says := name
			if p, err := LoadProcess(methodRoot, name); err == nil && p.Description != "" {
				says = p.Description
			}
			n.Options = append(n.Options, Option{Value: name, Says: says})
		}
		if n.Default == nil || n.Default == "" {
			if len(n.Options) > 0 {
				n.Default = n.Options[0].Value
			}
		}
	}
	for i := range n.Children {
		fillOptions(&n.Children[i], methodRoot)
	}
}

func drawIcons(n *Node, icons map[string]Icon) {
	if n.Label != "" {
		n.Label = DrawnAs(icons, n.Label)
	}
	for k, v := range n.Labels {
		n.Labels[k] = DrawnAs(icons, v)
	}
	for i := range n.Children {
		drawIcons(&n.Children[i], icons)
	}
}

// Values are stored in one file, flat, keyed by the path through the tree.
// A flat key reads the same in the store, in a command and in the record.
func valuesPath(roots Roots) string { return roots.Private("parameters.json") }

func Walk(n Node, path string, f func(path string, n Node)) {
	here := n.Name
	if path != "" {
		here = path + "." + n.Name
	}
	f(here, n)
	for _, c := range n.Children {
		Walk(c, here, f)
	}
}

// Values gives every parameter with the value in force, and where it came
// from. The tree's default is the floor, and the store may only narrow it.
type Values struct {
	Value map[string]any    `json:"value"`
	From  map[string]string `json:"from"`
}

func LoadValues(roots Roots) (Values, error) {
	v := Values{Value: map[string]any{}, From: map[string]string{}}
	root, err := LoadTree(roots.Method)
	if err != nil {
		return v, err
	}
	stored := map[string]any{}
	if b, err := os.ReadFile(valuesPath(roots)); err == nil {
		// A store that cannot be read is skipped, never fatal. One bad file
		// must not stop the machine from working.
		_ = json.Unmarshal(b, &stored) // a file that will not read is no stored value, which is the default
	}
	Walk(root, "", func(path string, n Node) {
		if !n.holdsValue() {
			return
		}
		key := strings.TrimPrefix(path, root.Name+".")
		v.Value[key] = n.Default
		v.From[key] = "the method"
		got, ok := stored[key]
		if !ok {
			return
		}
		if narrowed, why := narrow(n, n.Default, got); why == "" {
			v.Value[key] = narrowed
			v.From[key] = "the project"
		} else {
			v.From[key] = "the method, because " + why
		}
	})
	return v, nil
}

// narrow decides whether a stored value is allowed to replace the default.
//
// The DECLARED DEFAULT IS THE FLOOR, and narrowing is measured against it.
// A guard the method turns on may not be turned off. A limit the method sets
// may be made smaller and not larger. Returning to the declared value is
// always allowed: it is the method's own answer, so it lowers nothing.
func narrow(n Node, floor, want any) (any, string) {
	switch n.Type {
	case "bool":
		w, ok := toBool(want)
		if !ok {
			return floor, "it is not true or false"
		}
		f, _ := toBool(floor)
		switch n.Narrow {
		case "on":
			if !w && f {
				return floor, "this guard can be turned on and never off"
			}
		case "off":
			if w && !f {
				return floor, "this can be turned off and never on"
			}
		}
		return w, ""
	case "int", "float":
		w, ok := toNumber(want)
		if !ok {
			return floor, "it is not a number"
		}
		if n.Min != nil && w < *n.Min {
			return floor, fmt.Sprintf("the smallest allowed is %v", *n.Min)
		}
		if n.Max != nil && w > *n.Max {
			return floor, fmt.Sprintf("the largest allowed is %v", *n.Max)
		}
		f, _ := toNumber(floor)
		switch n.Narrow {
		case "smaller":
			if w > f {
				return floor, "this may be made smaller and never larger"
			}
		case "larger":
			if w < f {
				return floor, "this may be made larger and never smaller"
			}
		}
		if n.Type == "int" {
			return int(w), ""
		}
		return w, ""
	case "strlist":
		// A list of plain words. It arrives as an array from a file, or as a
		// comma separated line from a command.
		return toStrings(want), ""
	case "str", "list":
		w := fmt.Sprint(want)
		if len(n.Options) > 0 {
			var names []string
			for _, o := range n.Options {
				if o.Value == w {
					return w, ""
				}
				names = append(names, o.Value)
			}
			return floor, "it is not one of " + strings.Join(names, ", ")
		}
		return w, ""
	}
	return floor, "this parameter holds no value"
}

// SetValue is the only way a value changes. The engine validates, because the
// panel is a view and a view that validates is a second set of rules.
func SetValue(roots Roots, key string, want any) (any, error) {
	root, err := LoadTree(roots.Method)
	if err != nil {
		return nil, err
	}
	var found *Node
	Walk(root, "", func(path string, n Node) {
		if strings.TrimPrefix(path, root.Name+".") == key && n.holdsValue() {
			c := n
			found = &c
		}
	})
	if found == nil {
		return nil, fmt.Errorf("no parameter called %q", key)
	}
	got, why := narrow(*found, found.Default, want)
	if why != "" {
		return got, fmt.Errorf("%s stays as it was: %s", key, why)
	}
	stored := map[string]any{}
	if b, err := os.ReadFile(valuesPath(roots)); err == nil {
		_ = json.Unmarshal(b, &stored) // a file that will not read is no stored value, which is the default
	}
	stored[key] = got
	b, err := json.MarshalIndent(stored, "", "  ")
	if err != nil {
		return got, err
	}
	if err := os.MkdirAll(filepath.Dir(valuesPath(roots)), 0o755); err != nil {
		return got, err
	}
	return got, writeAtomic(valuesPath(roots), append(b, '\n'), 0o644)
}

func toStrings(v any) []string {
	switch x := v.(type) {
	case []string:
		return x
	case []any:
		out := make([]string, 0, len(x))
		for _, e := range x {
			out = append(out, strings.TrimSpace(fmt.Sprint(e)))
		}
		return out
	case string:
		var out []string
		for _, part := range strings.Split(x, ",") {
			if p := strings.TrimSpace(part); p != "" {
				out = append(out, p)
			}
		}
		return out
	}
	return nil
}

func toBool(v any) (bool, bool) {
	switch x := v.(type) {
	case bool:
		return x, true
	case string:
		b, err := strconv.ParseBool(x)
		return b, err == nil
	}
	return false, false
}

func toNumber(v any) (float64, bool) {
	switch x := v.(type) {
	case float64:
		return x, true
	case int:
		return float64(x), true
	case string:
		f, err := strconv.ParseFloat(x, 64)
		return f, err == nil
	}
	return 0, false
}

// Config is what the rest of the engine asks. It is the tree, read.
type Config struct {
	GuardProjections bool
	StopNeedsClaim   bool
	AnswerFirst      bool

	// A SEARCH OVER THE TREE GOES THROUGH THE INDEX. Grep, Glob, rg and grep
	// aimed inside the tree are refused and pointed at se find, which answers
	// off the index the engine keeps in step. Outside the tree they are the
	// agent's own. It is a parameter because a tree whose watcher is deaf
	// has an index that is behind, and a person may want the disk back.
	SearchViaIndex bool

	// THE ENGINE OWNS THE TESTS. go test, a check script or the battery run
	// by hand inside the tree is refused and pointed at se test, which runs
	// what the delta reaches. Off, the tests are run by hand as before.
	TestsViaEngine bool

	// AND IT OWNS ITS OWN REPLACEMENT. A build aimed at .bin inside the tree
	// is refused and pointed at the swap door, which builds the next engine and
	// hands over without severing a call. Off, the build is run by hand.
	BuildViaEngine bool

	// HOW LONG A CLAIM STANDS before it lapses and the work is back in the
	// pool. It is what frees work from a box that never came back.
	ClaimHours int

	// HOW OFTEN THE ENGINE LOOKS FOR OTHER BOXES' CLAIMS. Zero turns it off.
	ClaimSyncSeconds int
	HeartbeatSeconds int
	ReadyBudgetMs    int

	// HOW MANY PULLS GO PAST BEFORE A HOLD IS WORTH LOOKING AT. It is a guess
	// about how long somebody may be quiet rather than a fact about the code,
	// so it is a parameter a person moves.
	//
	// THREE LIMITS WENT WITH THE REVIEW FLOW: how much unreviewed work the
	// pull tolerated, how many criteria a draft could carry, and how many
	// failing rounds climbed a rung. Nothing counts reviews, drafts or rounds
	// now, so each was a number a person could set and nothing would read.
	PullsBeforeHoldIsStale int

	// HOW MANY LINES A READ MAY TAKE AT ONCE. Context budgets differ per
	// harness and model, so it is a parameter, and a read over it is
	// corrected rather than refused: the correction is unambiguous.

	// A HELPER'S ANSWER IS A DIGEST OF WHAT IT READ. It may be at most this
	// fraction of the bytes it read, or the floor when it read little, and
	// a longer one is sent back to compress. Both are parameters because
	// delegation jobs differ in kind, and a fixed pair is wrong for one.
	HelperRatio      int
	HelperFloorBytes int

	// HOW MANY HANDS THE QUEUE WANTS, AND IT IS ONE NUMBER FOR EVERY ROLE.
	//
	// THE OWNER'S RULING: one control, a maximum, and it goes for every role.
	// The engine wants that many of each role as long as there is work for
	// them, never more, and holds the main agent until they are here.
	//
	// IT WAS FOUR NUMBERS AND A RATIO. One worker per so many tokens, one
	// reviewer per so many verdicts, each under its own ceiling, and a nudge
	// and a wall speaking beside them about the same queue. Four dials that
	// interact are four ways to be wrong about one question, and nobody could
	// say what the machine would do without working it out.
	ParallelAgents int

	From map[string]string
}

func TheFloor() Config {
	// StopNeedsClaim is ON. An unclaimed stop is refused whatever is open,
	// because the commonest bad stop is the agent that has nothing open and
	// ends the turn to say what it did.
	// AnswerFirst is ON. Somebody waiting to be answered while the agent works
	// on is the failure this exists to stop.
	return Config{GuardProjections: true, StopNeedsClaim: true, AnswerFirst: true,
		SearchViaIndex:   true,
		TestsViaEngine:   true,
		BuildViaEngine:   true,
		ClaimHours:       3,
		ClaimSyncSeconds: 30,
		HeartbeatSeconds: 5, ReadyBudgetMs: 15000,
		PullsBeforeHoldIsStale: 10,
		HelperRatio:            10,
		HelperFloorBytes:       6000,
		// THREE, COUNTING THE MAIN AGENT. The number is how many workers there
		// are rather than how many are spawned beside the one already working,
		// so three is the session and two spawned. Reviewers are all spawned,
		// because the main agent is a worker and never a reviewer.
		ParallelAgents: 3,
		From:           map[string]string{}}
}

func LoadConfig(roots Roots) Config {
	c := TheFloor()
	v, err := LoadValues(roots)
	if err != nil {
		return c // no tree, no values. The floor still holds.
	}
	c.From = v.From
	if b, ok := toBool(v.Value["guards.guard_projections"]); ok {
		c.GuardProjections = b || c.GuardProjections
	}
	if b, ok := toBool(v.Value["guards.stop_needs_claim"]); ok {
		c.StopNeedsClaim = b || c.StopNeedsClaim
	}
	if b, ok := toBool(v.Value["guards.answer_first"]); ok {
		c.AnswerFirst = b || c.AnswerFirst
	}
	// THIS ONE CAN BE TURNED OFF, unlike the three above, because an index
	// that is behind the tree is a reason to want the disk.
	if b, ok := toBool(v.Value["guards.search_via_index"]); ok {
		c.SearchViaIndex = b
	}
	if b, ok := toBool(v.Value["guards.tests_via_engine"]); ok {
		c.TestsViaEngine = b
	}
	if b, ok := toBool(v.Value["guards.build_via_engine"]); ok {
		c.BuildViaEngine = b
	}
	// A CLAIM MAY BE HELD SHORTER, NEVER LONGER. Work a dead box holds for a
	// day is work nobody can reach for a day.
	if n, ok := toNumber(v.Value["limits.claim_hours"]); ok && int(n) > 0 && int(n) < c.ClaimHours {
		c.ClaimHours = int(n)
	}
	if n, ok := toNumber(v.Value["limits.claim_sync_seconds"]); ok && int(n) >= 0 {
		c.ClaimSyncSeconds = int(n)
	}
	if n, ok := toNumber(v.Value["limits.heartbeat_seconds"]); ok && int(n) > 0 {
		c.HeartbeatSeconds = int(n)
	}
	if n, ok := toNumber(v.Value["limits.ready_budget_ms"]); ok && int(n) > 0 {
		c.ReadyBudgetMs = int(n)
	}
	// ZERO IS A VALUE HERE and not a missing one, because zero turns the
	// holding off and somebody has to be able to say that.
	if n, ok := toNumber(v.Value["limits.parallel_agents"]); ok && int(n) >= 0 {
		c.ParallelAgents = int(n)
	}
	if n, ok := toNumber(v.Value["limits.pulls_before_hold_is_stale"]); ok && int(n) > 0 {
		c.PullsBeforeHoldIsStale = int(n)
	}
	// A HELPER MAY BE HELD TIGHTER, NEVER LOOSER: a larger ratio is a smaller
	// digest, and a smaller floor is too.
	if n, ok := toNumber(v.Value["limits.helper_ratio"]); ok && int(n) > c.HelperRatio {
		c.HelperRatio = int(n)
	}
	if n, ok := toNumber(v.Value["limits.helper_floor_bytes"]); ok && int(n) > 0 && int(n) < c.HelperFloorBytes {
		c.HelperFloorBytes = int(n)
	}
	return c
}

// ---- emergency ----

// Emergency mode widens the floor, because repair needs powers the floor
// deliberately lacks. It is armed by a person, it says who and when, and it
// ends on its own so it cannot be left on and forgotten.
type Emergency struct {
	Armed  bool      `json:"armed"`
	By     string    `json:"by"`
	At     time.Time `json:"at"`
	Until  time.Time `json:"until"`
	Reason string    `json:"reason"`
}

func emergencyPath(roots Roots) string { return roots.Private("emergency.json") }

func LoadEmergency(roots Roots) Emergency {
	var e Emergency
	b, err := os.ReadFile(emergencyPath(roots))
	if err != nil || json.Unmarshal(b, &e) != nil {
		return Emergency{}
	}
	if !e.Armed || time.Now().After(e.Until) {
		return Emergency{}
	}
	return e
}

func ArmEmergency(roots Roots, by, reason string, forMinutes int) (Emergency, error) {
	if by == "" {
		by = "the owner"
	}
	if forMinutes <= 0 || forMinutes > 240 {
		forMinutes = 30
	}
	e := Emergency{Armed: true, By: by, Reason: reason,
		At: time.Now().UTC(), Until: time.Now().UTC().Add(time.Duration(forMinutes) * time.Minute)}
	b, err := json.MarshalIndent(e, "", "  ")
	if err != nil {
		return e, err
	}
	if err := os.MkdirAll(filepath.Dir(emergencyPath(roots)), 0o755); err != nil {
		return e, err
	}
	return e, writeAtomic(emergencyPath(roots), append(b, '\n'), 0o644)
}

func DisarmEmergency(roots Roots) error {
	b, _ := json.MarshalIndent(Emergency{}, "", "  ")
	return writeAtomic(emergencyPath(roots), append(b, '\n'), 0o644)
}

func (e Emergency) Describe() string {
	if !e.Armed {
		return ""
	}
	return fmt.Sprintf("emergency mode, armed by %s, until %s", e.By, e.Until.Format(time.RFC3339))
}
