package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// design: go-attest-state  implements: req-attest-ritual.5, req-attest-ritual.3
// The attestation state (adr-attest-ritual) is a small JSON file in the workspace data home —
// machine-local cache, never the repo. It stores only sha256 HASHES of the grant code and the key
// chain: the plaintext key exists in exactly one place, the conversation that received it. The
// current key carries a command budget (default 100 - sized so the renewal ritual still
// fires on long sessions, just not several times a day); each gated command consumes one; at zero the key expires and only a
// renewal (old key + fresh challenge) issues a successor. The previous key's hash is kept
// solely to refuse a stale renew.
const attestBudgetDefault = 100

type akState struct {
	GrantHash   string `json:"grant_hash,omitempty"`
	KeyHash     string `json:"key_hash,omitempty"`
	PrevKeyHash string `json:"prev_key_hash,omitempty"`
	Budget      int    `json:"budget"`
}

func attestRoot() string {
	if attestStateOverride != "" {
		return attestStateOverride
	}
	return dataDirFor("attest")
}

func attestStateFile() string { return filepath.Join(attestRoot(), "attest-state.json") }

func akLoad() akState {
	var st akState
	if raw, err := os.ReadFile(attestStateFile()); err == nil {
		json.Unmarshal(raw, &st)
	}
	return st
}

func akSave(st akState) error {
	if err := os.MkdirAll(attestRoot(), 0o755); err != nil {
		return err
	}
	raw, _ := json.MarshalIndent(st, "", "  ")
	return os.WriteFile(attestStateFile(), raw, 0o644)
}

func attestHash(s string) string {
	x := sha256.Sum256([]byte(s))
	return hex.EncodeToString(x[:])
}

func attestKeyValid(key string) bool {
	if key == "" {
		return false
	}
	st := akLoad()
	return st.KeyHash != "" && attestHash(key) == st.KeyHash && st.Budget > 0
}

func attestConsume(key string) error {
	st := akLoad()
	if st.KeyHash == "" || attestHash(key) != st.KeyHash {
		return errors.New("attest: not the current key")
	}
	if st.Budget <= 0 {
		return errors.New("attest: key expired — renew it")
	}
	st.Budget--
	return akSave(st)
}

// enddesign

// design: go-attest-ritual  implements: req-attest-ritual.4, req-attest-ritual.2, req-attest-ritual.6
// The ritual (adr-attest-ritual): a one-time grant code is minted for the interactive console
// (channel enforcement at the CLI layer); redeeming it — or renewing with the current key — requires
// answering a CHALLENGE derived from the live contract: sha256(nonce+text) picks rule K and word N
// among the rule's LETTER-BEARING words (raw positions can land on punctuation).
// The nonce is the code/key being redeemed, so every attest step binds to its own fresh question and
// the only way to answer is to have the contract text at hand. A successor key supersedes the old
// one; a superseded key can neither act nor renew.
func attestContractPath() string {
	return filepath.Join(EngineDir(), "method", "prompts", "contract.md")
}

var attestRuleRe = regexp.MustCompile(`(?m)^## (\d+)\. (.+)$`)

// attestRuleWords returns the letter-bearing words of rule K in the live contract.
func attestRuleWords(k int) ([]string, error) {
	raw, err := os.ReadFile(attestContractPath())
	if err != nil {
		return nil, err
	}
	text := strings.ReplaceAll(string(raw), "\r\n", "\n")
	text = regexp.MustCompile(`(?s)<!--.*?-->`).ReplaceAllString(text, " ")
	idx := attestRuleRe.FindAllStringSubmatchIndex(text, -1)
	for i, m := range idx {
		num, _ := strconv.Atoi(text[m[2]:m[3]])
		if num != k {
			continue
		}
		end := len(text)
		if i+1 < len(idx) {
			end = idx[i+1][0]
		}
		var words []string
		for _, w := range strings.Fields(text[m[1]:end]) {
			for _, r := range w {
				if unicode.IsLetter(r) {
					words = append(words, w)
					break
				}
			}
		}
		return words, nil
	}
	return nil, fmt.Errorf("attest: contract rule %d not found", k)
}

func attestRuleCount() int {
	raw, err := os.ReadFile(attestContractPath())
	if err != nil {
		return 0
	}
	return len(attestRuleRe.FindAllString(strings.ReplaceAll(string(raw), "\r\n", "\n"), -1))
}

