package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE RENDERED PAGE IS JUDGED FROM A PLANTED PAGE, NEVER FROM THE LIVE TREE.
//
// The check this replaces bundled src/extension with esbuild, asked a built
// engine for the live panes, rendered the real editor and then put about sixty
// propositions to whatever came back. Three of its blocks opened with the same
// line, if (empties.groups), and when the pane answer carries no groups under
// that name the block does not run. It prints nothing when it does not run, and
// the count of failures is only ever raised from inside it, so five
// propositions went unasked and the check reported green: that a group with no
// value still pins, that an unpinned group pins on its filter, that a group
// says which property a drop into it writes, that a declared group pins by its
// name alone, and that an editable cell is drawn where the answer locks
// nothing. A block that cannot fail is a check that never ran.
//
// WHAT IS CARRIED OVER. The propositions that are about the page and hold for
// any data, the skipped ones among them. Each is put to a page this file
// plants, and each planted page differs from the clean one in the single thing
// its case is about, so a judge that refused every page could not pass them.
//
// WHAT IS DELIBERATELY DROPPED. Everything only the bundler or a built engine
// can answer: that every mark on the page comes from the icon table rather than
// reaching it as a bare word, that the engine locks seq, type and subs and says
// why to a person rather than to whoever calls the writer, that the editor and
// the sidebar carry one shared block of control rules rather than two copies,
// and that a group carries the property a drop into it writes. The first two
// want a built engine to answer a query, the third wants both pages rendered
// and compared, and the last cannot be read off a page at all, because only
// some groups set a property and a page without one is evidence of nothing.
// Those belong to a check that runs the bundler.
//
// A RULE DIVIDES THE QUERIES FROM THE BUCKETS, and this asks only that no query
// is drawn below it. The check this replaces also demanded that a query be
// drawn above it, which is a question about the data rather than the renderer:
// a view declaring no query would have failed a page that was drawing properly.

// theRenderedPageAt reads a rendered editor page from the work root and answers
// what is wrong with it.
func theRenderedPageAt(r Roots, rel string) error {
	raw, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(rel)))
	if err != nil {
		return fmt.Errorf("the rendered page could not be read at %s, so nothing about it can be "+
			"judged: %v", rel, err)
	}
	return theShapeOfARenderedPage(string(raw))
}

const aRenderedPaneWrap = `<div class="pane-wrap"`

var aRenderedHeading = regexp.MustCompile(`(?s)<h2\b.*?</h2>`)

var aRenderedGroupName = regexp.MustCompile(`<span class="name">([^<]*)</span>`)

var aRenderedKindsRule = regexp.MustCompile(`(?s)<div class="kinds">(.*?)</div>`)

var aRenderedCountAlone = regexp.MustCompile(`^<b>\d+</b> tokens?$`)

var aRenderedPager = regexp.MustCompile(`bs-pager|bs-per|bs-prev|bs-next|bs-where`)

var aRenderedHeadRow = regexp.MustCompile(`(?s)<thead><tr>(.*?)</tr></thead>`)

var aRenderedHeadCell = regexp.MustCompile(`<th[^>]*>`)

var aRenderedCellIsTheDoor = regexp.MustCompile(`<td class="opens"[^>]*title=`)

var aRenderedTextIsTheDoor = regexp.MustCompile(
	`<td class="opens"[^>]*>(<span class="kid-[^>]*>[^<]*</span>)*<span class="door" title="`)

var aRenderedEditableCell = regexp.MustCompile(`<td class="edits"[^>]*>`)

