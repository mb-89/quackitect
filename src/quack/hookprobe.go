// The doctor's hook probe: every hook address the settings files name, and
// whether each one answers.
// [[spec/design_output/level0#the-doctor-probes-every-hook]]
package main

import (
	"net/url"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// The settings files the client reads, and the span a hook or the server takes to answer. [[spec/design_output/level0#the-doctor-probes-every-hook]]
const (
	settingsFile      = ".claude/settings.json"       // the file .claude/skills/level0/lib/vehicle.js owns, as SETTINGS
	settingsLocalFile = ".claude/settings.local.json" // the file .claude/skills/level0/lib/vehicle.js owns, as SETTINGS_LOCAL
	healthWait        = 2 * time.Second               // the span src/scripts/cli-doors.js owns, as HEALTH_WAIT
)

// One hook address, and the settings file naming it first. [[spec/design_output/level0#the-doctor-probes-every-hook]]
type hookNamed struct {
	where, file string
}

// One settings file: where it stands, and the name a reader sees. [[spec/design_output/level0#the-doctor-probes-every-hook]]
type settingsAt struct {
	at, name string
}

// The three settings files the client reads, the tree's own first; the name joins with a slash on every box, and the path the way the box does. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func settingsFiles(root, home string) []settingsAt {
	rows := []settingsAt{
		{filepath.Join(root, filepath.FromSlash(settingsFile)), settingsFile},
		{filepath.Join(root, filepath.FromSlash(settingsLocalFile)), settingsLocalFile},
	}
	if home != "" {
		rows = append(rows, settingsAt{filepath.Join(home, filepath.FromSlash(settingsFile)), home + "/" + settingsFile})
	}
	return rows
}

// The address a string names where it parses as an http or https URL, written as a browser writes it, and nothing otherwise. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func addressOf(said string) string {
	found, err := url.Parse(said)
	if err != nil || (found.Scheme != "http" && found.Scheme != "https") || found.Host == "" {
		return ""
	}
	found.Scheme = strings.ToLower(found.Scheme)
	found.Host = strings.ToLower(found.Host)
	if port := found.Port(); (found.Scheme == "http" && port == "80") || (found.Scheme == "https" && port == "443") {
		found.Host = found.Hostname()
	}
	if found.Path == "" {
		found.Path = "/"
	}
	return found.String()
}

// Every string a settings tree holds, whatever key carries it, in the order it stands. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func stringsIn(said any, out []string) []string {
	switch one := said.(type) {
	case string:
		out = append(out, one)
	case []any:
		for _, each := range one {
			out = stringsIn(each, out)
		}
	case *ordered:
		for _, key := range one.keys {
			out = stringsIn(one.values[key], out)
		}
	}
	return out
}

// Every hook address the settings files name, in reading order, each off the file naming it first. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func hooksNamed(disk diskDoors, root, home string) []hookNamed {
	var found []hookNamed
	seen := map[string]bool{}
	for _, file := range settingsFiles(root, home) {
		body, err := disk.read(file.at)
		text := string(body)
		if err != nil {
			continue
		}
		said, err := orderedOf(text)
		top, isObject := said.(*ordered)
		if err != nil || !isObject {
			continue
		}
		for _, one := range stringsIn(top.values["hooks"], nil) {
			if where := addressOf(one); where != "" && !seen[where] {
				seen[where] = true
				found = append(found, hookNamed{where: where, file: file.name})
			}
		}
	}
	return found
}

// One row a hook, off calls the probe runs together, so a box of dead hooks answers inside the first minute. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func hookRows(d boxDoors, found []hookNamed) [][2]string {
	rows := make([][2]string, len(found))
	var all sync.WaitGroup
	for at, one := range found {
		all.Add(1)
		go func() {
			defer all.Done()
			rows[at] = hookRow(d, one)
		}()
	}
	all.Wait()
	return rows
}

// The row of one hook: any answer, a failing status among them, proves it listens. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func hookRow(d boxDoors, one hookNamed) [2]string {
	host := one.where
	if found, err := url.Parse(one.where); err == nil {
		host = found.Host
	}
	label := "hook " + host
	if _, err := d.get(one.where, healthWait); err != nil {
		return [2]string{label, "warn: answers nothing at " + one.where + ", off " + one.file}
	}
	return [2]string{label, "stands at " + one.where + ", off " + one.file}
}
