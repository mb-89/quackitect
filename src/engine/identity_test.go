package main

import "testing"

// IDENTITY MATERIAL DOES NOT TRAVEL, and two of its three classes need no list.
//
// The ruling is that no date goes into prose that travels. Where a time is
// needed, a month and a year. A machine field keeps its stamp, because a claim
// is compared against a clock, and .se is where what does not travel lives.
//
// THE TABLE IS THE RULE. Each row is a write and what the door does with it. A
// row that is taken matters as much as one that is refused: a check that proves
// only refusals is one that would pass if everything were refused.
func TestIdentityMaterialIsRefused(t *testing.T) {
	const user = "someuser"
	for _, one := range []struct {
		what    string
		writes  string
		refused bool
		rule    string
	}{
		{
			what:    "an ISO date in prose",
			writes:  "The battery ran on 2026-09-04 and answered six failed.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "an ISO datetime in prose",
			writes:  "It was gone at 2026-09-04T17:03:57Z, and nothing said so.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "a clock with seconds",
			writes:  "The engine refused it at 17:04:40 and took it after.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "a day beside a month name",
			writes:  "Counted on 2 September by hand.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "a month name beside a day",
			writes:  "Counted on September 2 by hand.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "a lower-case month beside a day, carrying a year",
			writes:  "Counted on 2 september 2026 by hand.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "a lower-case month beside an ordinal day",
			writes:  "Counted on 2nd september by hand.",
			refused: true, rule: "a datetime",
		},
		{
			what:   "a month name that is an ordinary word, read as one",
			writes: "The queue held 12 may be more than the box can run.",
		},
		{
			what:   "another month name read as a verb",
			writes: "It found 3 march past the gate and counted none.",
		},
		{
			what:   "a month and a year, which is the ruling's own answer",
			writes: "The rewrite landed in September 2026 and holds.",
		},
		{
			what:   "a year on its own",
			writes: "The tree was started in 2026.",
		},
		{
			what:   "a ratio, which is not a clock",
			writes: "The panel draws at 16:9 and the page does not scroll.",
		},
		{
			what:   "a machine field carrying a stamp",
			writes: "claimed_at: 2026-09-04T17:00:00Z",
		},
		{
			what: "a frontmatter block carrying stamps",
			writes: "---\nkind: work-token\nclaimed_at: 2026-09-04T17:00:00Z\n---\n\n" +
				"The hold stands and the walker left it where it was.",
		},
		{
			what:    "a date in the body under a frontmatter block",
			writes:  "---\nkind: work-token\n---\n\nMeasured on 2026-09-04, six failed.",
			refused: true, rule: "a datetime",
		},
		{
			what:    "this machine's own username",
			writes:  "someuser ran it and the answer came back.",
			refused: true, rule: "a username",
		},
		{
			what:    "a path carrying the username",
			writes:  `LookPath answered C:\Users\someuser\AppData\bash.exe`,
			refused: true, rule: "a username",
		},
		{
			what:   "a longer word the username sits inside",
			writes: "The someuserly thing to do is to say so.",
		},
		{
			what:   "prose with neither",
			writes: "The shell lookup passes over a launcher and walks on.",
		},
	} {
		rule, matched, found := identityMaterial(one.writes, user)
		if found != one.refused {
			t.Errorf("%s: refused is %v and should be %v, matching %q as %q",
				one.what, found, one.refused, matched, rule)
			continue
		}
		if found && rule != one.rule {
			t.Errorf("%s: the rule is %q and should be %q", one.what, rule, one.rule)
		}
		if found && matched == "" {
			t.Errorf("%s: refused and named nothing it matched", one.what)
		}
	}
}

// A SHORT OR EMPTY USERNAME MATCHES NOTHING. An empty name matches every gap
// between words. A two-letter one matches MB, and a guard that refuses a size
// in megabytes is one somebody turns off.
func TestAShortUsernameRefusesNothing(t *testing.T) {
	for _, user := range []string{"", "mb"} {
		if rule, matched, found := identityMaterial("the log grew by 20 MB, so mb", user); found {
			t.Errorf("the username %q matched %q as %q", user, matched, rule)
		}
	}
}
