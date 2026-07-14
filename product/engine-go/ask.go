package main

// ask.go — the mobile ask loop: a gate or decision ask travels to a
// paired device over a channel adapter; the answer comes back by polling and records as
// the adjudication. No daemon: `await` is a bounded foreground command, and every engine
// run drains pending answers as the fallback.

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// design: go-ask-core  implements: req-ask-loop.1, req-ask-loop.5, req-ask-loop.3, req-ask-loop.6
// The ask model: one pending question with a correlation id, 1..n id-labelled options
// (buttons cap at three — the body always lists ALL options), an injectable-clock
// timeout, and FIRST-WINS resolution: the first well-formed answer on a pending
// correlation id resolves the ask; late, duplicate, or post-expiry answers are ignored
// (the Home Assistant failure modes, engineered around).
type Ask struct {
	ID            string   // ask id (unique per ask)
	CID           string   // correlation id carried by every answer
	Kind          string   // "gate" | "decision"
	Check         string   // the primary check id a gate ask blesses
	Checks        []string // a COMBINED hand-off's full group (one card, one tap blesses all)
	Question      string
	Options       []AskOption
	Created       int64  // unix seconds (injectable clock everywhere)
	CreatedRemote int64  // the CHANNEL's own receive stamp for the sent card — staleness compares answers on ONE clock (a skewed pc clock must not eat fresh taps)
	Updated       int64  // last state-change stamp, unix seconds (merge-on-save picks the newest; go-ask-hardening)
	Timeout       int64  // seconds until expiry
	State         string // "pending" | "resolved" | "expired"
	Answer        string // the winning option id, once resolved
	Sent          bool   // dispatched to the paired adapters already
	Page          string // the hand-off page URL (adr-handoff-html): rides as the view action when a server serves it
}

// AskOption is one answer choice: a stable id and its label.
type AskOption struct {
	ID    string
	Label string
}

// AskAnswer is one raw answer read off a channel: the option id and its correlation id.
type AskAnswer struct {
	CID  string
	Body string
	At   int64
}

// AskStore holds the pending asks (runtime state, data home — never the ledger).
type AskStore struct {
	Asks []Ask
}

// BlessIntent is the MODEL of a resolved gate answer: pure data, produced by
// askApplyAnswer and consumed by the bless path. The loop that transports it
// lives outward (go-ask-loop).
type BlessIntent struct {
	Check   string
	Checks  []string // the combined group: every member blessed, recorded individually
	Verdict string   // "y" | "n"
	By      string   // always "user"
	Channel string   // the answering channel, noted in the record
}

// renderAskBody renders the one-pager body: question, EVERY option (even past the
// three-button ceiling), and the correlation id with the answer instruction.
func renderAskBody(a Ask) string {
	var b strings.Builder
	b.WriteString(strings.ToUpper(a.Kind) + " ASK " + a.CID + " - " + a.Question + "\n\n")
	for _, o := range a.Options {
		b.WriteString(o.ID + ") " + o.Label + "\n")
	}
	b.WriteString("\nanswer with: <option-id> " + a.CID)
	return b.String()
}

