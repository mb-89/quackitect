package main

// i14_red.go — the i0014_doc_review RED battery: tests first, they FAIL until the build.
// Each case carries its trace line: test-<id> -> selftest:<name>.
// All nineteen assert the TARGET contract on ONE shared, guarded, cached book render.

import (
	"regexp"
	"strings"
)

// i14Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i14Tests = []namedTest{
	{"shell-title-card", selftestShellTitleCard},
	{"sidebar-order", selftestSidebarOrder},
	{"section-paging", selftestSectionPaging},
	{"search-hitlist", selftestSearchHitlist},
	{"reader-columns", selftestReaderColumns},
	{"table-render", selftestTableRender},
	{"table-noise", selftestTableNoise},
	{"table-interact", selftestTableInteract},
	{"glossary-table", selftestGlossaryTable},
	{"ref-tooltips", selftestRefTooltips},
	{"ch6-no-graph", selftestCh6NoGraph},
	{"icon-density", selftestIconDensity},
	{"agent-guide-ch8", selftestAgentGuideCh8},
	{"ch8-audience-subchapters", selftestCh8AudienceSubchapters},
	{"ch3-ucfn-merge", selftestCh3UcfnMerge},
	{"need-expand", selftestNeedExpand},
	{"system-overview", selftestSystemOverview},
	{"comment-persist", selftestCommentPersist},
	{"deck-views-section", selftestDeckViewsSection},
	{"context-model-derived", selftestContextModelDerived},
}

// The shared render, THE process-global memo (bookOnceHTML in
// book_once.go): one guarded, cached real-book render for the whole battery.
func i14Book() (string, bool) { return bookOnceHTML() }

// test-shell-title-card -> selftest:shell-title-card
// No STANDING #book-info block - the
// identity rides the title button's data attributes and a title click feeds the
// details pane like any other click target.
// RE-POINTED (the i27 timeline drill-down): the old "reader's contract" phrase probe
// is retired — the phrase legitimately reappears inside EMBEDDED milestone evidence
// (the ch6 timeline drill renders old M-docs); the structural markers stay the guard.
func selftestShellTitleCard() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, "<header data-root=") &&
		!strings.Contains(html, `id="book-info"`) &&
		strings.Contains(html, `data-iteration="`) &&
		strings.Contains(html, `data-engine="`)
}

// test-sidebar-order -> selftest:sidebar-order
// No views block in the details pane - the pane
// is context-sensitive only (q-views-placement holds the future home). The nav reads
// search, filter expression, then the toc, then the pane.
// The expand-all pill is gone; the toc shows the SHORT chapter title only,
// the subtitle renders at the chapter head.
func selftestSidebarOrder() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	nav := html
	if i := strings.Index(nav, `<nav id="sidebar"`); i >= 0 {
		nav = nav[i:]
	}
	if j := strings.Index(nav, "</nav>"); j >= 0 {
		nav = nav[:j]
	}
	iSearch := strings.Index(nav, `id="search"`)
	iExpr := strings.Index(nav, `id="filter-expr"`)
	iToc := strings.Index(nav, `id="toc"`)
	iPane := strings.Index(nav, `id="dpane-content"`)
	return iSearch >= 0 && iExpr > iSearch && iToc > iExpr && iPane > iToc &&
		!strings.Contains(nav, "dpane-views") &&
		!strings.Contains(nav, `id="expand-all"`) &&
		!strings.Contains(nav, "toc-sub") &&
		strings.Contains(nav, " Introduction and IFUs</a>") &&
		strings.Contains(html, `class="ch-sub"`)
}

// test-section-paging -> selftest:section-paging
// No top pager bar: paging flows through the toc, hash, and arrow
// keys - one top-level section per page, toggled by the pg-hide class.
func selftestSectionPaging() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `data-paged="1"`) && strings.Contains(html, "pg-hide") &&
		strings.Contains(html, "bookPageTo")
}