// theShapeOfARenderedPage answers everything wrong with a rendered editor page,
// or nil when every proposition holds.
func theShapeOfARenderedPage(page string) error {
	wrong := []string{}
	say := func(shape string, about ...interface{}) {
		wrong = append(wrong, fmt.Sprintf(shape, about...))
	}

	panes := strings.Split(page, aRenderedPaneWrap)[1:]
	if len(panes) == 0 {
		return fmt.Errorf("the page draws no pane, so every proposition about it would pass by " +
			"having nothing to read. A page with no pane is a renderer that answered with its " +
			"frame and none of its work")
	}

	// EVERY GROUP CARRIES A PIN, AND WHAT THE PIN CARRIES SAYS WHICH KIND OF
	// GROUP IT IS. A group the data made pins on the filter that made it, and a
	// group the view declared pins on its name alone: the view file already
	// holds the filter, so a declared pin carrying one would take the group away
	// when it was unpinned rather than move it.
	for _, heading := range aRenderedHeading.FindAllString(page, -1) {
		name := "with no name of its own"
		drawn := ""
		if found := aRenderedGroupName.FindStringSubmatch(heading); found != nil {
			name, drawn = fmt.Sprintf("%q", found[1]), found[1]
		}
		if !strings.Contains(heading, `class="pin`) {
			say("the group heading %s draws no pin. Every heading carries one whatever its rows "+
				"are, and a group with no value is still a group and usually the biggest one on "+
				"the page", name)
			continue
		}
		declared := strings.HasPrefix(drawn, "q/")
		carries := strings.Contains(heading, "data-matching=")
		if declared && carries {
			say("the declared group %s pins on a filter as well as on its name. The view file "+
				"already holds that filter, so unpinning this group would take it off the page "+
				"rather than move it", name)
		}
		if !declared && !carries {
			say("the group %s was made by the data and its pin carries no filter, so there is "+
				"nothing to hold it by once it is pinned", name)
		}
	}

	// THE PAGE SCROLLS ONCE AND NARROWS THROUGH THE SIFT BOX, so a pager
	// anywhere on it is the defect this proposition exists to catch.
	if found := aRenderedPager.FindString(page); found != "" {
		say("the page draws a pager, at %q. The owner asked for one scrollbar for the whole "+
			"thing with separators between, and the sift box is what narrows", found)
	}

	// A CLASS BEATS THE BROWSER'S HIDDEN ATTRIBUTE, so a popover carrying a
	// display of its own stayed open once it had been opened.
	if !strings.Contains(page, `.bs-pop[hidden] { display: none; }`) {
		say("the stylesheet carries no rule turning a hidden popover off. A class beats the " +
			"browser's hidden attribute, so a popover with a display of its own stayed open " +
			"whatever the attribute said. Write .bs-pop[hidden] { display: none; }")
	}

	// THE RULE SAYS THE NUMBER AND STOPS. It carried a sentence explaining that
	// the buckets hold each token once while the queries ask again, and the
	// owner asked twice in two sessions for it to go. A shape an agent keeps
	// putting back after a telling needs a check rather than another telling.
	for _, rule := range aRenderedKindsRule.FindAllStringSubmatch(page, -1) {
		if !aRenderedCountAlone.MatchString(strings.TrimSpace(rule[1])) {
			say("the rule between the kinds says %q rather than the count and nothing else",
				strings.TrimSpace(rule[1]))
		}
	}

	for at, pane := range panes {
		// NO TWO GROUPS IN ONE PANE SHARE A NAME. The grouping fell back to the
		// state when a token had no bucket, so every state drew twice, once as
		// the query named after it and once as a group the grouping invented,
		// and a person read backlogged is in there twice straight off the page.
		seen := map[string]bool{}
		for _, found := range aRenderedGroupName.FindAllStringSubmatch(pane, -1) {
			if seen[found[1]] {
				say("pane %d draws the group name %q twice, so a person reading the page counts "+
					"the same rows under two headings", at, found[1])
			}
			seen[found[1]] = true
		}
		where := strings.Index(pane, `<div class="kinds">`)
		if where < 0 {
			say("pane %d draws no rule between the queries and the buckets, so the page leaves a "+
				"reader to work out which headings hold each token once and which ask again", at)
			continue
		}
		for _, found := range aRenderedGroupName.FindAllStringSubmatch(pane[where:], -1) {
			if strings.HasPrefix(found[1], "q/") {
				say("pane %d draws the query group %q below the rule that divides the queries "+
					"from the buckets, so the rule divides nothing", at, found[1])
			}
		}
	}

	// THE RULE AND NOT A COLUMN NAME. This once named assignee, so it went red
	// the day a fourth property was ticked and assignee stopped being last. What
	// it means is that whichever column is last carries no width, so the table
	// fills its pane.
	for _, row := range aRenderedHeadRow.FindAllStringSubmatch(page, -1) {
		cells := aRenderedHeadCell.FindAllString(row[1], -1)
		if len(cells) == 0 {
			say("a table head draws no column at all, so the table has nothing to fill its pane")
			continue
		}
		if last := cells[len(cells)-1]; strings.Contains(last, "width") {
			say("the last column of a table head carries a width, at %q, so the table stops "+
				"short of the right edge of its pane", last)
		}
	}

	// THE TEXT IS THE DOOR, AND ONLY THE TEXT. A cell that was a door edge to
	// edge left no way to tick a row.
	if aRenderedCellIsTheDoor.MatchString(page) {
		say("the whole title cell is the door. A cell that opens a note edge to edge leaves no " +
			"way to tick the row it sits in, so the door goes on the span around the words and " +
			"not on the cell")
	}
	if !aRenderedTextIsTheDoor.MatchString(page) {
		say("no title text is drawn as a door, so there is nothing on the page that opens a note")
	}

	// AN EDIT THAT IS ABANDONED IS PUT BACK, and the value the cell started with
	// is what puts it back, so a cell offering an edit carries it.
	for _, cell := range aRenderedEditableCell.FindAllString(page, -1) {
		if !strings.Contains(cell, "data-was=") {
			say("the editable cell %q carries no value to put back, so an edit abandoned halfway "+
				"leaves the cell holding what was typed rather than what was there", cell)
		}
	}

	// EVERY TAG THAT OPENS IS CLOSED, which is the mistake a template makes.
	for _, tag := range []string{"div", "table", "tr", "td", "h2"} {
		opened := len(regexp.MustCompile("<"+tag+"[ >]").FindAllString(page, -1))
		shut := len(regexp.MustCompile("</"+tag+">").FindAllString(page, -1))
		if opened != shut {
			say("%d <%s> tags open and %d close, so the page hands the browser a shape it has to "+
				"guess at", opened, tag, shut)
		}
	}

	if len(wrong) == 0 {
		return nil
	}
	return fmt.Errorf("the rendered page is wrong in %d ways: %s", len(wrong), strings.Join(wrong, "; "))
}