// askApplyAnswer resolves the matching PENDING ask first-wins. A gate ask returns the
// bless intent; a decision ask records the choice on the ask itself.
func askApplyAnswer(s *AskStore, ans AskAnswer, channel string, now int64) (*BlessIntent, bool) {
	for i := range s.Asks {
		a := &s.Asks[i]
		if a.CID != ans.CID || a.State != "pending" {
			continue
		}
		// an answer stamped BEFORE the ask was created belongs to a previous ask
		// generation (a re-sent gate question) - refused, never applied (go-ask-hardening).
		// The channel's own stamp wins when known: answers are stamped by the channel's
		// clock, and a skewed pc clock must not eat fresh taps.
		created := a.Created
		if a.CreatedRemote > 0 {
			created = a.CreatedRemote
		}
		if answerStale(created, ans.At) {
			fmt.Fprintln(os.Stderr, "ask: stale answer dropped for "+a.CID+" (answer predates the ask)")
			return nil, false
		}
		// the token must be one of the ask's DECLARED options - anything else is
		// uncontrolled input and never lands in a.Answer
		fields := strings.Fields(ans.Body)
		if len(fields) == 0 {
			return nil, false
		}
		valid := false
		for _, o := range a.Options {
			if o.ID == fields[0] {
				valid = true
				break
			}
		}
		if !valid {
			return nil, false
		}
		a.State = "resolved"
		a.Answer = fields[0]
		a.Updated = now
		if a.Kind == "gate" {
			group := a.Checks
			if len(group) == 0 {
				group = []string{a.Check}
			}
			// FIRST-WINS extends to SIBLINGS: any pending ask covering a member of this
			// group is superseded, never answerable twice
			covered := map[string]bool{}
			for _, c := range group {
				covered[c] = true
			}
			for j := range s.Asks {
				b := &s.Asks[j]
				if j == i || b.State != "pending" {
					continue
				}
				if covered[b.Check] {
					b.State = "resolved"
					b.Answer = "superseded"
					b.Updated = now
				}
			}
			v := "n"
			if strings.HasPrefix(a.Answer, "y") {
				v = "y"
			}
			return &BlessIntent{Check: a.Check, Checks: group, Verdict: v, By: "user", Channel: channel}, true
		}
		return nil, true
	}
	return nil, false
}

// askExpire expires overdue asks and returns them so the caller can supersede their
// device notifications. Expiry is engine-driven: dismissal events are unreliable.
func askExpire(s *AskStore, now int64) []Ask {
	var out []Ask
	for i := range s.Asks {
		a := &s.Asks[i]
		if a.State == "pending" && now > a.Created+a.Timeout {
			a.State = "expired"
			a.Updated = now
			out = append(out, *a)
		}
	}
	return out
}

// enddesign

// design: go-ask-loop  implements: req-ask-loop.2, req-ask-loop.4, req-ask-loop.9, req-await-console-exit
// The loop: dispatch every pending, unsent ask through EVERY paired adapter; poll the
// adapters; correlate and apply. A resolved GATE answer becomes a bless with actor=user
// — the paired device IS the adjudicator (paired = trustworthy) — and the
// answering channel is noted in the record. Applying rides the EXISTING bless path; the
// asks themselves never enter the ledger (BlessIntent, the pure answer model,
// rides in go-ask-core).
//
// await-console-exit (req-await-console-exit): an await is AWAY-mode only. Every engine
// dispatch appends one line to the workspace call log (go-call-log), and the awaiting
// process writes its OWN line only at exit — so ANY line that lands while the loop runs is
// a call from another process. awaitForeignCall watches for that growth and ends the await,
// handing the walk back to drain mode (the next command drains the pending tap as the
// fallback). The rule needs no PID: the awaiter's own line is not on disk until it exits.

// callLogLineCount counts the non-empty lines currently in the workspace call log; a missing
// log is zero. It is the baseline an await snapshots and re-reads to detect foreign activity.
func callLogLineCount() int {
	raw, err := os.ReadFile(callLogPath())
	if err != nil {
		return 0
	}
	n := 0
	for _, ln := range strings.Split(string(raw), "\n") {
		if strings.TrimSpace(ln) != "" {
			n++
		}
	}
	return n
}

// awaitForeignCall reports whether the call log has grown past the await's start baseline —
// i.e. another process logged an engine call on this workspace while the await ran.
func awaitForeignCall(baseline int) bool { return callLogLineCount() > baseline }

// awaitHandbackMsg is the line an await prints when a foreign console call ends it: the walk
// hands back to drain mode, where the next command applies any pending tap.
func awaitHandbackMsg() string {
	return "await: another process is driving this workspace - handing back to drain mode (the next command drains any pending tap)"
}

// AskAdapter is the channel seam: send an ask out, poll answers back.
// The method is ChannelName, not Name: the engine's flow pass resolves bare
// identifiers by name, and a method called Name would swallow every
// fs.DirEntry Name() in the codebase as a false edge onto the transport.
type AskAdapter interface {
	ChannelName() string
	SendAsk(a Ask) error
	PollAnswers(since string) (answers []AskAnswer, next string, err error)
}

