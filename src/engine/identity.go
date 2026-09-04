package main

import (
	"os"
	"regexp"
	"strings"
)

// IDENTITY MATERIAL DOES NOT TRAVEL. Rule 13 names names, datetimes and
// unfiltered notes, and two of the three need no list.
//
// THE RULING, IN THE OWNER'S WORDS: no date in prose that travels. Where a time
// is needed, a month and a year. A machine field that needs a stamp keeps it,
// because a claim is compared against a clock. And .se is where what does not
// travel lives, so a write there is left alone.
//
// A PERSONAL NAME NEEDS A LIST and is not here. The list would itself be
// identity material, so it lives under .se, and that is its own piece of work.

var (
	// A DAY PINS A PERSON TO A DESK. A month and a year does not, which is why
	// the ruling allows one and refuses the other.
	//
	// THE DAY ENDS ON A BOUNDARY OR ON A T. A word boundary alone missed every
	// ISO datetime, because the T after the day is a word character and there is
	// no boundary there. The stamps this refuses are mostly datetimes.
	anISODate = regexp.MustCompile(`\b\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?:\b|T)`)

	// A CLOCK IS ONLY A CLOCK WITH ITS SECONDS. 16:9 is a ratio and 1:4 is a
	// rate, so the shorter form would refuse prose that carries no time at all.
	aClock = regexp.MustCompile(`\b([01]?\d|2[0-3]):[0-5]\d:[0-5]\d\b`)

	// A DAY BESIDE A MONTH NAME, in either order, is the same day in words.
	aWrittenDay = regexp.MustCompile(`(?i)\b(\d{1,2}(st|nd|rd|th)?\s+(` + theMonths + `)|(` +
		theMonths + `)\s+\d{1,2}(st|nd|rd|th)?\b(?:\s*,?\s*\d{4})?)`)

	// A YAML KEY LINE IS A MACHINE FIELD, and a machine field keeps its stamp.
	aKeyLine = regexp.MustCompile(`^\s*[a-z][a-z0-9_]*:\s`)
)

const theMonths = `january|february|march|april|may|june|july|august|september|october|november|december`

// identityMaterial answers the first rule a piece of prose breaks, the text it
// matched, and whether it broke one at all.
//
// IT TAKES THE USERNAME RATHER THAN READING IT, so a table can drive a machine
// this one is not. TheUsername answers this machine.
func identityMaterial(content, user string) (rule, matched string, found bool) {
	prose := theProseIn(content)
	for _, one := range []struct {
		says string
		re   *regexp.Regexp
	}{
		{"a datetime", anISODate},
		{"a datetime", aClock},
		{"a datetime", aWrittenDay},
	} {
		if m := one.re.FindString(prose); m != "" {
			return one.says, m, true
		}
	}
	// A SHORT NAME IS NOT MATCHED AT ALL. An empty one sits in every gap between
	// words, and a two-letter one matches MB, so a guard built on it would refuse
	// a size in megabytes. A name that short cannot be told from ordinary prose.
	if len(user) >= 3 {
		// CASE MATTERS, because a name is written the way its owner writes it and
		// the shouted form is usually a word.
		name := regexp.MustCompile(`(^|[^A-Za-z0-9])` + regexp.QuoteMeta(user) + `([^A-Za-z0-9]|$)`)
		if m := name.FindString(prose); m != "" {
			return "a username", strings.TrimSpace(m), true
		}
	}
	return "", "", false
}

// theProseIn drops what a machine wrote and answers what a person did.
//
// A FRONTMATTER BLOCK GOES WHOLE, and so does any line that is a YAML key,
// because a write often arrives as a fragment with no block around it. began,
// ended and claimed_at all carry stamps that a claim is compared against.
func theProseIn(content string) string {
	lines := strings.Split(content, "\n")
	start := 0
	if len(lines) > 0 && strings.TrimRight(lines[0], "\r") == "---" {
		for i := 1; i < len(lines); i++ {
			if strings.TrimRight(lines[i], "\r") == "---" {
				start = i + 1
				break
			}
		}
	}
	var out []string
	for _, line := range lines[start:] {
		if aKeyLine.MatchString(line) {
			continue
		}
		out = append(out, line)
	}
	return strings.Join(out, "\n")
}

// TheUsername answers who is logged in on this machine, or nothing where the
// environment does not say.
func TheUsername() string {
	for _, name := range []string{"USERNAME", "USER", "LOGNAME"} {
		if v := strings.TrimSpace(os.Getenv(name)); v != "" {
			return v
		}
	}
	return ""
}
