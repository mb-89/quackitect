// The review tool off the door: a call answers a spawn of the reader under a
// token, and agent answered answers the report the token names.
// [[spec/tickets/review-spawns-off-the-door]]
package hooks

import (
	"fmt"
	"os"
	"strings"

	"quackitect/src/modules/hooks/brief"
	"quackitect/src/modules/hooks/review"
)

// The tool the session calls, the event its reader answers on, the helper it spawns, the log kind it reads under, and the lines it answers short. [[spec/design_output/review#the-tool-the-session-calls]]
const (
	reviewCalled  = "mcp__level0__review_branch"
	answerEvent   = "agent.answered"
	readerAgent   = "general-purpose"
	reviewKind    = "review"
	warnLevel     = "warn"
	noBranchNamed = "review_branch takes one branch name."
	nobodyAsked   = "the reader answered a review nobody asked for"
)

// The review's call and its reader's answer, or nothing where the post is neither or no seam gathers. [[spec/tickets/review-spawns-off-the-door]]
func (d *Door) reviewed(post Post, root string) (Effect, bool) {
	if d.from.Review == nil {
		return Effect{}, false
	}
	if post.Event == toolEvent && textOf(post.E, "tool") == reviewCalled {
		return d.reviewAsked(callField(post.E, "branch"), root), true
	}
	if post.Event == answerEvent {
		return d.reviewRead(post.E, root), true
	}
	return Effect{}, false
}

// The reader's spawn over what the verb gathers, and the back its answer posts under a token. [[spec/tickets/review-spawns-off-the-door]]
func (d *Door) reviewAsked(branch, root string) Effect {
	name := strings.TrimSpace(branch)
	if name == "" {
		return reviewSays(noBranchNamed)
	}
	material, why := d.from.Review(root, name)
	if why != "" {
		row := rowOf(d.now(), reviewKind, "the verb gathered nothing for "+name, why)
		row.Level = warnLevel
		d.logs(root, row)
		return reviewSays(fmt.Sprintf("%s: the verb gathered nothing.\n\n%s", name, why))
	}
	token := fmt.Sprintf("review-%x", d.now().UnixMilli())
	d.mu.Lock()
	d.reviews[token] = material
	d.mu.Unlock()
	var layer string
	if root != "" {
		layer = brief.LayerFor(d.treeAt(root), os.Getenv, "")
	}
	return Effect{Kind: resultKind, Result: map[string]any{
		"spawn": map[string]any{"prompt": review.ReaderAsks(material, layer), "description": "read " + material.Branch, "subagentType": readerAgent},
		"back":  map[string]any{"event": answerEvent, "token": token},
	}}
}

// The report over the material the token names, which the read takes out of flight. [[spec/design_output/review#what-the-report-looks-like]]
func (d *Door) reviewRead(e map[string]any, root string) Effect {
	token := textOf(e, "token")
	d.mu.Lock()
	material, ok := d.reviews[token]
	delete(d.reviews, token)
	d.mu.Unlock()
	if !ok {
		return reviewSays(nobodyAsked)
	}
	failed, _ := e["isError"].(bool)
	read := review.ReadOf(textOf(e, "deny"), failed, textOf(e, "text"))
	code := "undefined"
	if material.Check.Code != nil {
		code = fmt.Sprint(*material.Check.Code)
	}
	d.logs(root, rowOf(d.now(), reviewKind, "read "+material.Branch, fmt.Sprintf("check=%s retro=%t fix=%d", code, material.Retro, read.Fix)))
	return reviewSays(review.Report(material, read))
}

func (d *Door) logs(root string, row LogRow) {
	if root != "" {
		_ = appendRows(disk{root}.at(sessionLog), []LogRow{row})
	}
}

func reviewSays(text string) Effect {
	return Effect{Kind: resultKind, Result: map[string]any{"result": text}}
}