// AskStreamer is the OPTIONAL blocking lane of the seam: hold one connection open until
// the deadline and hand each incoming answer to apply. The stream ends when apply
// returns true (something resolved — the return value), the deadline passes, or the
// connection drops; the caller owns reconnection. An adapter without it falls back to
// the poll lane. The wire stays behind the seam: services never see the transport.
type AskStreamer interface {
	StreamAnswers(end int64, apply func(AskAnswer) bool) bool
}

// askDispatch sends every pending, not-yet-sent ask through every paired adapter.
func askDispatch(s *AskStore, adapters []AskAdapter) (int, error) {
	sent := 0
	for i := range s.Asks {
		a := &s.Asks[i]
		if a.State != "pending" || a.Sent {
			continue
		}
		for _, ad := range adapters {
			if err := ad.SendAsk(*a); err != nil {
				return sent, err
			}
			sent++
			// stamp the ask with the channel's own clock when the adapter knows it
			if rs, ok := ad.(interface{ LastSendTime() int64 }); ok {
				if t := rs.LastSendTime(); t > 0 && (a.CreatedRemote == 0 || t < a.CreatedRemote) {
					a.CreatedRemote = t
				}
			}
		}
		a.Sent = true
	}
	return sent, nil
}

// enddesign

// design: go-ask-context  implements: req-ask-context
// The hand-off narrative is generated ONCE (adr-ask-context-once). The ask carries it
// below the pager card, one blank line between. Both lanes show the identical text.
// The card always comes first. An empty narrative returns the card untouched.
func askComposeBody(card, context string) string {
	if context == "" {
		return card
	}
	return card + "\n\n" + context
}

// enddesign

// design: go-ask-pairing  implements: req-device-pairing.1
// `quack pair ntfy`: ONE operation mints the high-entropy topic pair (the credential —
// answer authenticity equals its possession, adr-answer-authenticity), writes the
// machine-local pairing config (data home, never the repo), and prints the transit
// DISCLAIMER and the LOCKSCREEN instruction (raid-lockscreen-actions).
var pairCfgOverride string // test seam

func pairCfgPath() string {
	if pairCfgOverride != "" {
		return pairCfgOverride
	}
	return filepath.Join(userDataBase(), "quackitect", "pairing.json")
}

type pairConfig struct {
	Channel string `json:"channel"`
	Base    string `json:"base"`
	Ask     string `json:"ask"`
	Answer  string `json:"answer"`
}

func mintTopicSuffix() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func cmdPair(args []string) error {
	ch := "ntfy"
	if len(args) > 0 {
		ch = args[0]
	}
	if ch == "--show" { // re-print the CURRENT pairing (QR + link) without re-minting
		cfg, ok := loadPairConfig()
		if !ok {
			return fmt.Errorf("pair --show: nothing paired yet")
		}
		printPairing(cfg)
		return nil
	}
	if ch != "ntfy" {
		return fmt.Errorf("pair: channel %q is not in this wave (ntfy only; Slack deferred by adr-dmvbh5y)", ch)
	}
	suffix := mintTopicSuffix()
	cfg := pairConfig{Channel: "ntfy", Base: "https://ntfy.sh", Ask: "quack-ask-" + suffix, Answer: "quack-answer-" + suffix}
	raw, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(pairCfgPath()), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(pairCfgPath(), raw, 0o644); err != nil {
		return err
	}
	fmt.Println("paired: ntfy")
	printPairing(cfg)
	return nil
}