// THE CLEAN PAGE IS WHAT EVERY PLANTED CASE IS MADE FROM, one replacement at a
// time, so each case differs from a page that holds in the single thing it is
// about. It draws one declared group above the rule and two the data made below
// it, and one of those two is the group with no value the skipped block was
// there to ask about.
const aCleanRenderedPage = `<!DOCTYPE html>
<style>
.bs-pop[hidden] { display: none; }
.bd { flex: 0 0 auto; }
</style>
<div class="pane-wrap" data-side="left">
<div class="top"></div>
<div class="pane">
<h2><span class="pin" data-pin="q/noted" title="pin this group"></span><span class="name">q/noted</span><span class="count">1</span></h2>
<table><thead><tr><th style="width: 40%">title</th><th>holder</th></tr></thead>
<tr draggable="true" data-id="one"><td class="opens"><span class="door" title="open the note">a note</span></td><td class="edits" data-was="main">main</td></tr></table>
<div class="kinds"><b>3</b> tokens</div>
<h2><span class="pin" data-pin="" data-matching="holder == &quot;&quot;" title="pin this group"></span><span class="name"></span><span class="count">2</span></h2>
<h2><span class="pin" data-pin="main" data-matching="holder == &quot;main&quot;" title="pin this group"></span><span class="name">main</span><span class="count">1</span></h2>
</div>
</div>
`

// aSecondPane is a pane of its own drawing a group named the way one in the
// first pane is. Two panes are two instances of one editor, so a name in each
// of them is two groups and not one group drawn twice.
const aSecondPane = `<div class="pane-wrap" data-side="right">
<div class="pane">
<h2><span class="pin" data-pin="main" data-matching="holder == &quot;main&quot;" title="pin this group"></span><span class="name">main</span></h2>
<div class="kinds"><b>1</b> token</div>
</div>
</div>
`

// aRenderedPageWith answers the clean page with one replacement made in it, and
// refuses to answer at all when the replacement changed nothing, so a case that
// plants no defect is heard about rather than passing.
func aRenderedPageWith(was, now string) string {
	made := strings.Replace(aCleanRenderedPage, was, now, 1)
	if made == aCleanRenderedPage {
		panic("the clean page does not carry " + was + ", so this case plants nothing")
	}
	return made
}

