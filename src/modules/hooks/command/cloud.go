// Whether the environment says this box runs in the cloud: either variable
// reads true, and a flat value reads false.
// [[spec/guidance/cloud/cloud]]
package command

// The variables saying the box stands in the cloud. [[spec/guidance/cloud/cloud]]
var CloudVariables = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// Whether either variable reads true. A stub until implement lands the read. [[spec/tickets/cage-libs-leave]]
func InCloud(get func(string) string) bool { return false }
