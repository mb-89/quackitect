// Whether the environment says this box runs in the cloud: either variable
// reads true, and a flat value reads false.
// [[spec/guidance/cloud/cloud]]
package command

import "strings"

// The variables saying the box stands in the cloud. [[spec/guidance/cloud/cloud]]
var CloudVariables = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// Whether either variable reads true. [[spec/guidance/cloud/cloud]]
func InCloud(get func(string) string) bool {
	for _, name := range CloudVariables {
		said := strings.ToLower(strings.TrimSpace(get(name)))
		if said != "" && said != "0" && said != "false" {
			return true
		}
	}
	return false
}