func TestARenderedPageThatLosesItsShapeIsRefused(t *testing.T) {
	for _, one := range []struct {
		why  string
		page string
		says []string
	}{
		{
			why: "a group heading carries no pin at all",
			page: aRenderedPageWith(
				`<span class="pin" data-pin="main" data-matching="holder == &quot;main&quot;" title="pin this group"></span>`,
				``),
			says: []string{"draws no pin", `"main"`},
		},
		{
			why:  "the group with no value pins without the filter that made it",
			page: aRenderedPageWith(` data-matching="holder == &quot;&quot;"`, ``),
			says: []string{"made by the data", "carries no filter", `""`},
		},
		{
			why: "a declared group pins on a filter as well as on its name",
			page: aRenderedPageWith(`data-pin="q/noted" title=`,
				`data-pin="q/noted" data-matching="status == &quot;noted&quot;" title=`),
			says: []string{"declared group", "q/noted", "unpinning"},
		},
		{
			why:  "a pager reached the page",
			page: aRenderedPageWith(`<div class="kinds">`, `<span class="bs-pager">1 of 4</span><div class="kinds">`),
			says: []string{"pager", "bs-pager", "sift box"},
		},
		{
			why:  "a popover is left to the browser's hidden attribute",
			page: aRenderedPageWith(`.bs-pop[hidden] { display: none; }`, `.bs-pop { display: block; }`),
			says: []string{"hidden popover", "beats the"},
		},
		{
			why: "the rule carries prose after its count",
			page: aRenderedPageWith(`<b>3</b> tokens</div>`,
				`<b>3</b> tokens, and the buckets below hold each one once</div>`),
			says: []string{"rule between the kinds", "count and nothing else"},
		},
		{
			why: "a query is drawn below the rule that divides the two kinds",
			page: strings.Replace(
				aRenderedPageWith("<div class=\"kinds\"><b>3</b> tokens</div>\n", ""),
				"<div class=\"pane\">\n",
				"<div class=\"pane\">\n<div class=\"kinds\"><b>3</b> tokens</div>\n", 1),
			says: []string{"below the rule", "q/noted"},
		},
		{
			why:  "one pane draws two groups under one name",
			page: aRenderedPageWith(`<span class="name"></span>`, `<span class="name">main</span>`),
			says: []string{"twice", `"main"`},
		},
		{
			why:  "the last column carries a width",
			page: aRenderedPageWith(`<th>holder</th>`, `<th style="width: 20%">holder</th>`),
			says: []string{"last column", "right edge"},
		},
		{
			why:  "the whole title cell is the door",
			page: aRenderedPageWith(`<td class="opens">`, `<td class="opens" title="click to open">`),
			says: []string{"whole title cell", "tick the row"},
		},
		{
			why:  "an editable cell carries nothing to put back",
			page: aRenderedPageWith(`<td class="edits" data-was="main">`, `<td class="edits">`),
			says: []string{"editable cell", "put back"},
		},
		{
			why:  "a tag the template opened is never closed",
			page: aRenderedPageWith(`<div class="top"></div>`, `<div class="top">`),
			says: []string{"<div>", "open"},
		},
		{
			why:  "the renderer answered with its frame and no pane",
			page: "<!DOCTYPE html>\n<style>\n.bs-pop[hidden] { display: none; }\n</style>\n",
			says: []string{"draws no pane", "nothing to read"},
		},
	} {
		dir := t.TempDir()
		if err := os.WriteFile(filepath.Join(dir, "page.html"), []byte(one.page), 0o644); err != nil {
			t.Fatal(err)
		}
		err := theRenderedPageAt(Roots{Work: dir, Method: dir}, "page.html")
		if err == nil {
			t.Fatalf("a page where %s went in", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the page where %s never says %q: %v", one.why, word, err)
			}
		}
	}
}

func TestARenderedPageThatHoldsItsShapeGoesIn(t *testing.T) {
	for _, one := range []struct {
		why  string
		page string
	}{
		{
			why:  "every group pins the way its kind pins and the rule divides the two kinds",
			page: aCleanRenderedPage,
		},
		{
			why:  "two panes each draw a group of one name, which is two groups and not one twice",
			page: aCleanRenderedPage + aSecondPane,
		},
		{
			why: "the pane declares no query at all, so the rule has nothing above it",
			page: strings.Replace(
				aRenderedPageWith(`data-pin="q/noted" title=`,
					`data-pin="noted" data-matching="status == &quot;noted&quot;" title=`),
				`<span class="name">q/noted</span>`, `<span class="name">noted</span>`, 1),
		},
		{
			why: "the door has a fold and an indent between the cell and the words",
			page: aRenderedPageWith(`<td class="opens"><span class="door"`,
				`<td class="opens"><span class="kid-fold">+</span><span class="door"`),
		},
	} {
		dir := t.TempDir()
		if err := os.WriteFile(filepath.Join(dir, "page.html"), []byte(one.page), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := theRenderedPageAt(Roots{Work: dir, Method: dir}, "page.html"); err != nil {
			t.Fatalf("a page where %s was refused: %v", one.why, err)
		}
	}
}

func TestARenderedPageThatIsNotThereIsSaidSoRatherThanPassed(t *testing.T) {
	dir := t.TempDir()
	err := theRenderedPageAt(Roots{Work: dir, Method: dir}, "page.html")
	if err == nil {
		t.Fatal("a page that was never written was judged sound")
	}
	if !strings.Contains(err.Error(), "could not be read") {
		t.Fatalf("the refusal never says the page was missing: %v", err)
	}
}
