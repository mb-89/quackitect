// The browser the drawing's test drives, off a tree on the fake disk: a
// Windows path, and the downloads folder last.
// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"testing"
)

// A fake disk holding an empty file at each path under the tree, and the env a case names, each path under the tree. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserBox(t *testing.T, paths []string, env map[string]string) (string, func(string) string, diskDoors) {
	t.Helper()
	root, disk := "/tree", newFakeDisk()
	files := map[string]string{}
	for _, one := range paths {
		files[one] = ""
	}
	hq1SeedDisk(t, disk, root, files)
	at := map[string]string{}
	for key, value := range env {
		at[key] = value
		if value != "" && key != "PATHEXT" {
			at[key] = filepath.Join(root, value)
		}
	}
	return root, func(key string) string { return at[key] }, disk
}

func TestAWindowsPathSplitsOnSemicolonsAndTriesTheExeEnding(t *testing.T) {
	t.Parallel()
	root, env, disk := browserBox(t, []string{"w/chrome.exe"}, map[string]string{"Path": "w", "PATHEXT": ".EXE"})
	if at, from := browserFrom(disk, env, false); at != filepath.Join(root, "w", "chrome.exe") || from != "PATH" {
		t.Errorf("the order answers %s off %s", at, from)
	}
}

func TestTheFolderTheDownloadWritesAnswersLast(t *testing.T) {
	t.Parallel()
	root, env, disk := browserBox(t, []string{"home/Library/Caches/ms-playwright/chromium-3/chrome-mac/Chromium.app/Contents/MacOS/Chromium"}, map[string]string{"HOME": "home"})
	if at, _ := browserFrom(disk, env, true); at != filepath.Join(root, "home", "Library", "Caches", "ms-playwright", "chromium-3", "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium") {
		t.Errorf("a mac answers %s", at)
	}
}

