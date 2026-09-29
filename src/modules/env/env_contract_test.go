//go:build contract

// The contract of env: every variable it answers starts with SE_, on the fake
// and on the real environment.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package env

import (
	"strings"
	"testing"
)

func envSuite(t *testing.T, one Env, want string) {
	said := one.Variables()
	for name := range said {
		if !strings.HasPrefix(name, "SE_") {
			t.Fatalf("the env answers %s", name)
		}
	}
	if said["SE_CONTRACT"] != want {
		t.Fatalf("SE_CONTRACT reads %q", said["SE_CONTRACT"])
	}
}

func TestEnvKeepsItsContract(t *testing.T) {
	t.Run("fake", func(t *testing.T) { envSuite(t, FakeEnv{"SE_CONTRACT": "held", "PATH": "x"}, "held") })
	t.Run("real", func(t *testing.T) {
		t.Setenv("SE_CONTRACT", "held")
		envSuite(t, New(), "held")
	})
}
