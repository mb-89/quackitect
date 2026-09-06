package main

import (
	"fmt"
	"strconv"
	"strings"

	"quackitect/engine/internal/keyword"
	"quackitect/engine/internal/sessionlog"
)

// WHAT A CONSOLE CAN REACH, AND HOW THE ENGINE MAKES THE MOVE.
//
// The panel presses a command and the extension runs it. A cloud box has no
// extension and no panel, so the engine has to make the same move itself. This
// file is the one place saying which move each command is.
//
// IT IS KEYED BY THE COMMAND THE DECLARATION ALREADY CARRIES, so no name is
// written down twice. The word a person types is derived from the node, the
// move is looked up by that node's own command, and neither is typed here.
//
// A RUNG IS POSITIVE AND TAKES ON OR OFF. ON stands on the rung and OFF falls
// back to the base, which is where the button lands when it is pressed again.
// So GOD=OFF lands bound, the same as clicking does, and nobody has to know the
// name of the state below the one they are on.
//
// A CONTROL THE ENGINE CANNOT MOVE CARRIES NO WORD, and every control here can
// be moved because every one of them already has a door. Opening the log or a
// home is the exception: those open a window, a cloud box has none, and a word
// for one would draw a line that moves nothing.

// aMove stands on a rung or falls off it, and answers where the tree now is.
type aMove func(r Roots, by string, on bool) (string, error)

var moves = map[string]aMove{
	"quackitect.unbind": func(r Roots, by string, on bool) (string, error) {
		return bindingMove(r, by, on, Unbound)
	},
	"quackitect.god": func(r Roots, by string, on bool) (string, error) {
		return bindingMove(r, by, on, God)
	},
	"quackitect.hold": func(r Roots, by string, on bool) (string, error) {
		return holdMove(r, by, on, HoldFinishing)
	},
	"quackitect.stop_everything": func(r Roots, by string, on bool) (string, error) {
		return holdMove(r, by, on, HoldHeld)
	},
	// THE ASK IS ALREADY THE ENGINE'S, and this is a second adapter onto it
	// rather than a second mechanism. It discharges itself when the answer
	// lands, so a person sends it on and never has to send it off.
	"quackitect.ask": func(r Roots, by string, on bool) (string, error) {
		a, err := SetAsked(r, on, by)
		return keyword.OnOrOff(a.Owed()), err
	},
	"quackitect.ideation": func(r Roots, by string, on bool) (string, error) {
		i, err := SetIdeation(r, on, by)
		return keyword.OnOrOff(i.IsOn()), err
	},
}

func bindingMove(r Roots, by string, on bool, rung TheBinding) (string, error) {
	to := Bound
	if on {
		to = rung
	}
	b, err := SetBinding(r, to, by)
	return string(b.At), err
}

func holdMove(r Roots, by string, on bool, rung string) (string, error) {
	to := HoldOff
	if on {
		to = rung
	}
	h, err := SetHold(r, to, by)
	return h.State, err
}

// keywordsFor writes the lines a control's tooltip draws. They come from
// keyword.Line, which is also what the matcher parses, so the line a person
// reads is the exact message that works.
func keywordsFor(n Node) []string {
	var out []string
	switch n.Type {
	case "toggle":
		if _, ok := moves[n.Command]; ok {
			out = append(out, rung(keyword.For(n.Name))...)
		}
		if _, ok := moves[n.GestureCommand]; ok {
			out = append(out, rung(keyword.FromCommand(n.GestureCommand))...)
		}
	case "bool":
		out = append(out, rung(keyword.For(n.Name))...)
	case "int", "float":
		out = append(out, keyword.Line(keyword.For(n.Name), boundsSay(n)))
	case "text", "str":
		// A BOX TAKES WHATEVER A PERSON TYPES, so the placeholder is what the
		// line shows. It is what the panel already draws inside the box, so a
		// person reads the same example in both places.
		out = append(out, keyword.Line(keyword.For(n.Name), "<"+theExample(n)+">"))
	}
	return out
}

// theExample is what a box shows when it is empty, and what its keyword line
// shows in place of a value.
func theExample(n Node) string {
	if n.Placeholder != "" {
		return n.Placeholder
	}
	return "what to set it to"
}

func rung(word string) []string {
	return []string{keyword.Line(word, keyword.On), keyword.Line(word, keyword.Off)}
}

