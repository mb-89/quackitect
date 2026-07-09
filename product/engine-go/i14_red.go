package main

// i14_red.go — the i0014_doc_review RED battery: tests first, they FAIL until the build.
// Each case carries its trace line: test-<id> -> selftest:<name>.
// All nineteen assert the TARGET contract on ONE shared, guarded, cached book render.

import (
	"regexp"
	"strings"
)

// The shared render. Guarded against coverage self-recursion (the i13 lesson:
// renderBookHTML computes StatusMap, whose coverage evaluation re-runs the asking
// test). Cached, because nineteen doc-tests per battery would otherwise render
// nineteen ~25MB books.
var (
	i14BookBusy   bool
	i14BookCache  string
	i14BookCached bool
)

func i14Book() (string, bool) {
	if i14BookBusy {
		return "", false // nested probe: vacuously ok; the outer run decides
	}
	if i14BookCached {
		return i14BookCache, true
	}
	i14BookBusy = true
	defer func() { i14BookBusy = false }()
	html, _, _ := renderBookHTML(LoadAll())
	i14BookCache, i14BookCached = html, true
	return html, true
}

// test-shell-title-card -> selftest:shell-title-card
func selftestShellTitleCard() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return !strings.Contains(html, "reader's contract") &&
		!strings.Contains(html, "<header data-root=") &&
		strings.Contains(html, `id="dc-iteration"`) &&
		strings.Contains(html, `id="dc-engine"`)
}

// test-sidebar-order -> selftest:sidebar-order
// Since the details-pane rework the views block lives INSIDE the pane (dpane-views);
// the nav reads search, filter expression, then the toc.
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
	return iSearch >= 0 && iExpr > iSearch && iToc > iExpr &&
		strings.Contains(nav, `id="dpane-views"`)
}

// test-section-paging -> selftest:section-paging
// The top pager bar died (owner c1): paging flows through the toc, hash, and arrow
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
// The hit list died in the 2026-07-08 sidebar rework: a search steps through the
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
// The enum selects died for combinable pill facets (req-table-facets, i14).
func selftestTableInteract() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, "data-sortable") &&
		strings.Contains(html, `data-facet=`) &&
		strings.Contains(html, `class="q-filter"`)
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
	// no timeline GRAPH in ch6 (field c41: the table carries it); the gate-tally table
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
func selftestCh8AudienceSubchapters() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	for _, c := range []string{"acquirer", "user", "newcomer", "communicator", "assessor", "project-owner", "agent"} {
		if !strings.Contains(html, `id="man-ch8-aud-`+c+`"`) {
			return false
		}
	}
	return true
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
func selftestNeedExpand() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	i := strings.Index(html, `class="need-ucs"`)
	if i < 0 {
		return false
	}
	tail := html[i:]
	if len(tail) > 2000 {
		tail = tail[:2000]
	}
	return strings.Contains(tail, "<li")
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
func selftestCommentPersist() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, "qc-draft") && strings.Contains(html, "postAllDrafts")
}

// test-deck-views-section -> selftest:deck-views-section
func selftestDeckViewsSection() bool {
	html, live := i14Book()
	if !live {
		return true
	}
	return strings.Contains(html, `id="deck-list"`)
}

// test-context-diagram -> selftest:context-star-derived
// The star derives from neighbour NOTES, never from invented actors: each nbr- node
// renders as one border-connected box, direction `in` on the left flank and `out` on
// the right (owner ruling 2026-07-09); an empty neighbour set says so out loud.
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
