// The browser the drawing's test drives: the setup asks here, and a path
// answers that a browser stands. The order stands in
// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]].
package main

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// The names a browser answers to on the PATH, in the order the path asks them. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
var browserCalls = []string{"chromium", "chromium-browser", "google-chrome", "chrome"}

// Where a Playwright folder keeps the binary, one layout a platform. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
var browserInside = [][]string{
	{"chrome-linux", "chrome"},
	{"chrome-linux64", "chrome"},
	{"chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"},
	{"chrome-win", "chrome.exe"},
	{"chrome-win64", "chrome.exe"},
}

var browserBuild = regexp.MustCompile(`^chromium-(\d+)$`)

// The folder `playwright install` writes where no variable names one. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserCache(env func(string) string, mac bool) string {
	if local := env("LOCALAPPDATA"); local != "" {
		return filepath.Join(local, "ms-playwright")
	}
	home := homeOf(env)
	switch {
	case home == "":
		return ""
	case mac:
		return filepath.Join(home, "Library", "Caches", "ms-playwright")
	}
	return filepath.Join(home, ".cache", "ms-playwright")
}

// The newest chromium a Playwright folder holds, or nothing. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserUnder(folder string) string {
	if folder == "" {
		return ""
	}
	listed, err := os.ReadDir(folder)
	if err != nil {
		return ""
	}
	type build struct {
		name   string
		number int
	}
	var builds []build
	for _, one := range listed {
		if found := browserBuild.FindStringSubmatch(one.Name()); found != nil {
			number, _ := strconv.Atoi(found[1])
			builds = append(builds, build{one.Name(), number})
		}
	}
	sort.SliceStable(builds, func(a, b int) bool { return builds[a].number > builds[b].number })
	for _, one := range builds {
		for _, rest := range browserInside {
			if at := filepath.Join(append([]string{folder, one.name}, rest...)...); stands(at) {
				return at
			}
		}
	}
	return ""
}

// Where a call stands on the PATH, a Windows box trying the exe ending too. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserOnPath(call string, env func(string) string) string {
	windows := env("PATHEXT") != ""
	said := env("PATH")
	if said == "" {
		said = env("Path")
	}
	split, endings := ":", []string{""}
	if windows {
		split, endings = ";", []string{"", ".exe"}
	}
	for _, folder := range strings.Split(said, split) {
		if folder == "" {
			continue
		}
		for _, ending := range endings {
			if at := filepath.Join(folder, call+ending); stands(at) {
				return at
			}
		}
	}
	return ""
}

// The first browser the order finds, with the rung that found it, or two empty strings. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserFrom(env func(string) string, mac bool) (path, from string) {
	if named := env("PLAYWRIGHT_CHROMIUM"); named != "" && stands(named) {
		return named, "PLAYWRIGHT_CHROMIUM"
	}
	if at := browserUnder(env("PLAYWRIGHT_BROWSERS_PATH")); at != "" {
		return at, "PLAYWRIGHT_BROWSERS_PATH"
	}
	for _, call := range browserCalls {
		if at := browserOnPath(call, env); at != "" {
			return at, "PATH"
		}
	}
	if at := browserUnder(browserCache(env, mac)); at != "" {
		return at, "playwright install"
	}
	return "", ""
}
