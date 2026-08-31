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
// The word "setting" is not used. A value is a PARAMETER. A parameter that
// appears in the panel is SHOWN. v3 kept interface state in a file called
// settings, and the name hid which of two things was meant.
//
// The type words come from pyqtgraph and JSON Schema: group, bool, int,
// float, str, list, and the two that draw rather than hold a value, action
// and status.

type Node struct {
	Name     string   `json:"name"`
	Title    string   `json:"title,omitempty"`
	Type     string   `json:"type"`
	Help     string   `json:"help,omitempty"`
	Default  any      `json:"default,omitempty"`
	Min      *float64 `json:"min,omitempty"`
	Max      *float64 `json:"max,omitempty"`
	Step     *float64 `json:"step,omitempty"`
	Options  []string `json:"options,omitempty"`
	Narrow   string   `json:"narrow,omitempty"` // smaller, larger, on, off, or empty for free
	Shown    bool     `json:"shown,omitempty"`
	Children []Node   `json:"children,omitempty"`

	// Drawn rather than held.
	Label       string            `json:"label,omitempty"`
	Title2      string            `json:"-"`
	Command     string            `json:"command,omitempty"`
	StopCommand string            `json:"stopCommand,omitempty"`
	Labels      map[string]string `json:"labels,omitempty"`
	Titles      map[string]string `json:"titles,omitempty"`
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
	return root, nil
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
		_ = json.Unmarshal(b, &stored)
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
			for _, o := range n.Options {
				if o == w {
					return w, ""
				}
			}
			return floor, "it is not one of " + strings.Join(n.Options, ", ")
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
		_ = json.Unmarshal(b, &stored)
	}
	stored[key] = got
	b, err := json.MarshalIndent(stored, "", "  ")
	if err != nil {
		return got, err
	}
	if err := os.MkdirAll(filepath.Dir(valuesPath(roots)), 0o755); err != nil {
		return got, err
	}
	return got, os.WriteFile(valuesPath(roots), append(b, '\n'), 0o644)
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
	HeartbeatSeconds int
	ReadyBudgetMs    int
	From             map[string]string
}

func TheFloor() Config {
	// StopNeedsClaim is ON. An unclaimed stop is refused whatever is open,
	// because the commonest bad stop is the agent that has nothing open and
	// ends the turn to say what it did.
	return Config{GuardProjections: true, StopNeedsClaim: true,
		HeartbeatSeconds: 5, ReadyBudgetMs: 15000, From: map[string]string{}}
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
	if n, ok := toNumber(v.Value["limits.heartbeat_seconds"]); ok && int(n) > 0 {
		c.HeartbeatSeconds = int(n)
	}
	if n, ok := toNumber(v.Value["limits.ready_budget_ms"]); ok && int(n) > 0 {
		c.ReadyBudgetMs = int(n)
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
	return e, os.WriteFile(emergencyPath(roots), append(b, '\n'), 0o644)
}

func DisarmEmergency(roots Roots) error {
	b, _ := json.MarshalIndent(Emergency{}, "", "  ")
	return os.WriteFile(emergencyPath(roots), append(b, '\n'), 0o644)
}

func (e Emergency) Describe() string {
	if !e.Armed {
		return ""
	}
	return fmt.Sprintf("emergency mode, armed by %s, until %s", e.By, e.Until.Format(time.RFC3339))
}
