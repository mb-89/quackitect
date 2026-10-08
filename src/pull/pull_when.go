// The conditions a leaf's when names, read off the box and the ticket, and
// the cleanup a desk's empty queue hands out.
// [[spec/design_output/pull#a-condition-skips-a-leaf]]
package pull

import (
	"encoding/json"
	"regexp"
	"strings"
)

// The words a condition reads, and the stamp a check writes. [[spec/design_output/pull#a-condition-skips-a-leaf]]
const (
	handover  = "handover"
	none      = "none"
	cleanup   = "cleanup"
	checkFile = runtimeFolder + "/check.json"
	// The parts a front splits a text in: before it, the front, and after it. [[spec/design_output/pull#the-final-acceptance]]
	frontParts = 3
)

var (
	otherChapter = regexp.MustCompile(`(?m)^# `)
	askHeading   = regexp.MustCompile(`(?m)^# Ask\s*$`)
	frontFence   = regexp.MustCompile(`(?m)^---\s*$`)
	groupLine    = regexp.MustCompile(`(?m)^group:[ \t]*(\S.*)$`)
)

// Whether the condition holds here, and why not where it fails. [[spec/design_output/pull#a-condition-skips-a-leaf]]
func (it *It) holdsHere(when, text string) (bool, string) {
	switch when {
	case "":
		return true, ""
	case "cloud":
		return it.Cloud, "the box runs off the cloud"
	case "desk":
		return !it.Cloud, "the box runs on the cloud"
	case "view":
		return askLine(text, "view") != "", "the ask names no view the owner reads"
	case "handed":
		return strings.ToLower(askLine(text, "from")) == handover, "the ask comes off no handover"
	case "backlog":
		return groupOf(text) == "", "the delivery's acceptance reads this ticket"
	}
	return false, when + " names no condition the pull reads"
}

// The value of a name line under the Ask, or nothing where the line stands elsewhere or says none. [[spec/tickets/the-owners-words-travel-verbatim]]
func askLine(text, name string) string {
	ask := text
	for _, at := range otherChapter.FindAllStringIndex(text, -1) {
		if !strings.HasPrefix(text[at[0]:], "# Ask") || !askHeading.MatchString(strings.SplitN(text[at[0]:], "\n", 2)[0]) {
			ask = text[:at[0]]
			break
		}
	}
	at := askHeading.FindStringIndex(ask)
	if at == nil {
		return ""
	}
	found := regexp.MustCompile(`(?im)^` + regexp.QuoteMeta(name) + `:[ \t]*(.*)$`).FindStringSubmatch(ask[at[0]:])
	if found == nil {
		return ""
	}
	said := strings.TrimSpace(found[1])
	if strings.ToLower(said) == none {
		return ""
	}
	return said
}

// The group the frontmatter names, or nothing. [[spec/design_output/pull#the-final-acceptance]]
func groupOf(text string) string {
	parts := frontFence.Split(text, frontParts)
	if len(parts) < 2 {
		return ""
	}
	if found := groupLine.FindStringSubmatch(parts[1]); found != nil {
		return strings.TrimSpace(found[1])
	}
	return ""
}

// A desk pull meeting no ticket hands out the check where its stamp reads failed or stale, and a cloud box gets none of it. [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
func (it *It) cleanupOf() []string {
	if it.Cloud {
		return nil
	}
	var stamp struct {
		Sha string `json:"sha"`
		OK  bool   `json:"ok"`
	}
	if text, ok := it.Disk.Read(checkFile); ok {
		_ = json.Unmarshal([]byte(text), &stamp)
	}
	why := ""
	switch {
	case stamp.Sha != it.tipOf():
		why = "The check stamp names no check at HEAD."
	case !stamp.OK:
		why = "The check stamp reads failed at HEAD."
	}
	if why == "" {
		return nil
	}
	return []string{why, "", "Run `./RUNME.sh check`, and mend the fixes it names."}
}
