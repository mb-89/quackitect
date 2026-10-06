// The retro verbs: every verb src/quack registers under retro, each standing
// as an action of the retro topic through the node module.
// [[spec/tickets/retro-verbs-become-actions]]
package verbs

// Every verb src/quack registers under retro, with its usage line as its doc. [[spec/tickets/retro-verbs-become-actions]]
var RetroVerbs = []Verb{
	{Name: "notes", Doc: "the private notes still open on this box, and 0 when none stands"},
	{Name: "audit", Doc: "the experiments still open, and 0 once each stands decided"},
	{Name: "backlog", Doc: "every prose criterion the window closes, and 0 once each holds a verdict"},
	{Name: "collect", Doc: "copies this box into the retro's folder, and writes its manifest; --again merges what arrived since"},
	{Name: "timeline", Doc: "the hours holding work, per source, with the idle stretches between"},
	{Name: "chapters", Doc: "checks the cuts, and hands every chapter its lines"},
	{Name: "matrix", Doc: "draws the report: the class fixes first, then the matrix"},
	{Name: "read", Doc: "every owner prompt, fault, refusal and command of the chapter, with its file and line"},
	{Name: "effect", Doc: "counts the last retro's class patterns over this input"},
	{Name: "classes", Doc: "counts each class's rate, and refuses a finding with no disposition"},
	{Name: "mint", Doc: "mints one ticket a class standing open, and opens each draft"},
	{Name: "new", Doc: "mints a retro off its route, opens it, and hands out its first leaf"},
	{Name: "score", Doc: "the improvements earlier retros mint, and how many stay open"},
}