// printPairing renders the subscribe QR (the ntfy:// DEEP LINK - an https QR only
// opens the browser; the app registers the scheme and stores the channel) plus
// the plain https link as the manual/desktop fallback, and the two safety instructions.
func printPairing(cfg pairConfig) {
	deep := "ntfy://" + strings.TrimPrefix(strings.TrimPrefix(cfg.Base, "https://"), "http://") + "/" + cfg.Ask
	fmt.Println("  scan with the ntfy app (it stores the channel; or type the link below):")
	fmt.Print(qrRender(qrMatrix(deep)))
	fmt.Println("  subscribe on the phone:", cfg.Base+"/"+cfg.Ask)
	fmt.Println("  DISCLAIMER: asks transit a third-party relay and are cached there for hours;")
	fmt.Println("  they carry check ids and questions, never secrets. Self-host ntfy to remove retention.")
	fmt.Println("  LOCKSCREEN: enable the app's hide-actions-until-unlock setting - a pocket touch")
	fmt.Println("  must not answer a gate. The topic is the credential: treat it like a password.")
}

func loadPairConfig() (pairConfig, bool) {
	raw, err := os.ReadFile(pairCfgPath())
	if err != nil {
		return pairConfig{}, false
	}
	var cfg pairConfig
	if json.Unmarshal(raw, &cfg) != nil {
		return pairConfig{}, false
	}
	return cfg, cfg.Ask != "" && cfg.Answer != ""
}

// enddesign

// design: go-ask-seam  implements: req-channel-adapters.1, req-channel-adapters.2
// Adding a channel = one AskAdapter behind the seam; the loop never changes. Everything
// is stdlib-only. The EXEC LANE (adr-ask-seam-exec-lane) drives an external process over
// a file contract, so the deferred corporate adapters (PowerShell/Outlook-COM, Teams
// flow sinks) drop in without engine work: the engine writes ask JSON to the contract
// dir, invokes the command once per operation, and reads answer JSON lines back.
type execAdapter struct {
	name string
	cmd  string // the external adapter command; contract dir passed as its argument
	dir  string // the file contract home
}

func (e *execAdapter) ChannelName() string { return e.name }

func (e *execAdapter) SendAsk(a Ask) error {
	raw, err := json.Marshal(a)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(e.dir, 0o755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(e.dir, "ask-"+a.ID+".json"), raw, 0o644)
}

func (e *execAdapter) PollAnswers(since string) ([]AskAnswer, string, error) {
	raw, err := os.ReadFile(filepath.Join(e.dir, "answers.jsonl"))
	if err != nil {
		return nil, since, nil // no answers yet is not an error
	}
	var out []AskAnswer
	for _, ln := range strings.Split(string(raw), "\n") {
		if strings.TrimSpace(ln) == "" {
			continue
		}
		var a AskAnswer
		if json.Unmarshal([]byte(ln), &a) == nil {
			out = append(out, a)
		}
	}
	return out, since, nil
}

// enddesign

// design: go-ntfy-adapter  implements: req-channel-adapters.3, req-ask-loop.8
// The ntfy adapter: send = one HTTP PUT with the ask body and headers; poll = one GET
// with `since=` (json lines). A GATE ask renders visibly distinct (high priority,
// bangbang tag) from a decision ask (default, question tag). Up to three X-Actions
// buttons fire `PUT <option-id> <cid>` at the answer topic — the exact wire the
// spike proved, phone tap included.
func ntfyHeaders(a Ask, answerTopic string) map[string]string {
	h := map[string]string{}
	h["X-Title"] = "quackitect " + strings.ToUpper(a.Kind) + " ask: " + a.Check
	if a.Kind == "gate" {
		h["X-Priority"] = "high"
		h["X-Tags"] = "bangbang"
	} else {
		h["X-Priority"] = "default"
		h["X-Tags"] = "grey_question"
	}
	limit := 3
	if a.Page != "" {
		limit = 2 // the third action slot carries the hand-off page (adr-handoff-html)
	}
	n := len(a.Options)
	if n > limit {
		n = limit
	}
	var acts []string
	for _, o := range a.Options[:n] {
		// the topic stays BARE here; SendAsk absolutizes it against the adapter's base
		acts = append(acts, "http, "+o.ID+" "+o.Label+", "+answerTopic+", method=PUT, body="+o.ID+" "+a.CID)
	}
	if a.Page != "" {
		acts = append(acts, "view, open hand-off, "+a.Page)
	}
	h["X-Actions"] = strings.Join(acts, "; ")
	return h
}

