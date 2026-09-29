// The box names the owner, and nothing private travels. Every check reads
// strings alone, so a caller hands the names in.
// [[spec/design_output/private#the-box-names-the-owner]]
package check

import (
	"regexp"
	"strings"
)

// [[spec/design_output/private#the-box-names-the-owner]]
var nobody = map[string]bool{
	"user": true, "root": true, "one": true, "somebody": true, "nobody": true,
	"agent": true, "claude": true, "runner": true, "ubuntu": true, "vscode": true,
}

func namesAPerson(said string) bool {
	name := strings.TrimSpace(said)
	if name == "" {
		return false
	}
	return !nobody[strings.ToLower(name)]
}

// [[spec/design_output/private#the-box-names-the-owner]]
func carriesTheName(line, name string) bool {
	if name == "" {
		return false
	}
	found, err := regexp.Compile(`(^|[^A-Za-z0-9])` + regexp.QuoteMeta(name) + `([^A-Za-z0-9]|$)`)
	if err != nil {
		return false
	}
	return found.MatchString(line)
}

func homeNames(home string) bool {
	parts := []string{}
	for _, one := range strings.Split(slashed(home), "/") {
		if one != "" {
			parts = append(parts, one)
		}
	}
	if len(parts) == 0 {
		return false
	}
	return namesAPerson(parts[len(parts)-1])
}
