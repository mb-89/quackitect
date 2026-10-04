// The browser the drawing's test drives, off a temporary tree, so each rung of
// the order answers alone.
// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
package main

import (
	"path/filepath"
	"testing"
)

// A tree holding an empty file at each path, and the env a case names, each path under the tree. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserBox(t *testing.T, paths []string, env map[string]string) (string, func(string) string) {
	t.Helper()
	root := t.TempDir()
	files := map[string]string{}
	for _, one := range paths {
		files[one] = ""
	}
	seedTree(t, root, files)
	at := map[string]string{}
	for key, value := range env {
		at[key] = value
		if value != "" && key != "PATHEXT" {
			at[key] = filepath.Join(root, value)
		}
	}
	return root, func(key string) string { return at[key] }
}

func TestTheVariableNamingAFileWinsOverEveryOtherRung(t *testing.T) {
	root, env := browserBox(t,
		[]string{"x/chrome", "pw/chromium-1/chrome-linux/chrome", "bin/chromium", "home/.cache/ms-playwright/chromium-7/chrome-linux/chrome"},
		map[string]string{"PLAYWRIGHT_CHROMIUM": "x/chrome", "PLAYWRIGHT_BROWSERS_PATH": "pw", "PATH": "bin", "HOME": "home"})
	if path, from := browserFrom(env, false); path != filepath.Join(root, "x", "chrome") || from != "PLAYWRIGHT_CHROMIUM" {
		t.Errorf("the order answers %s off %s", path, from)
	}
}

func TestAVariableNamingNoFileFallsToTheBrowsersFolderNewestBuildFirst(t *testing.T) {
	root, env := browserBox(t,
		[]string{"pw/chromium-9/chrome-linux/chrome", "pw/chromium-12/chrome-linux/chrome", "pw/chromium_headless_shell-12/chrome-linux/headless_shell"},
		map[string]string{"PLAYWRIGHT_CHROMIUM": "gone", "PLAYWRIGHT_BROWSERS_PATH": "pw"})
	if path, from := browserFrom(env, false); path != filepath.Join(root, "pw", "chromium-12", "chrome-linux", "chrome") || from != "PLAYWRIGHT_BROWSERS_PATH" {
		t.Errorf("the order answers %s off %s", path, from)
	}
}

func TestThePathAnswersInTheOrderTheCallsNameBeforeTheDownloadsFolder(t *testing.T) {
	root, env := browserBox(t,
		[]string{"b/google-chrome", "a/chromium-browser", "home/.cache/ms-playwright/chromium-7/chrome-linux/chrome"},
		map[string]string{"HOME": "home"})
	path := filepath.Join(root, "a") + ":" + filepath.Join(root, "b")
	withPath := func(key string) string {
		if key == "PATH" {
			return path
		}
		return env(key)
	}
	if at, from := browserFrom(withPath, false); at != filepath.Join(root, "a", "chromium-browser") || from != "PATH" {
		t.Errorf("the order answers %s off %s", at, from)
	}
}

func TestAWindowsPathSplitsOnSemicolonsAndTriesTheExeEnding(t *testing.T) {
	root, env := browserBox(t, []string{"w/chrome.exe"}, map[string]string{"Path": "w", "PATHEXT": ".EXE"})
	if at, from := browserFrom(env, false); at != filepath.Join(root, "w", "chrome.exe") || from != "PATH" {
		t.Errorf("the order answers %s off %s", at, from)
	}
}

func TestTheFolderTheDownloadWritesAnswersLast(t *testing.T) {
	root, env := browserBox(t, []string{"home/.cache/ms-playwright/chromium-7/chrome-linux/chrome"}, map[string]string{"PATH": "a", "HOME": "home"})
	if at, from := browserFrom(env, false); at != filepath.Join(root, "home", ".cache", "ms-playwright", "chromium-7", "chrome-linux", "chrome") || from != "playwright install" {
		t.Errorf("the order answers %s off %s", at, from)
	}
	root, env = browserBox(t, []string{"home/Library/Caches/ms-playwright/chromium-3/chrome-mac/Chromium.app/Contents/MacOS/Chromium"}, map[string]string{"HOME": "home"})
	if at, _ := browserFrom(env, true); at != filepath.Join(root, "home", "Library", "Caches", "ms-playwright", "chromium-3", "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium") {
		t.Errorf("a mac answers %s", at)
	}
}

func TestABoxWithNoBrowserAnswersNothing(t *testing.T) {
	_, env := browserBox(t, nil, map[string]string{"PATH": "a", "HOME": "home"})
	if at, from := browserFrom(env, false); at != "" || from != "" {
		t.Errorf("the order answers %s off %s", at, from)
	}
	if browserUnder("") != "" {
		t.Error("an empty folder answers a browser")
	}
}

func TestTheCacheFolderReadsTheHomeFolderTheOneReaderNames(t *testing.T) {
	envOf := func(pairs map[string]string) func(string) string {
		return func(key string) string { return pairs[key] }
	}
	home := "/home/one"
	if got := browserCache(envOf(map[string]string{"USERPROFILE": home}), false); got != filepath.Join(home, ".cache", "ms-playwright") {
		t.Errorf("USERPROFILE answers %s", got)
	}
	if got := browserCache(envOf(map[string]string{"HOME": "", "USERPROFILE": home}), false); got != filepath.Join(home, ".cache", "ms-playwright") {
		t.Errorf("an empty HOME answers %s", got)
	}
	if got := browserCache(envOf(map[string]string{"LOCALAPPDATA": "/local", "HOME": home}), false); got != filepath.Join("/local", "ms-playwright") {
		t.Errorf("LOCALAPPDATA answers %s", got)
	}
	if got := browserCache(envOf(nil), false); got != "" {
		t.Errorf("no home answers %s", got)
	}
}
