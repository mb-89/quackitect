// The lsp slice in shadow: the LSP's own sweep answers, the check module's
// sweep runs beside it off the index, and each finding one side holds alone
// writes one row to the session log.
// [[spec/tickets/lsp-rules-move-to-check]]
package main

import (
	"fmt"
	"time"

	"quackitect/src/config"
)

// The slice, the mode that runs it beside the old road, and the kind its rows carry. [[spec/tickets/lsp-rules-move-to-check]]
const (
	lspSlice   = "lsp"
	shadowMode = "shadow"
	shadowKind = "shadow"
	// The stamp the session log writes, as src/quack/verbs.go stamps its rows. [[spec/design_output/log#what-one-line-looks-like]]
	logStamp = "2006-01-02T15:04:05.000Z"
)

// The rules reading the box, which the index reads no part of: no user, no git identity, no node. [[spec/tickets/lsp-rules-move-to-check]]
var boxRules = map[string]bool{"NothingPrivateTravels": true, "SurveyFindsNode": true}

// The lsp slice's mode, off the default file alone, since the migration module shares the key. [[spec/design_output/model#config-comes-off-the-registrations]]
func lspMode(root string) string {
	return config.Map(root, config.Tracked, "migration")[lspSlice]
}

// Under shadow, one row for each finding the old sweep and the new hold apart, the old side's first. A fault on the new road writes nothing. [[spec/tickets/lsp-rules-move-to-check]]
func shadowsSweep(mode string, old []Finding, now func() ([]Finding, error), log func(map[string]any) error) {
	if mode != shadowMode {
		return
	}
	fresh, err := now()
	if err != nil {
		return
	}
	for _, one := range apart(old, fresh) {
		log(shadowRow(one, true))
	}
	for _, one := range apart(fresh, old) {
		log(shadowRow(one, false))
	}
}

// The findings of one side the other holds nowhere, past the rules reading the box. [[spec/tickets/lsp-rules-move-to-check]]
func apart(side, other []Finding) []Finding {
	held := map[string]int{}
	for _, one := range other {
		held[shadowKey(one)]++
	}
	out := []Finding{}
	for _, one := range side {
		if boxRules[one.Rule] {
			continue
		}
		if key := shadowKey(one); held[key] > 0 {
			held[key]--
			continue
		}
		out = append(out, one)
	}
	return out
}

func shadowKey(one Finding) string {
	return fmt.Sprintf("%s\x00%s\x00%d\x00%s", one.File, one.Rule, one.Line, one.Message)
}

// The row a finding held apart writes, saying which side holds it. [[spec/tickets/lsp-rules-move-to-check]]
func shadowRow(one Finding, old bool) map[string]any {
	side := "the check module"
	if old {
		side = "the LSP"
	}
	return map[string]any{
		"level": "info", "kind": shadowKind, "slice": lspSlice,
		"said": fmt.Sprintf("%s in shadow: %s holds %s on %s:%d alone", lspSlice, side, one.Rule, one.File, one.Line),
		"rule": one.Rule, "file": one.File, "line": one.Line, "message": one.Message,
		"old": old, "new": !old,
	}
}

// The LSP's own findings in a list the tools share: the ones no tool draws. [[spec/design_output/lsp#the-server-runs-the-tools]]
func ownOf(found []Finding) []Finding {
	out := []Finding{}
	for _, one := range found {
		if one.Source == "" {
			out = append(out, one)
		}
	}
	return out
}

// The shadow over the whole list the check printed, the new road off the index, and the rows into the session log. [[spec/tickets/lsp-rules-move-to-check]]
func shadowsCheck(root string, found []Finding) {
	shadowsSweep(lspMode(root), ownOf(found), func() ([]Finding, error) { return sweepOffIndex(root) }, appendsRow(root, time.Now))
}