// boundsSay says what a number takes, in the line itself, so a person reading
// the tooltip learns the range without opening anything.
//
// IT IS WRITTEN AS A PLACEHOLDER AND NOT AS A VALUE. A rung's line is a message
// a person sends as it stands, and a number's is not: nobody can send
// KEYWORD:PARALLEL_AGENTS=0-20. The angle brackets are what tells the two
// apart, in a tooltip that invites you to send any line in it.
func boundsSay(n Node) string {
	if n.Min == nil || n.Max == nil {
		return "<a number>"
	}
	return "<" + number(*n.Min) + "-" + number(*n.Max) + ">"
}

func number(f float64) string { return strconv.FormatFloat(f, 'f', -1, 64) }

// reach is one message a console can send, and what it moves.
type reach struct {
	Node Node
	Key  string // the parameter to set, empty for a move
	Move aMove  // nil for a value
}

// theReachable walks the tree and answers every word a console can send. The
// word is derived here the same way keywordsFor derives the drawn line, so a
// control cannot draw a word this does not answer.
func theReachable(root Node) map[string]reach {
	out := map[string]reach{}
	Walk(root, "", func(path string, n Node) {
		if !n.Console {
			return
		}
		key := strings.TrimPrefix(path, root.Name+".")
		switch n.Type {
		case "toggle":
			if m, ok := moves[n.Command]; ok {
				out[keyword.For(n.Name)] = reach{Node: n, Move: m}
			}
			if m, ok := moves[n.GestureCommand]; ok {
				out[keyword.FromCommand(n.GestureCommand)] = reach{Node: n, Move: m}
			}
		case "bool", "int", "float", "text", "str":
			out[keyword.For(n.Name)] = reach{Node: n, Key: key}
		}
	})
	return out
}

// valueFor reads the value half against the control it was sent to.
func valueFor(n Node, value string) (any, error) {
	word := keyword.For(n.Name)
	switch n.Type {
	case "bool":
		on, ok := keyword.IsOn(value)
		if !ok {
			return nil, fmt.Errorf("%s takes %s or %s", word, keyword.On, keyword.Off)
		}
		return on, nil
	case "int":
		i, err := strconv.Atoi(strings.TrimSpace(value))
		if err != nil {
			return nil, fmt.Errorf("%s takes a whole number, and %q is not one", word, value)
		}
		return i, nil
	case "float":
		f, err := strconv.ParseFloat(strings.TrimSpace(value), 64)
		if err != nil {
			return nil, fmt.Errorf("%s takes a number, and %q is not one", word, value)
		}
		return f, nil
	case "text", "str":
		// A BOX TAKES THE TEXT AS TYPED, spaces and all. Emptying it is sending
		// the word with nothing after the equals sign.
		return value, nil
	}
	return nil, fmt.Errorf("%s cannot be set from a chat", word)
}

// KeywordSaid moves the control a message named, and answers the word it
// matched. Its callers are the two routes the harness feeds, so an agent cannot
// forge one.
//
// EVERY OUTCOME MEETS THE RECORD, including a word that reaches nothing and a
// value the floor refuses. A person who typed a message and saw nothing happen
// is owed the reason, and the record is where they read it.
func KeywordSaid(r Roots, log *sessionlog.Log, actor, said string) string {
	m, ok := keyword.Parse(said)
	if !ok {
		return ""
	}
	root, err := LoadTree(r.Method)
	if err != nil {
		return ""
	}
	data := map[string]any{"keyword": m.Word}
	refuse := func(why string) string {
		data["refused"] = why
		record(log, "engine", "keyword", actor, why, sessionlog.No(), data)
		return m.Word
	}
	k, ok := theReachable(root)[m.Word]
	if !ok {
		return refuse(keyword.Prefix + m.Word + " reaches no control")
	}
	if k.Move != nil {
		on, ok := keyword.IsOn(m.Value)
		if !ok {
			return refuse(fmt.Sprintf("%s takes %s or %s", m.Word, keyword.On, keyword.Off))
		}
		at, err := k.Move(r, actor, on)
		data["at"] = at
		if err != nil {
			return refuse(err.Error())
		}
		record(log, "engine", "keyword", actor, m.Word+" is now "+at, sessionlog.Yes(), data)
		return m.Word
	}
	data["parameter"] = k.Key
	want, err := valueFor(k.Node, m.Value)
	if err != nil {
		return refuse(err.Error())
	}
	got, err := SetValue(r, k.Key, want)
	data["value"] = got
	if err != nil {
		return refuse(err.Error())
	}
	record(log, "engine", "keyword", actor, fmt.Sprintf("%s is now %v", m.Word, got),
		sessionlog.Yes(), data)
	return m.Word
}
