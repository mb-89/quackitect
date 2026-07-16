package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// design: go-register-vale  implements: req-register-advisory
// This is the register lane (adr-vale-autopull). Vale, one static MIT Go binary, is AUTO-PULLED once per OS into the data home, a pinned version, the global-binary bootstrap pattern. It runs as a subprocess, never linked and never hand-rolled. When the binary is absent and the pull fails, the engine prints ONE loud warning, "prose linter missing; prose quality is likely to suffer", and the lane stays empty. Findings are ADVISORY by construction. They print on their own channel and never join a fatal exit set. This is the GitLab production lesson: readability signals advise, and only unambiguous rules block.
const valeVersion = "3.7.1"

func valeDir() string  { return filepath.Join(dataHome(), "tools", "vale") }
func valePath() string { return filepath.Join(valeDir(), "vale.exe") }

func valeURL() string {
	if runtime.GOOS == "windows" {
		return "https://github.com/errata-ai/vale/releases/download/v" + valeVersion + "/vale_" + valeVersion + "_Windows_64-bit.zip"
	}
	return "https://github.com/errata-ai/vale/releases/download/v" + valeVersion + "/vale_" + valeVersion + "_Linux_64-bit.tar.gz"
}

// ensureVale pulls the pinned binary once; a second call finds it cached. Returns "" on failure.
// QUACK_NO_PULL skips the network entirely (fixture homes never download - the battery's
// zero-network discipline; found live when a fresh-home fixture spent 45s pulling vale),
// and the pull itself is bounded so a slow mirror can never hang a render.
func ensureVale() string {
	if _, err := os.Stat(valePath()); err == nil {
		return valePath()
	}
	if os.Getenv("QUACK_NO_PULL") != "" {
		return ""
	}
	if runtime.GOOS != "windows" {
		return "" // the pull path is windows-first; other OS install vale on PATH themselves
	}
	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Get(valeURL())
	if err != nil || resp.StatusCode != 200 {
		return ""
	}
	defer resp.Body.Close()
	buf, err := io.ReadAll(resp.Body)
	if err != nil {
		return ""
	}
	zr, err := zip.NewReader(bytes.NewReader(buf), int64(len(buf)))
	if err != nil {
		return ""
	}
	os.MkdirAll(valeDir(), 0o755)
	for _, f := range zr.File {
		if filepath.Base(f.Name) != "vale.exe" {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			return ""
		}
		out, err := os.Create(valePath())
		if err != nil {
			rc.Close()
			return ""
		}
		io.Copy(out, rc)
		out.Close()
		rc.Close()
		return valePath()
	}
	return ""
}

// valeConfig writes the minimal deterministic config beside the binary (built-in Vale style).
func valeConfig() string {
	cfg := filepath.Join(valeDir(), ".vale.ini")
	os.MkdirAll(valeDir(), 0o755)
	os.WriteFile(cfg, []byte("MinAlertLevel = suggestion\n\n[*.md]\nBasedOnStyles = Vale\n"), 0o644)
	return cfg
}

// parseValeLines turns vale's line output into advisory strings naming the offending unit.
func parseValeLines(out string) []string {
	var adv []string
	for _, l := range strings.Split(strings.ReplaceAll(out, "\r\n", "\n"), "\n") {
		l = strings.TrimSpace(l)
		if l == "" || !strings.Contains(l, ":") {
			continue
		}
		adv = append(adv, "register: "+l)
	}
	sortStrings(adv)
	return adv
}

// registerAdvisories lints the prose sources (glossary, guidance, drafting prompt) when the
// linter is available; absence yields the single loud warning and an empty lane.
func registerAdvisories() []string {
	exe := ensureVale()
	if exe == "" {
		fmt.Fprintln(os.Stderr, "register: prose linter missing (vale pull failed) - prose quality is likely to suffer")
		return nil
	}
	targets := []string{
		filepath.Join(SPEC, "glossary"), // project content since go-spec-content
		filepath.Join(EngineDir(), "method", "guidance"),
		filepath.Join(EngineDir(), "method", "prompts", "draft.md"),
	}
	args := append([]string{"--config", valeConfig(), "--output", "line", "--no-exit"}, targets...)
	out, _ := exec.Command(exe, args...).Output()
	return parseValeLines(string(out))
}

// enddesign