// attestChallenge derives the deterministic question for a nonce (the code or key in play).
func attestChallenge(nonce string) (string, error) {
	rules := attestRuleCount()
	if rules == 0 {
		return "", errors.New("attest: contract unreadable")
	}
	raw, _ := os.ReadFile(attestContractPath())
	h := sha256.Sum256([]byte(nonce + attestHash(string(raw))))
	k := 1 + int(h[0])%rules
	words, err := attestRuleWords(k)
	if err != nil || len(words) == 0 {
		return "", errors.New("attest: rule has no words")
	}
	n := 1 + int(h[1])%len(words)
	return fmt.Sprintf("word %d of rule %d (nonce %s)", n, k, shortNonce(nonce)), nil
}

func shortNonce(nonce string) string {
	if len(nonce) > 12 {
		return nonce[:12]
	}
	return nonce
}

var attestChallengeRe = regexp.MustCompile(`word (\d+) of rule (\d+)`)

func attestCorrectAnswer(challenge string) (string, error) {
	m := attestChallengeRe.FindStringSubmatch(challenge)
	if m == nil {
		return "", errors.New("attest: malformed challenge")
	}
	n, _ := strconv.Atoi(m[1])
	k, _ := strconv.Atoi(m[2])
	words, err := attestRuleWords(k)
	if err != nil || n < 1 || n > len(words) {
		return "", errors.New("attest: challenge out of range")
	}
	return words[n-1], nil
}

func attestNormWord(w string) string {
	return strings.ToLower(strings.TrimFunc(w, func(r rune) bool { return !unicode.IsLetter(r) && !unicode.IsNumber(r) }))
}

func attestAnswerOK(challenge, answer string) bool {
	want, err := attestCorrectAnswer(challenge)
	if err != nil || strings.TrimSpace(answer) == "" {
		return false
	}
	return attestNormWord(answer) == attestNormWord(want)
}

func attestRandom(n int, enc string) string {
	b := make([]byte, n)
	rand.Read(b)
	if enc == "b32" {
		return strings.TrimRight(base32.StdEncoding.EncodeToString(b), "=")
	}
	return strings.TrimRight(base64.URLEncoding.EncodeToString(b), "=")
}

// attestMintGrant mints the one-time grant code (the CLI restricts it to the console channel).
func attestMintGrant() (string, error) {
	st := akLoad()
	code := "GRANT-" + attestRandom(5, "b32")
	st.GrantHash = attestHash(code)
	if err := akSave(st); err != nil {
		return "", err
	}
	return code, nil
}

func attestIssueKey(st akState) (string, akState, error) {
	key := "qk-" + attestRandom(24, "b64")
	st.PrevKeyHash = st.KeyHash
	st.KeyHash = attestHash(key)
	st.Budget = attestBudgetDefault
	return key, st, nil
}

// attestRedeem turns a granted code plus a correct challenge answer into the session's root key.
func attestRedeem(code, answer string) (string, error) {
	st := akLoad()
	if st.GrantHash == "" || attestHash(code) != st.GrantHash {
		return "", errors.New("attest: no such grant (codes are single-use)")
	}
	ch, err := attestChallenge(code)
	if err != nil {
		return "", err
	}
	if !attestAnswerOK(ch, answer) {
		return "", fmt.Errorf("attest: wrong answer to %q — read the contract", ch)
	}
	key, st2, err := attestIssueKey(st)
	if err != nil {
		return "", err
	}
	st2.GrantHash = "" // single-use
	if err := akSave(st2); err != nil {
		return "", err
	}
	return key, nil
}

// enddesign

// design: go-attest-gate  implements: req-attest-ritual.1, req-attest-ritual.7
// The gate (adr-attest-ritual): ledger-ADVANCING commands (next, start, bless, ship, observe-red)
// on the agent channel refuse to run without a valid session key (--key flag, QUACK_KEY env as the
// second read path); read-only commands stay open so debugging is never hostage. The refusal names
// contract.md and NOTHING else — the unlock instructions live only inside the contract, so the sole
// path to a key runs through the file. The interactive console (a person, i8 channel stat) is never
// gated by its own machinery.
// `ask` and `await` advance the ledger too (an ask can end in a bless), so they ride the
// gate; the drain-on-run fallback executes the USER's recorded tap and is deliberately
// ungated (the paired credential IS its authorization — adr-answer-authenticity).
var attestGatedCmds = map[string]bool{"next": true, "start": true, "bless": true, "ship": true, "observe-red": true, "migrate-actors": true, "ask": true, "await": true}

