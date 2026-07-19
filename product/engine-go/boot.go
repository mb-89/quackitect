package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// design: go-boot-cmd  implements: req-boot-sequence
// The boot readout: the FIXED onboarding sequence (AGENTS.md ritual + onboard.md) with
// mechanical completion state. It is ungated on purpose. Boot runs BEFORE attestation,
// and a blocked agent must always be able to ask the engine where boot stands. The two
// ritual steps the engine cannot watch directly (the recital, the channel's key) use
// mechanical proxies. A minted session key proves a grant was redeemed, since the grant
// is handed over only after a visible recital. Key validity on THIS channel proves
// attestation. The verdict line is onboard.md's report shape: blocked outranks yellow,
// and the deciding step's detail names the one next action.
type bootStep struct {
	Name   string
	Done   bool
	Detail string
}

func bootStepNames() []string {
	return []string{"contract", "recital+grant", "voice", "methods", "workspace", "attest", "next"}
}

// bootVerdict folds the steps to the onboard.md report shape. workspace and next are
// the BLOCKING steps: without them `quack next` cannot run. Any other undone step is
// yellow — work to do, not a boot failure. The first undone step decides the detail.
func bootVerdict(steps []bootStep) string {
	byName := map[string]bootStep{}
	for _, s := range steps {
		byName[s.Name] = s
	}
	for _, n := range []string{"workspace", "next"} {
		if s, ok := byName[n]; ok && !s.Done {
			return "boot: blocked - " + s.Detail
		}
	}
	for _, s := range steps {
		if !s.Done {
			return "boot: yellow - " + s.Detail
		}
	}
	return "boot: green - " + byName["next"].Detail
}

// bootStepsLive checks each fixed step against the live workspace.
func bootStepsLive(key string) []bootStep {
	var steps []bootStep
	add := func(name string, done bool, detail string) {
		steps = append(steps, bootStep{Name: name, Done: done, Detail: detail})
	}
	exists := func(p string) bool { st, err := os.Stat(p); return err == nil && !st.IsDir() }

	prompts := filepath.Join(EngineDir(), "method", "prompts")
	contract := filepath.Join(prompts, "contract.md")
	add("contract", exists(contract), map[bool]string{
		true:  "read " + filepath.ToSlash(contract) + " in full",
		false: "contract.md MISSING - the workspace is not a quackitect vehicle"}[exists(contract)])

	ak := akLoad()
	add("recital+grant", ak.KeyHash != "", map[bool]string{
		true:  "a session key is minted - a grant was redeemed",
		false: "recite the contract visibly, then ask the adjudicator for `quack attest --grant`"}[ak.KeyHash != ""])

	voice := resolveBrand("voice.md")
	add("voice", voice != "", map[bool]string{
		true:  "read " + filepath.ToSlash(voice),
		false: "voice.md missing from product/brand/ and the engine design layer"}[voice != ""])

	onboard, engage := filepath.Join(prompts, "onboard.md"), filepath.Join(prompts, "engage.md")
	mOK := exists(onboard) && exists(engage)
	add("methods", mOK, map[bool]string{
		true:  "read onboard.md and engage.md under " + filepath.ToSlash(prompts),
		false: "onboard.md or engage.md missing under " + filepath.ToSlash(prompts)}[mOK])

	nodes := LoadAll()
	wOK := len(nodes) > 0
	add("workspace", wOK, map[bool]string{
		true:  fmt.Sprintf("%d nodes loaded", len(nodes)),
		false: "no nodes under spec/ - run `quack start stubs` or point --base at a workspace"}[wOK])

	if key == "" {
		key = os.Getenv("QUACK_KEY")
	}
	aOK := channelInteractive() || attestKeyValid(key)
	add("attest", aOK, map[bool]string{
		true:  "this channel is attested",
		false: "no valid key on this channel - redeem the grant per the contract's attest section"}[aOK])

	if !wOK {
		add("next", false, "no workspace to walk")
		return steps
	}
	st := StatusMap(nodes)
	v := pickVersion(nodes, st, "")
	ready, gates := nextReadyIDs(nodes, st, v)
	if len(ready) > 0 {
		add("next", true, fmt.Sprintf("%d ready in %s - `quack next` names the first", len(ready), v))
		return steps
	}
	done := true
	for id := range gates {
		if iterOf(nodes[id].Path) == v && moduleSelected(nodes[id]) && !stateSatisfies(st[id]) {
			done = false
		}
	}
	if done {
		add("next", true, v+" is done - plan the next iteration with /engage start")
	} else {
		add("next", false, v+" has open checks but none ready - a dependency cycle or an unmet gate; `quack status` explains")
	}
	return steps
}

// cmdBoot prints the checklist and the verdict line. Never gated, never advancing.
func cmdBoot(args []string) {
	steps := bootStepsLive(flagVal(args, "--key"))
	fmt.Println("boot sequence:")
	for _, s := range steps {
		mark := " "
		if s.Done {
			mark = "x"
		}
		fmt.Printf(" [%s] %-13s %s\n", mark, s.Name, s.Detail)
	}
	fmt.Println(bootVerdict(steps))
}

// enddesign
