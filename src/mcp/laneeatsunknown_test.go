package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// A FIELD THE TOOL DOES NOT TAKE IS REFUSED, NOT DISCARDED.
//
// taking decoded with json.Unmarshal, which drops a field the struct has no
// place for. So a call naming the actor as by decoded to nothing, orMain
// answered main, and the write was filed under a name the caller never chose.
// Nothing was refused and nothing was said.
//
// MEASURED on this box. Two writes went in as main while the caller believed
// it was writing as its worker name, and the shell door then refused that
// worker because the token was held by somebody else.
//
// SCHEMA.GO ALREADY CARRIES THE MIRROR OF THIS. There a field the door had not
// advertised was dropped by the harness, and every standard mint was refused
// for an argument the caller had no way to send. Both are the same silence.
func TestAFieldTheToolDoesNotTakeIsRefused(t *testing.T) {
	t.Parallel()
	type takes struct {
		On    string `json:"on"`
		Actor string `json:"actor"`
	}
	for _, c := range []struct {
		name  string
		sent  json.RawMessage
		ran   string
		names []string
	}{
		// THE REFUSAL NAMES BOTH: what was sent, and what the tool takes instead.
		{
			"a field this tool does not take",
			json.RawMessage(`{"on":"wk-1","by":"worker-relay-trial"}`),
			"",
			[]string{"by", "actor", "on"},
		},

		// AND A REQUEST NAMING ONLY WHAT THE TOOL TAKES STILL RUNS.
		{
			"only what this tool takes",
			json.RawMessage(`{"on":"wk-1","actor":"worker-relay-trial"}`),
			"the handler ran as worker-relay-trial",
			nil,
		},

		// AND SO DOES ONE WITH NO ARGUMENTS AT ALL, which is how se_stop reads its list.
		{"no arguments at all", nil, "the handler ran as ", nil},
	} {
		t.Run(c.name, func(t *testing.T) {
			ran := ""
			handler := func(_ roots, a takes) string {
				ran = "the handler ran as " + a.Actor
				return ran
			}
			got := taking(roots{}, c.sent, handler)
			if ran != c.ran {
				t.Errorf("the handler ran %q where this case asks for %q", ran, c.ran)
			}
			for _, want := range c.names {
				if !strings.Contains(got, want) {
					t.Errorf("the refusal does not name %q, so the caller cannot tell what to send: %s", want, got)
				}
			}
		})
	}
}