type ntfyAdapter struct {
	base, ask, answer string
	client            *http.Client
	lastSend          int64 // the server's receive stamp of the last sent card
}

// LastSendTime hands askDispatch the channel-clock stamp of the last send.
func (n *ntfyAdapter) LastSendTime() int64 { return n.lastSend }

func ntfyAdapterFor(base, askTopic, answerTopic string) AskAdapter {
	return &ntfyAdapter{base: base, ask: askTopic, answer: answerTopic, client: &http.Client{Timeout: 30 * time.Second}}
}

// askAdapterFor maps a pairing to its concrete transport. This factory is the ONLY
// place the services rank reaches the constructor through: everything inward of the
// rim holds AskAdapter values (inward-only, model-engine-layers).
func askAdapterFor(cfg pairConfig) AskAdapter {
	return ntfyAdapterFor(cfg.Base, cfg.Ask, cfg.Answer)
}

func (n *ntfyAdapter) ChannelName() string { return "ntfy" }

func (n *ntfyAdapter) SendAsk(a Ask) error {
	req, err := http.NewRequest("PUT", n.base+"/"+n.ask, strings.NewReader(renderAskBody(a)))
	if err != nil {
		return err
	}
	for k, v := range ntfyHeaders(a, n.answer) {
		if k == "X-Actions" {
			v = strings.ReplaceAll(v, ", "+n.answer+",", ", "+n.base+"/"+n.answer+",")
		}
		req.Header.Set(k, v)
	}
	resp, err := n.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("ntfy send: %s", resp.Status)
	}
	// the publish echo carries the SERVER's receive time — the same clock that will
	// stamp the answers; staleness must compare on one clock
	if raw, err := io.ReadAll(resp.Body); err == nil {
		var ev ntfyEvent
		if json.Unmarshal(raw, &ev) == nil && ev.Time > 0 {
			n.lastSend = ev.Time
		}
	}
	return nil
}

type ntfyEvent struct {
	ID      string `json:"id"`
	Time    int64  `json:"time"`
	Event   string `json:"event"`
	Message string `json:"message"`
}

func (n *ntfyAdapter) PollAnswers(since string) ([]AskAnswer, string, error) {
	if since == "" {
		since = "all"
	}
	resp, err := n.client.Get(n.base + "/" + n.answer + "/json?poll=1&since=" + since)
	if err != nil {
		return nil, since, err
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, since, err
	}
	var out []AskAnswer
	next := since
	for _, ln := range strings.Split(string(raw), "\n") {
		if strings.TrimSpace(ln) == "" {
			continue
		}
		var ev ntfyEvent
		if json.Unmarshal([]byte(ln), &ev) != nil || ev.Event != "message" {
			continue
		}
		next = ev.ID
		parts := strings.Fields(ev.Message)
		if len(parts) < 2 {
			continue
		}
		out = append(out, AskAnswer{CID: parts[1], Body: parts[0], At: ev.Time})
	}
	return out, next, nil
}

// StreamAnswers implements the AskStreamer lane over ntfy's held-open json stream:
// one GET, line-delimited events until the deadline. The client timeout covers the
// whole remaining window; a dropped stream returns false and the caller reconnects.
func (n *ntfyAdapter) StreamAnswers(end int64, apply func(AskAnswer) bool) bool {
	client := &http.Client{Timeout: time.Duration(end-time.Now().Unix()+2) * time.Second}
	resp, err := client.Get(n.base + "/" + n.answer + "/json?since=all")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	sc := bufio.NewScanner(resp.Body)
	for sc.Scan() {
		var ev ntfyEvent
		if json.Unmarshal(sc.Bytes(), &ev) != nil || ev.Event != "message" {
			continue
		}
		parts := strings.Fields(ev.Message)
		if len(parts) < 2 {
			continue
		}
		if apply(AskAnswer{CID: parts[1], Body: parts[0], At: ev.Time}) {
			return true
		}
		if time.Now().Unix() >= end {
			return false
		}
	}
	return false
}

// enddesign
