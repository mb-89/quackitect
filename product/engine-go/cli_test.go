package main

import "testing"

func TestHelpRequested(t *testing.T) {
	// the bug: 'quack start --help' must be help, not a version id.
	if !helpRequested([]string{"start", "--help"}) {
		t.Fatal("start --help should be help")
	}
	for _, f := range []string{"-h", "--help", "-?"} {
		if !helpRequested([]string{"status", f}) {
			t.Fatalf("%s should be help", f)
		}
	}
	if helpRequested([]string{"status", "some-id"}) {
		t.Fatal("plain args are not help")
	}
}

func TestBadIDArg(t *testing.T) {
	if _, bad := badIDArg("start", []string{"-xyz"}); !bad {
		t.Fatal("start -xyz should be rejected")
	}
	if _, bad := badIDArg("bless", []string{"--all"}); bad {
		t.Fatal("bless --all is valid, not a bad id")
	}
	if _, bad := badIDArg("status", []string{"i3-m1-gate"}); bad {
		t.Fatal("a normal id is fine")
	}
}
