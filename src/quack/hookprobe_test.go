// The doctor's read of the hooks: the reader takes every address the settings
// files name, and the probe says which one answers.
// [[spec/design_output/level0#the-doctor-probes-every-hook]]
package main

import (
	"errors"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"testing"
	"time"
)

// A settings file naming one address, in the shape the client reads. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func hookSettings(url string) string {
	return `{"hooks":{"PreToolUse":[{"matcher":"*","hooks":[{"type":"http","url":"` + url + `"}]}]}}`
}

// Writes each file a case names under a folder. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func writeFiles(t *testing.T, folder string, files map[string]string) {
	t.Helper()
	for path, text := range files {
		at := filepath.Join(folder, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// A GET answering the addresses a case names, and standing dead for the rest. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func answeringGet(answers map[string]string) func(string, time.Duration) (string, error) {
	return func(where string, _ time.Duration) (string, error) {
		if said, ok := answers[where]; ok {
			return said, nil
		}
		return "", errors.New("fetch failed")
	}
}

// The addresses the reader found, in its order. [[spec/design_output/level0#the-doctor-probes-every-hook]]
func wheres(found []hookNamed) []string {
	var out []string
	for _, one := range found {
		out = append(out, one.where)
	}
	return out
}

func TestTheHookReaderTakesAnAddressOutOfEachOfTheThreeSettingsFiles(t *testing.T) {
	root, home := t.TempDir(), t.TempDir()
	writeFiles(t, root, map[string]string{
		settingsFile:      hookSettings("http://127.0.0.1:1/a"),
		settingsLocalFile: hookSettings("http://127.0.0.1:2/b"),
	})
	writeFiles(t, home, map[string]string{settingsFile: hookSettings("http://127.0.0.1:3/c")})
	found := hooksNamed(root, home)
	if got := wheres(found); !reflect.DeepEqual(got, []string{"http://127.0.0.1:1/a", "http://127.0.0.1:2/b", "http://127.0.0.1:3/c"}) {
		t.Errorf("the addresses read %v", got)
	}
	var files []string
	for _, one := range found {
		files = append(files, one.file)
	}
	if want := []string{settingsFile, settingsLocalFile, home + "/" + settingsFile}; !reflect.DeepEqual(files, want) {
		t.Errorf("the files read %v, want %v", files, want)
	}
}

func TestASettingsFileHoldingNoHooksStandingNowhereOrTornNamesNoAddress(t *testing.T) {
	for name, files := range map[string]map[string]string{
		"no hooks": {settingsFile: `{"permissions":{"allow":[]}}`},
		"nowhere":  {},
		"torn":     {settingsFile: "{"},
	} {
		root := t.TempDir()
		writeFiles(t, root, files)
		if found := hooksNamed(root, ""); len(found) != 0 {
			t.Errorf("%s names %v", name, found)
		}
	}
}

func TestACommandHookStandsOutsideTheAddresses(t *testing.T) {
	root := t.TempDir()
	writeFiles(t, root, map[string]string{settingsFile: `{"hooks":{"PreToolUse":[
		{"hooks":[{"type":"command","command":"C:\\hook.exe"}]},
		{"hooks":[{"type":"command","command":"/usr/bin/hook"}]},
		{"hooks":[{"type":"http","url":"http://127.0.0.1:1/a"}]}]}}`})
	if got := wheres(hooksNamed(root, "")); !reflect.DeepEqual(got, []string{"http://127.0.0.1:1/a"}) {
		t.Errorf("the addresses read %v", got)
	}
}

func TestTwoFilesNamingOneAddressNameItOnceOffTheFileReadingFirst(t *testing.T) {
	root := t.TempDir()
	writeFiles(t, root, map[string]string{
		settingsFile:      hookSettings("http://127.0.0.1:1/a"),
		settingsLocalFile: hookSettings("http://127.0.0.1:1/a"),
	})
	found := hooksNamed(root, "")
	if len(found) != 1 || found[0].file != settingsFile {
		t.Errorf("the reader finds %v", found)
	}
}

func TestTheAddressReadsAsABrowserWritesIt(t *testing.T) {
	for said, want := range map[string]string{
		"http://127.0.0.1:1/a":  "http://127.0.0.1:1/a",
		"HTTP://Host:80":        "http://host/",
		"https://host:443/x":    "https://host/x",
		"ftp://host/x":          "",
		"/usr/bin/hook":         "",
		"C:\\hook.exe":          "",
		"just words, no scheme": "",
	} {
		if got := addressOf(said); got != want {
			t.Errorf("addressOf(%q) = %q, want %q", said, got, want)
		}
	}
}

func TestAHookAnsweringStandsAndOneAnsweringNothingWarns(t *testing.T) {
	d, _, _, _ := fakeBoxDoors(t)
	where := "http://127.0.0.1:36368/hook"
	d.get = answeringGet(map[string]string{where: ""})
	rows := hookRows(d, []hookNamed{{where, settingsLocalFile}})
	if rows[0] != [2]string{"hook 127.0.0.1:36368", "stands at " + where + ", off .claude/settings.local.json"} {
		t.Errorf("the answering row reads %v", rows)
	}
	d.get = answeringGet(nil)
	rows = hookRows(d, []hookNamed{{where, settingsLocalFile}})
	if rows[0][1] != "warn: answers nothing at "+where+", off .claude/settings.local.json" {
		t.Errorf("the dead row reads %v", rows)
	}
}

func TestAHookAnsweringAFailingStatusStands(t *testing.T) {
	d, _, _, _ := fakeBoxDoors(t)
	where := "http://127.0.0.1:36368/hook"
	// The real GET answers a 500 with its body and no error, so the fake does the same. [[spec/design_output/level0#the-doctor-probes-every-hook]]
	d.get = answeringGet(map[string]string{where: "Internal Server Error"})
	if rows := hookRows(d, []hookNamed{{where, settingsFile}}); !strings.HasPrefix(rows[0][1], "stands at") {
		t.Errorf("the row reads %v", rows)
	}
}

func TestTheProbeAsksEveryAddressTogether(t *testing.T) {
	d, _, _, _ := fakeBoxDoors(t)
	var mu sync.Mutex
	var asked []string
	second := make(chan struct{})
	d.get = func(where string, _ time.Duration) (string, error) {
		mu.Lock()
		asked = append(asked, where)
		count := len(asked)
		mu.Unlock()
		if count == 2 {
			close(second)
		} else {
			select {
			case <-second:
			case <-time.After(5 * time.Second):
				return "", errors.New("the second call never came")
			}
		}
		return "", errors.New("fetch failed")
	}
	rows := hookRows(d, []hookNamed{{"http://127.0.0.1:1/a", "a"}, {"http://127.0.0.1:2/b", "b"}})
	if len(rows) != 2 || len(asked) != 2 {
		t.Fatalf("the probe asks %v and answers %v", asked, rows)
	}
	for _, row := range rows {
		if strings.Contains(row[1], "never came") || !strings.HasPrefix(row[1], "warn") {
			t.Errorf("a call waited alone: %v", row)
		}
	}
}

func TestTheHookRowsComeBackInTheOrderTheReaderNamesThem(t *testing.T) {
	d, _, _, _ := fakeBoxDoors(t)
	d.get = answeringGet(map[string]string{"http://127.0.0.1:2/b": ""})
	rows := hookRows(d, []hookNamed{{"http://127.0.0.1:1/a", "a"}, {"http://127.0.0.1:2/b", "b"}})
	if rows[0][0] != "hook 127.0.0.1:1" || rows[1][0] != "hook 127.0.0.1:2" || !strings.HasPrefix(rows[0][1], "warn") || !strings.HasPrefix(rows[1][1], "stands at") {
		t.Errorf("the rows read %v", rows)
	}
	if rows := hookRows(d, nil); len(rows) != 0 {
		t.Errorf("a box naming no hook reads %v", rows)
	}
}