// test-search-hitlist -> selftest:search-hitlist
// No hit list: a search steps through the
// matches with a previous/next counter; the full-yellow highlight stays.
func selftestSearchHitlist() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `id="search-nav"`) &&
		strings.Contains(html, `id="hits-pos"`) &&
		strings.Contains(html, `id="hits-prev"`) && strings.Contains(html, `id="hits-next"`) &&
		strings.Contains(html, "::highlight(book-hits){background:#ffff00}")
}

// test-reader-columns -> selftest:reader-columns
// Scoped to rendered CELLS (>x<): guidance prose may legitimately NAME file.name
// when documenting the query subset (it reaches the book via the pull law).
func selftestReaderColumns() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, ">file.name<") && !strings.Contains(html, ">weight<")
}

// test-table-render -> selftest:table-render
func selftestTableRender() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Count(html, `class="q-table`) >= 10 && strings.Count(html, "<thead>") >= 10
}

// test-table-noise -> selftest:table-noise
func selftestTableNoise() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, "(none) (") && strings.Contains(html, "fb-zero")
}

// test-table-interact -> selftest:table-interact
// Combinable pill facets replace enum selects (req-table-facets); no
// per-table q-filter row - the text filter lives in the shared .qt-search control.
func selftestTableInteract() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, "data-sortable") &&
		strings.Contains(html, `data-facet=`) &&
		strings.Contains(html, `class="qt-search"`)
}

// test-glossary-table -> selftest:glossary-table
func selftestGlossaryTable() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	i := strings.Index(html, `id="glossary"`)
	if i < 0 {
		return false
	}
	tail := html[i:]
	if len(tail) > 6000 {
		tail = tail[:6000]
	}
	return strings.Contains(tail, "q-table") && strings.Contains(tail, "data-sortable")
}

// test-ref-tooltips -> selftest:ref-tooltips
// The (?) ref-tip markers died for the termref affordance: dashed-underlined words
// carry their definition into the details pane (data-help + data-goto).
func selftestRefTooltips() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `class="termref"`) && strings.Contains(html, `data-help="`)
}

// test-ch6-no-graph -> selftest:ch6-no-graph
func selftestCh6NoGraph() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	// RE-POINTED at the layout rework: chapter files carry no numbers - the project
	// chapter is man-project now
	i := strings.Index(html, `<article id="man-project"`)
	if i < 0 {
		return false
	}
	ch := html[i:]
	if j := strings.Index(ch[1:], "<article "); j >= 0 {
		ch = ch[:j+1]
	}
	// no dot-line timeline GRAPH in the chapter (the shared timeline and the tables
	// carry it); the reader tables and the ai-mark icons stay
	return strings.Contains(ch, `class="q-table`) && !strings.Contains(ch, `aria-label="timeline"`)
}

// test-icon-density -> selftest:icon-density
func selftestIconDensity() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	units := regexp.MustCompile(`<div id="[^"]+-u[0-9]+"`).FindAllString(html, -1)
	marks := strings.Count(html, `class="ai-marks"`)
	return strings.Contains(html, "qpad-short") && marks <= len(units)
}

// test-agent-guide-ch8 -> selftest:agent-guide-ch8
func selftestAgentGuideCh8() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, `data-ch="man-agent-guide"`) &&
		strings.Contains(html, `id="man-agent-guide"`)
}

// test-ch8-audience-subchapters -> selftest:ch8-audience-subchapters
// No per-audience sibling
// subchapters - ONE guides table; every audience class of the project type
// must stay visible there, as a guide row or an honest empty row.
func selftestCh8AudienceSubchapters() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	i := strings.Index(html, `id="guides-table"`)
	if i < 0 {
		return false
	}
	for _, c := range []string{"acquirer", "user", "newcomer", "communicator", "assessor", "project-owner", "agent"} {
		if !strings.Contains(html[i:], `data-aud="`+c+`"`) {
			return false
		}
	}
	// the flattened sibling subchapters are gone
	return !strings.Contains(html, `id="man-ch8-aud-`)
}

// test-ch3-ucfn-merge -> selftest:ch3-ucfn-merge
// RE-POINTED (the i27 register fold, req-design-input-register): the separate
// use-cases-and-functions board DIED — the register is the one design-input home.
func selftestCh3UcfnMerge() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, `id="ucfn-board"`) && strings.Contains(html, `id="input-register"`)
}

