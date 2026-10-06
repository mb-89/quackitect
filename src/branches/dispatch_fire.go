// The Action's fire: one fire of the work routine a ready group and a stuck
// hand-over, up to the routine cap, and the write branch's pull request on the
// owner's token. It opens no issue, because the ticket holds the work. Every
// request goes through the send door, and the plan carries what came back.
// [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
package branches

import (
	"encoding/json"
	"slices"
	"strconv"
	"strings"
)

// The routine cap the routines page names, the lower of its two, so an hourly run stays under both. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
const fireCap = 30

// The version header the fire page names, the one value it takes. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
const fireVersion = "2023-06-01"

// The GitHub API where the run names none, the statuses a reply reads at, and the cut a reason takes. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
const (
	githubAPI = "https://api.github.com"
	rateCode  = 429
	okFrom    = 200
	okTo      = 300
	whyCut    = 300
)

const autoMerge = "mutation($id: ID!) { enablePullRequestAutoMerge(input: {pullRequestId: $id, mergeMethod: MERGE}) { clientMutationId } }"

// A request the send door carries. [[spec/design_output/doors#a-door-reads-the-outside]]
type Request struct {
	Method  string
	Headers map[string]string
	Body    string
}

// What came back: the status, the body, and the headers keyed in lower case. [[spec/design_output/doors#a-door-reads-the-outside]]
type Reply struct {
	Status  int
	Text    string
	Headers map[string]string
}

// The door every request of the fire goes through. [[spec/design_output/doors#a-door-reads-the-outside]]
type Send func(url string, request Request) (Reply, error)

// A fired branch and its session. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
type firedRow struct {
	Branch  string `json:"branch"`
	Session string `json:"session"`
}

// A refused fire, its status and its reason. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
type refusedRow struct {
	Branch string `json:"branch"`
	Status int    `json:"status"`
	Why    string `json:"why"`
}

// The write branch's pull request: none, standing, opened or refused. [[spec/tickets/the-owner-stores-the-token]]
type pullRow struct {
	State string `json:"state"`
	URL   string `json:"url"`
	Why   string `json:"why"`
}

// What the fire did. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
type fireRow struct {
	Fired   []firedRow   `json:"fired"`
	Refused []refusedRow `json:"refused"`
	Left    []string     `json:"left"`
	Wait    string       `json:"wait"`
	Why     string       `json:"why"`
	Pull    pullRow      `json:"pull"`
}

// One fire: the branch it sends a worker to, and the text the worker reads. [[spec/tickets/ci-reds-name-their-cases]]
type fireOne struct {
	Branch, Text string
}

// The red conclusions a check run ends on. [[spec/tickets/ci-reds-name-their-cases]]
var redConclusions = []string{"failure", "timed_out"}

// [[spec/design_input/the-cloud-runs-itself#firing-the-workers]] [[spec/tickets/ci-reds-name-their-cases]]
func (d *Doors) fire(send Send, plan *dispatchPlan) int {
	out := &fireRow{Fired: []firedRow{}, Refused: []refusedRow{}, Left: []string{}, Pull: pullRow{State: "none"}}
	plan.Fire = out
	ones := firesOf(plan)
	red, why := d.redPulls(send, plan, ones)
	fired := d.fires(send, append(ones, red...), out)
	if why != "" {
		out.Why = strings.TrimSpace(out.Why + " " + why)
	}
	pulled := d.pulled(send, plan.Write, &out.Pull)
	if fired != codeOK || pulled != codeOK || why != "" {
		return codeRed
	}
	return codeOK
}

// The ready groups first, then the stuck hand-overs, one branch each. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
func firesOf(plan *dispatchPlan) []fireOne {
	var branches []string
	for _, one := range plan.Ready {
		branches = append(branches, one.Branch)
	}
	for _, one := range plan.Stuck {
		branches = append(branches, workBranch+one.Group)
	}
	out := []fireOne{}
	for _, branch := range branches {
		out = append(out, fireOne{Branch: branch, Text: "The dispatch fires this run for " + branch + ". Take that branch."})
	}
	return out
}