func attestRequired(cmd string, interactive bool) bool {
	return !interactive && attestGatedCmds[cmd]
}

// attestGuard enforces the gate for one dispatch; returns rest with --key stripped.
func attestGuard(cmd string, rest []string) []string {
	key := flagVal(rest, "--key")
	rest = stripFlagPair(rest, "--key")
	if !attestRequired(cmd, channelInteractive()) {
		return rest
	}
	if key == "" {
		key = os.Getenv("QUACK_KEY")
	}
	if !attestKeyValid(key) {
		st := akLoad()
		reason := "no attested session on this channel"
		if key != "" && st.KeyHash != "" && attestHash(key) == st.KeyHash && st.Budget <= 0 {
			reason = "the session key's command budget is spent — renew it"
		}
		fmt.Fprintln(os.Stderr, "BLOCKED: "+reason+".")
		fmt.Fprintln(os.Stderr, "Read product/quackitect/method/prompts/contract.md in full — it tells you how to proceed.")
		quackExit(3)
	}
	attestConsume(key)
	return rest
}

func stripFlagPair(args []string, flag string) []string {
	out := make([]string, 0, len(args))
	for i := 0; i < len(args); i++ {
		if args[i] == flag && i+1 < len(args) {
			i++
			continue
		}
		out = append(out, args[i])
	}
	return out
}

// cmdAttest is the ritual's CLI: --grant (console only), --challenge <nonce>, <code> --answer <w>,
// --renew <key> --answer <w>. The command itself is never gated — it IS the unlock path.
func cmdAttest(args []string) {
	switch {
	case hasFlag(args, "--grant"):
		if !channelInteractive() {
			fmt.Fprintln(os.Stderr, "attest: --grant is minted at the interactive console only — ask the adjudicator.")
			quackExit(3)
		}
		code, err := attestMintGrant()
		if err != nil {
			fmt.Fprintln(os.Stderr, "attest:", err)
			quackExit(1)
		}
		fmt.Println("grant code (single-use, hand it to the agent):", code)
	case flagVal(args, "--challenge") != "":
		ch, err := attestChallenge(flagVal(args, "--challenge"))
		if err != nil {
			fmt.Fprintln(os.Stderr, "attest:", err)
			quackExit(1)
		}
		fmt.Println("challenge:", ch)
	case flagVal(args, "--renew") != "":
		key, err := attestRenew(flagVal(args, "--renew"), flagVal(args, "--answer"))
		if err != nil {
			fmt.Fprintln(os.Stderr, "attest:", err)
			quackExit(1)
		}
		fmt.Println("session key (renewed, budget "+fmt.Sprint(attestBudgetDefault)+"):", key)
	case len(args) > 0 && !strings.HasPrefix(args[0], "-"):
		key, err := attestRedeem(args[0], flagVal(args, "--answer"))
		if err != nil {
			fmt.Fprintln(os.Stderr, "attest:", err)
			quackExit(1)
		}
		fmt.Println("session key (budget "+fmt.Sprint(attestBudgetDefault)+"):", key)
	default:
		fmt.Println("usage: attest --grant | --challenge <nonce> | <code> --answer <word> | --renew <key> --answer <word>")
	}
}

// enddesign

// attestRenew chains a successor key off the current one — no grant, no person, just a re-read.
func attestRenew(oldKey, answer string) (string, error) {
	st := akLoad()
	if st.KeyHash == "" || attestHash(oldKey) != st.KeyHash {
		return "", errors.New("attest: not the current key (superseded keys cannot renew)")
	}
	ch, err := attestChallenge(oldKey)
	if err != nil {
		return "", err
	}
	if !attestAnswerOK(ch, answer) {
		return "", fmt.Errorf("attest: wrong answer to %q — read the contract", ch)
	}
	key, st2, err := attestIssueKey(st)
	if err != nil {
		return "", err
	}
	if err := akSave(st2); err != nil {
		return "", err
	}
	return key, nil
}

// enddesign