// test-need-expand -> selftest:need-expand
// RE-POINTED (the i27 register fold): the per-need view rides the register's need
// facet, and a use-case row stays expandable to its definition INSIDE the register.
func selftestNeedExpand() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	i := strings.Index(html, `id="input-register"`)
	if i < 0 {
		return false
	}
	reg := html[i:]
	return strings.Contains(reg, `data-facet="need"`) &&
		strings.Contains(reg, `data-node="uc-`) && strings.Contains(reg, "urow qt-exp")
}

// test-system-overview -> selftest:system-overview
func selftestSystemOverview() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `id="man-overview"`) &&
		strings.Contains(html, `data-ch="man-overview"`)
}

// test-comment-persist -> selftest:comment-persist
// The save serializer strips the present-mode
// state so a copy saved mid-presentation reopens as the book, and opening the panel
// fills the details pane with the how-it-works explainer.
func selftestCommentPersist() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, "qc-draft") && strings.Contains(html, "postAllDrafts") &&
		strings.Contains(html, "body.removeAttribute('data-present')") &&
		strings.Contains(html, "querySelectorAll('.slide.current')") &&
		strings.Contains(html, "bookDetail('Comments'")
}

// test-deck-views-section -> selftest:deck-views-section
// The decks have ONE entry point each and never the details pane; no deck list rides the
// sidebar. An IFU-kind deck's entry is the intro's ifus.base table (owner ruling: ONE IFU
// table in chapter two), so the views-home derived-documents table lists NON-ifu decks
// only — the duplication guard the first cut of this test missed.
func selftestDeckViewsSection() bool {
	// direct probe: an ifu deck stays OUT of views-home, a plain deck keeps its row
	fix := map[string]Node{
		"man-ch":     {ID: "man-ch", Type: "manifest", Mode: "chapter", Statement: "Probe chapter."},
		"deck-ifu":   {ID: "deck-ifu", Type: "manifest", Mode: "deck", Kind: "ifu", Statement: "An IFU deck."},
		"deck-plain": {ID: "deck-plain", Type: "manifest", Mode: "deck", Statement: "A plain deck."},
	}
	vh := renderViewsHome(fix)
	if !strings.Contains(vh, `data-deck="deck-plain"`) || strings.Contains(vh, "deck-ifu") {
		return false // the ifu deck is ABSENT, the plain deck presents
	}
	// all decks ifu: no derived table AND no misleading empty-state line
	delete(fix, "deck-plain")
	vh = renderViewsHome(fix)
	if strings.Contains(vh, "Derived documents") || strings.Contains(vh, "no derived documents yet") {
		return false
	}
	// genuinely no decks: the empty-state line stays honest
	delete(fix, "deck-ifu")
	if !strings.Contains(renderViewsHome(fix), "no derived documents yet") {
		return false
	}
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, `id="deck-list"`) &&
		!strings.Contains(html, "dpane-views") &&
		strings.Contains(html, `class="views-home"`) &&
		strings.Contains(html, `class="deck"`)
}

// test-context-diagram -> selftest:context-model-derived
// The star derives from neighbour NOTES, never from invented actors: each nbr- node
// renders as one border-connected box, direction `in` on the left flank and `out` on
// the right; an empty neighbour set says so out loud.
func selftestContextModelDerived() bool {
	nodes := map[string]Node{
		"nbr-console": {ID: "nbr-console", Type: "neighbour", Statement: "The console. Commands and blesses.", Direction: "in"},
		"nbr-reader":  {ID: "nbr-reader", Type: "neighbour", Statement: "The reader's browser.", Direction: "out"},
	}
	svg := renderFigure("context-model", nodes)
	empty := renderFigure("context-model", map[string]Node{})
	return strings.Contains(svg, `x="70" y="215" text-anchor="middle">console<`) && // in = left flank
		strings.Contains(svg, `x="570" y="215" text-anchor="middle">reader<`) && // out = right flank
		strings.Contains(svg, "<line ") && strings.Contains(empty, "no neighbour")
}