// The open work pull requests whose check reads red, one fire each, on a branch at done the plan fires nowhere else. A worker on the branch moves it off done, so no second fire follows. A run with no PULL_TOKEN reads none, and a refused read says why. [[spec/tickets/ci-reds-name-their-cases]]
func (d *Doors) redPulls(send Send, plan *dispatchPlan, taken []fireOne) ([]fireOne, string) {
	gh, missing := d.hubOf(d.env("PULL_TOKEN"), "PULL_TOKEN")
	if missing != "" {
		return nil, ""
	}
	fired := map[string]bool{}
	for _, one := range taken {
		fired[one.Branch] = true
	}
	listed := sent(send, gh.API+"/repos/"+gh.Repo+"/pulls?state=open&per_page=100", Request{Method: "GET", Headers: gh.Headers})
	if !okOf(listed) {
		return nil, "The open pull request list came back " + strconv.Itoa(listed.Status) + ": " + reasonOf(listed) + "."
	}
	var pulls []struct {
		URL  string `json:"html_url"`
		Head struct {
			Ref string `json:"ref"`
			Sha string `json:"sha"`
		} `json:"head"`
	}
	if json.Unmarshal([]byte(listed.Text), &pulls) != nil {
		pulls = nil
	}
	out := []fireOne{}
	var why []string
	for _, one := range pulls {
		ref := one.Head.Ref
		if !strings.HasPrefix(ref, workBranch) || fired[ref] || !plan.atDone[ref] || one.Head.Sha == "" {
			continue
		}
		runs := sent(send, gh.API+"/repos/"+gh.Repo+"/commits/"+one.Head.Sha+"/check-runs", Request{Method: "GET", Headers: gh.Headers})
		if !okOf(runs) {
			why = append(why, "The check runs of "+ref+" came back "+strconv.Itoa(runs.Status)+": "+reasonOf(runs)+".")
			continue
		}
		var read struct {
			Runs []struct {
				Conclusion string `json:"conclusion"`
			} `json:"check_runs"`
		}
		_ = json.Unmarshal([]byte(runs.Text), &read)
		for _, run := range read.Runs {
			if slices.Contains(redConclusions, run.Conclusion) {
				fired[ref] = true
				out = append(out, fireOne{Branch: ref, Text: "The check on " + one.URL + " reads red. Take " + ref + ", fix the red cases its check log ends on, run ./RUNME.sh check, and push."})
				break
			}
		}
	}
	return out, strings.Join(why, " ")
}

