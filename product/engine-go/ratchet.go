package main

import (
	"fmt"
	"time"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// design: go-global-ratchet  implements: req-global-binary, req-engine-ratchet
// ONE global binary serves every workspace (adr-global-ratchet): it lives at
// <userDataBase>/quackitect/bin/<brand>.exe; the launcher stays dumb — fixed path, existence check,
// bootstrap build from the workspace's vendored engine source when absent. The RATCHET is the
// engine's own startup self-check: if the workspace's vendored .go source is newer than the running
// binary, the engine rebuilds the global binary from that source, swaps itself via the rename dance
// (spiked at i9 M5: rename the running exe aside — legal on NTFS — move the fresh build in, sweep
// the parked .old on a later run) and re-execs. Newer binary than source: runs as-is, forward-only,
// no versioned slots, no downgrade path (the owner's ratchet rule, 2026-07-04). A missing Go
// toolchain degrades gracefully: warn and run the current binary.
func globalBinPath() string {
	return filepath.Join(userDataBase(), "quackitect", "bin", brand()+".exe")
}

func ratchetNeeded(binTime, srcTime int64) bool { return srcTime > binTime }

func newestGoMtime(dir string) int64 {
	var newest int64
	filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err == nil && !fi.IsDir() && strings.HasSuffix(path, ".go") {
			if t := fi.ModTime().Unix(); t > newest {
				newest = t
			}
		}
		return nil
	})
	return newest
}

// replaceExe swaps target with staged via the rename dance; the parked .old stays for a later sweep.
// Retried briefly: a freshly-written binary is often held for a moment by AV scanning (seen live at
// i9 M6); a persistent failure falls back to build-next-launch (the M4 kill-criterion's fallback) —
// callers leave .staged in place and ratchetMaybe adopts it on the next start.
func replaceExe(target, staged string) error {
	var err error
	for attempt := 0; attempt < 5; attempt++ {
		if attempt > 0 {
			time.Sleep(120 * time.Millisecond)
		}
		old := target + ".old"
		os.Remove(old)
		if err = os.Rename(target, old); err != nil {
			continue
		}
		if err = os.Rename(staged, target); err != nil {
			os.Rename(old, target) // roll back
			continue
		}
		return nil
	}
	return err
}

// sweepOldBinaries removes parked *.old leftovers; returns how many went (locked ones stay).
func sweepOldBinaries(dir string) int {
	n := 0
	matches, _ := filepath.Glob(filepath.Join(dir, "*.old"))
	for _, m := range matches {
		if os.Remove(m) == nil {
			n++
		}
	}
	return n
}

// ratchetMaybe is the startup self-check. Guarded against re-exec loops via QUACK_RATCHETED.
func ratchetMaybe() {
	if os.Getenv("QUACK_RATCHETED") == "1" {
		return
	}
	exe, err := os.Executable()
	if err != nil {
		return
	}
	sweepOldBinaries(filepath.Dir(exe))
	if st, serr := os.Stat(exe + ".staged"); serr == nil && !st.IsDir() {
		// a build that could not swap parked its result; adopt it now (build-next-launch)
		if replaceExe(exe, exe+".staged") == nil {
			re := exec.Command(exe, os.Args[1:]...)
			re.Stdin, re.Stdout, re.Stderr = os.Stdin, os.Stdout, os.Stderr
			re.Env = append(os.Environ(), "QUACK_RATCHETED=1")
			if err := re.Run(); err != nil {
				if x, ok := err.(*exec.ExitError); ok {
					os.Exit(x.ExitCode())
				}
				os.Exit(1)
			}
			os.Exit(0)
		}
	}
	src := EngineSrc()
	if st, err := os.Stat(src); err != nil || !st.IsDir() {
		return // no vendored source in reach — nothing to ratchet against
	}
	fi, err := os.Stat(exe)
	if err != nil || !ratchetNeeded(fi.ModTime().Unix(), newestGoMtime(src)) {
		return
	}
	staged := exe + ".staged"
	cmd := exec.Command("go", "build", "-o", staged, ".")
	cmd.Dir = src
	if out, err := cmd.CombinedOutput(); err != nil {
		fmt.Fprintln(os.Stderr, "ratchet: vendored source is newer but the rebuild failed — running the current binary.")
		if len(out) > 0 {
			fmt.Fprintln(os.Stderr, strings.TrimSpace(string(out)))
		}
		return
	}
	if err := replaceExe(exe, staged); err != nil {
		os.Remove(staged)
		fmt.Fprintln(os.Stderr, "ratchet: swap failed —", err)
		return
	}
	re := exec.Command(exe, os.Args[1:]...)
	re.Stdin, re.Stdout, re.Stderr = os.Stdin, os.Stdout, os.Stderr
	re.Env = append(os.Environ(), "QUACK_RATCHETED=1")
	if err := re.Run(); err != nil {
		if x, ok := err.(*exec.ExitError); ok {
			os.Exit(x.ExitCode())
		}
		os.Exit(1)
	}
	os.Exit(0)
}

// enddesign
