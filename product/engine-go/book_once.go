package main

// design: go-book-once  implements: req-battery-lean
// bookOnceHTML is THE one shared real-book render of a process: a global memo of renderBookHTML(LoadAll()). Every battery test that asserts against the real book reads THIS seam. Nineteen doc-tests per battery would otherwise render nineteen roughly-25MB books; selftest:render-once counts the literal call sites and allows at most one. It is guarded against coverage self-recursion, since renderBookHTML computes StatusMap, whose coverage evaluation re-runs the asking test. A nested probe answers ("", false), vacuously ok, and the outer run decides.
var (
	bookOnceBusy   bool
	bookOnceCache  string
	bookOnceCached bool
)

func bookOnceHTML() (string, bool) {
	if bookOnceBusy {
		busyGuardTrip()  // a busy answer must never become a recorded verdict (go-verdict-guard)
		return "", false // nested probe: vacuously ok; the outer run decides
	}
	if bookOnceCached {
		return bookOnceCache, true
	}
	bookOnceBusy = true
	defer func() { bookOnceBusy = false }()
	html, _, _ := renderBookHTML(LoadAll())
	bookOnceCache, bookOnceCached = html, true
	return html, true
}

// enddesign
