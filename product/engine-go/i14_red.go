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
	{"context-star-derived", selftestContextStarDerived},
}

// The shared render, THE process-global memo (bookOnceHTML in
// book_once.go): one guarded, cached real-book render for the whole battery.
func i14Book() (string, bool) { return bookOnceHTML() }

// test-shell-title-card -> selftest:shell-title-card
// No STANDING #book-info block - the
// identity rides the title button's data attributes and a title click feeds the
// details pane like any other click target.
func selftestShellTitleCard() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, "reader's contract") &&
		!strings.Contains(html, "<header data-root=") &&
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
		strings.Contains(nav, " Introduction</a>") &&
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
	i := strings.Index(html, `<article id="man-ch6`)
	if i < 0 {
		return false
	}
	ch := html[i:]
	if j := strings.Index(ch[1:], "<article "); j >= 0 {
		ch = ch[:j+1]
	}
	// no timeline GRAPH in ch6 (the table carries it); the gate-tally table
	// and the ai-mark icons stay
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
func selftestCh3UcfnMerge() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `id="ucfn-board"`)
}

// test-need-expand -> selftest:need-expand
// No per-need disclosure
// board - TWO reader tables inside the merged section: use cases (expand =
// the definition) and functions (each row naming its need).
func selftestNeedExpand() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	i := strings.Index(html, `id="ucfn-board"`)
	if i < 0 {
		return false
	}
	board := html[i:]
	// both captions render; a use-case row is expandable
	return strings.Contains(board, ">Use cases</p>") && strings.Contains(board, ">Functions</p>") &&
		strings.Contains(board, `data-node="uc-`) && strings.Contains(board, "urow qt-exp")
}

// test-system-overview -> selftest:system-overview
func selftestSystemOverview() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `id="man-sys-overview"`) &&
		strings.Contains(html, `data-ch="man-sys-overview"`)
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
// The decks
// have ONE entry point - present buttons inside the views home block in the
// introduction chapter. Never the details pane; no deck list rides the sidebar.
func selftestDeckViewsSection() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, `id="deck-list"`) &&
		!strings.Contains(html, "dpane-views") &&
		strings.Contains(html, `class="views-home"`) &&
		strings.Contains(html, `class="present" data-deck="`) &&
		strings.Contains(html, `class="deck"`)
}

// test-context-diagram -> selftest:context-star-derived
// The star derives from neighbour NOTES, never from invented actors: each nbr- node
// renders as one border-connected box, direction `in` on the left flank and `out` on
// the right; an empty neighbour set says so out loud.
func selftestContextStarDerived() bool {
	nodes := map[string]Node{
		"nbr-console": {ID: "nbr-console", Type: "neighbour", Statement: "The console. Commands and blesses.", Direction: "in"},
		"nbr-reader":  {ID: "nbr-reader", Type: "neighbour", Statement: "The reader's browser.", Direction: "out"},
	}
	svg := renderFigure("context-star", nodes)
	empty := renderFigure("context-star", map[string]Node{})
	return strings.Contains(svg, `x="70" y="215" text-anchor="middle">console<`) && // in = left flank
		strings.Contains(svg, `x="570" y="215" text-anchor="middle">reader<`) && // out = right flank
		strings.Contains(svg, "<line ") && strings.Contains(empty, "no neighbour")
}