// One fire a branch up to the cap, and a rate refusal stops the rest. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
func (d *Doors) fires(send Send, ones []fireOne, out *fireRow) int {
	url, token := d.env("ROUTINE_FIRE_URL"), d.env("ROUTINE_FIRE_TOKEN")
	var missing []string
	for name, value := range map[string]string{"ROUTINE_FIRE_URL": url, "ROUTINE_FIRE_TOKEN": token} {
		if value == "" {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		if len(ones) == 0 {
			return codeOK
		}
		if len(missing) > 1 {
			missing = []string{"ROUTINE_FIRE_URL", "ROUTINE_FIRE_TOKEN"}
		}
		out.Why = "The run holds no " + strings.Join(missing, " and no ") + ", so it fires nothing."
		for _, one := range ones {
			out.Left = append(out.Left, one.Branch)
		}
		return codeRed
	}
	for at, one := range ones {
		branch := one.Branch
		if at >= fireCap || out.Wait != "" {
			out.Left = append(out.Left, branch)
			continue
		}
		said := sent(send, url, Request{
			Method: "POST",
			Headers: map[string]string{
				"Authorization":     "Bearer " + token,
				"anthropic-version": fireVersion,
				"Content-Type":      "application/json",
			},
			Body: jsonLine(map[string]string{"text": one.Text}),
		})
		if okOf(said) {
			out.Fired = append(out.Fired, firedRow{Branch: branch, Session: jsonText(readOf(said)["claude_code_session_url"])})
			continue
		}
		out.Refused = append(out.Refused, refusedRow{Branch: branch, Status: said.Status, Why: reasonOf(said)})
		// A rate refusal holds for the whole window, so the run stops firing. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
		if said.Status == rateCode {
			out.Wait = said.Headers["retry-after"]
			if out.Wait == "" {
				out.Wait = "?"
			}
		}
	}
	if len(out.Refused) > 0 {
		return codeRed
	}
	return codeOK
}

// The API, the repository and the headers a GitHub request takes, or why the run holds none. [[spec/tickets/the-owner-stores-the-token]]
type hub struct {
	API, Repo string
	Headers   map[string]string
}

func (d *Doors) hubOf(token, name string) (hub, string) {
	repo := d.env("GITHUB_REPOSITORY")
	var missing []string
	if token == "" {
		missing = append(missing, name)
	}
	if repo == "" {
		missing = append(missing, "GITHUB_REPOSITORY")
	}
	if len(missing) > 0 {
		return hub{}, "The run holds no " + strings.Join(missing, " and no ") + "."
	}
	api := d.env("GITHUB_API_URL")
	if api == "" {
		api = githubAPI
	}
	return hub{API: api, Repo: repo, Headers: map[string]string{
		"Authorization": "Bearer " + token,
		"Accept":        "application/vnd.github+json",
		"Content-Type":  "application/json",
		"User-Agent":    "level0-dispatch",
	}}, ""
}

// The write branch's pull request opens on the owner's token, so the check runs on it, and then takes auto-merge. [[spec/tickets/the-owner-stores-the-token]]
func (d *Doors) pulled(send Send, write *writeRow, out *pullRow) int {
	if write == nil || (write.State != "pushed" && write.State != "standing") {
		return codeOK
	}
	gh, why := d.hubOf(d.env("PULL_TOKEN"), "PULL_TOKEN")
	if why != "" {
		out.State, out.Why = "refused", why
		return codeRed
	}
	owner, _, _ := strings.Cut(gh.Repo, "/")
	listed := sent(send, gh.API+"/repos/"+gh.Repo+"/pulls?state=open&head="+owner+":"+write.Branch, Request{Method: "GET", Headers: gh.Headers})
	if !okOf(listed) {
		return refusedPull(out, "The pull request list", listed)
	}
	var pulls []struct {
		URL  string `json:"html_url"`
		Head struct {
			Ref string `json:"ref"`
		} `json:"head"`
	}
	if json.Unmarshal([]byte(listed.Text), &pulls) != nil {
		pulls = nil
	}
	for _, one := range pulls {
		if one.Head.Ref == write.Branch {
			out.State, out.URL = "standing", one.URL
			return codeOK
		}
	}
	made := sent(send, gh.API+"/repos/"+gh.Repo+"/pulls", Request{Method: "POST", Headers: gh.Headers, Body: jsonLine(map[string]string{
		"title": write.Branch + ": the dispatch's writes",
		"head":  write.Branch,
		"base":  trunk,
		"body":  "The dispatch's fix bundles, parent closes and cloud markers, per the dispatch workflow.",
	})})
	if !okOf(made) {
		return refusedPull(out, "The pull request", made)
	}
	pull := readOf(made)
	out.State, out.URL = "opened", jsonText(pull["html_url"])
	merge := sent(send, gh.API+"/graphql", Request{Method: "POST", Headers: gh.Headers, Body: jsonLine(map[string]any{
		"query":     autoMerge,
		"variables": map[string]any{"id": pull["node_id"]},
	})})
	errs, _ := readOf(merge)["errors"].([]any)
	if okOf(merge) && len(errs) == 0 {
		return codeOK
	}
	message := reasonOf(merge)
	if len(errs) > 0 {
		if first, ok := errs[0].(map[string]any); ok && first["message"] != nil {
			message = jsonText(first["message"])
		}
	}
	out.Why = "Auto-merge came back refused: " + message
	return codeRed
}

func refusedPull(out *pullRow, what string, said Reply) int {
	out.State = "refused"
	out.Why = what + " came back " + strconv.Itoa(said.Status) + ": " + reasonOf(said)
	return codeRed
}

// A request the network drops answers a status of none, and its reason. [[spec/design_output/doors#a-door-reads-the-outside]]
func sent(send Send, url string, request Request) Reply {
	said, err := send(url, request)
	if err != nil {
		return Reply{Text: err.Error(), Headers: map[string]string{}}
	}
	return said
}

func okOf(said Reply) bool { return said.Status >= okFrom && said.Status < okTo }

// The body as a JSON object, or an empty one. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
func readOf(said Reply) map[string]any {
	out := map[string]any{}
	if json.Unmarshal([]byte(said.Text), &out) != nil || out == nil {
		return map[string]any{}
	}
	return out
}

// The error envelope's message, or the body where none stands. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
func reasonOf(said Reply) string {
	read := readOf(said)
	why := said.Text
	if inner, ok := read["error"].(map[string]any); ok && inner["message"] != nil {
		why = jsonText(inner["message"])
	} else if read["message"] != nil {
		why = jsonText(read["message"])
	}
	if runes := []rune(why); len(runes) > whyCut {
		why = string(runes[:whyCut])
	}
	if why == "" {
		return "no reason given"
	}
	return why
}

// The lines the dispatch prints under its plan. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
func fireLines(out *fireRow) []string {
	lines := []string{"the fire:"}
	for _, one := range out.Fired {
		line := "  " + one.Branch + " fired"
		if one.Session != "" {
			line += ", " + one.Session
		}
		lines = append(lines, line)
	}
	for _, one := range out.Refused {
		lines = append(lines, "  "+one.Branch+" refused, "+strconv.Itoa(one.Status)+": "+one.Why)
	}
	for _, branch := range out.Left {
		lines = append(lines, "  "+branch+" left for the next run")
	}
	if out.Wait != "" {
		lines = append(lines, "  the rate window resets in "+out.Wait+" second(s)")
	}
	if out.Why != "" {
		lines = append(lines, "  "+out.Why)
	}
	if len(lines) == 1 {
		lines = append(lines, "  none")
	}
	pull := "the pull request: " + out.Pull.State
	if out.Pull.URL != "" {
		pull += ", " + out.Pull.URL
	}
	lines = append(lines, pull)
	if out.Pull.Why != "" {
		lines = append(lines, "  "+out.Pull.Why)
	}
	return lines
}
