// The token and the repository a pull request opens on where the run names
// neither, as a cloud box holds them. [[spec/tickets/box-opens-its-pr]]
package branches

import "testing"

// An origin URL names its owner/name over https, ssh and a proxy path, with or without .git. [[spec/tickets/box-opens-its-pr]]
func TestAnOriginURLNamesItsRepository(t *testing.T) {
	t.Parallel()
	for url, want := range map[string]string{
		"https://github.com/owner/repo":            "owner/repo",
		"https://github.com/owner/repo.git\n":      "owner/repo",
		"github.com:owner/repo.git":                "owner/repo",
		"http://proxy@127.0.0.1:9/git/owner/repo/": "owner/repo",
		"":     "",
		"repo": "",
	} {
		if got := originRepo(url); got != want {
			t.Errorf("%q names %q, and %q stands", url, got, want)
		}
	}
}

// A pull request opens on PULL_TOKEN, else on GH_TOKEN, else on nothing. [[spec/tickets/box-opens-its-pr]]
func TestAPullRequestOpensOnPullTokenElseGhToken(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		pull, gh, want string
	}{{"pull", "gh", "pull"}, {"", "gh", "gh"}, {"", "", ""}} {
		d := &Doors{Env: map[string]string{"PULL_TOKEN": one.pull, "GH_TOKEN": one.gh}}
		if got := d.pullToken(); got != one.want {
			t.Errorf("PULL_TOKEN %q and GH_TOKEN %q answer %q, and %q stands", one.pull, one.gh, got, one.want)
		}
	}
}
