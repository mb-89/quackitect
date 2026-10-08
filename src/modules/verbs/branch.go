// The branch verbs: every verb work in work.js answers, each standing as an
// action through the node module.
// [[spec/tickets/work-verbs-become-actions]]
package verbs

// Every verb the work program answers, from open to test. [[spec/tickets/work-verbs-become-actions]]
var BranchVerbs = []Verb{
	{Name: "open", Doc: "pushes work/<group> off main for a group ticket, so the cloud finds it"},
	{Name: "take", Doc: "takes the next branch marked todo, and prints its ask"},
	{Name: "sync", Doc: "takes main into this branch before the work starts"},
	{Name: "done", Doc: "marks this branch done, commits and pushes"},
	{Name: "release", Doc: "puts this branch, or the one named, back to todo"},
	{Name: "merge", Doc: "takes a done branch into main"},
	{Name: "close", Doc: "deletes a branch already inside main, or every one"},
	{Name: "read", Doc: "prints what stands on work/<name>"},
	{Name: "review", Doc: "gathers what a reader needs, and answers the report"},
	{Name: "list", Doc: "what stands open, everything, the done ones, the pull's order, or the refs again"},
	{Name: "escalate", Doc: "puts a person step before the leaf in hand"},
	{Name: "guidance", Doc: "the notes the held step reads, or the one note named"},
	{Name: "unblock", Doc: "closes a ticket waiting on a person, and hands it to its successor"},
	{Name: "test", Doc: "runs the tests the branch changes since the take: green, assertion, build or missing"},
}
