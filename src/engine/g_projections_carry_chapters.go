package main

import (
	"fmt"
	"path"
	"path/filepath"
	"strings"
)

// A PROJECTION CARRIES ONE CHAPTER FROM EACH SOURCE, NOT THE WHOLE FILE.
//
// The projection map names the one chapter a projected file takes from each of
// its sources, and each source arrives under its own title. An engine built
// before that rule wrote the sources whole, so the projected file grew their
// Motivation and Discussion chapters as well, and an agent read a standing
// layer several times the size it should be. Nothing said so. The file is
// generated, so nobody diffs it, and both shapes look plausible to a reader who
// has not seen the other one.
//
// THE HEADINGS ARE THE WHOLE RULE. What a chapter says is its source's
// business. Which chapters arrived, in which order, is this door's.
//
// IT ASKS THE PROJECTOR RATHER THAN A COPY OF THE PROJECTOR'S RULES. The check
// this replaces carried its own spelling of a source title and its own chapter
// cut, so the judge and the thing judged could drift apart while each stayed
// sure it was right. This assembles the body the projector would write, through
// the same sourcesOf and assemble the projector calls, and compares only the
// headings.
//
// AND THE ORDER IS ASKED EVEN WHEN A SOURCE COMES UP SHORT. The check this
// replaces stopped reading the moment one source carried no such chapter, so
// the ordering rule went unasked over exactly the tree most likely to have
// broken it.
func aProjectionCarryingMoreThanItsChapter(r Roots, _ bool, rel, text string) error {
	p, ok := theChapteredProjectionAt(r, rel)
	if !ok {
		return nil
	}
	srcs, err := sourcesOf(r.Method, p)
	if err != nil {
		// Nothing to assemble from is a fault of the method tree rather than of
		// this write, and it is reported where it happens.
		return nil
	}
	// The variables only fill in paths inside prose. A tree that cannot answer
	// them still has headings, and headings are all this reads.
	vars, err := variables(r)
	if err != nil {
		vars = nil
	}
	body, err := assemble(r.Method, srcs, p.Section, vars)
	if err != nil {
		return fmt.Errorf("%s is the projection of the %s chapter of each file in %s, and this "+
			"tree cannot say what it should carry: %v. Until every source carries that chapter, "+
			"what the projection takes from it is undefined, and a generated file nobody diffs "+
			"is the worst place to leave a question open. Give that source a %s chapter, or park "+
			"it out of %s, and let the engine project this file again.",
			rel, p.Section, p.SourcesFrom, err, p.Section, p.SourcesFrom)
	}
	if p.Preamble != "" {
		front, err := assemble(r.Method, []string{p.Preamble}, "", vars)
		if err != nil {
			return fmt.Errorf("%s is projected behind the preamble %s, and that preamble cannot "+
				"be read: %v. The projection cannot be judged against a front matter this tree "+
				"does not hold. Put %s back, or take it out of the projection map, and let the "+
				"engine project this file again.", rel, p.Preamble, err, p.Preamble)
		}
		body = front + "\n" + body
	}
	want, got := theHeadingLines(body), theHeadingLines(text)
	at, apart := theFirstHeadingApart(want, got)
	if !apart {
		return nil
	}
	return fmt.Errorf("%s carries the wrong headings. It is projected from the %s chapter of "+
		"each file in %s, so heading %d should be %s and this write puts %s there. A projection "+
		"takes one chapter from each source, under that source's title, in the order the sources "+
		"sort. An engine built before that rule wrote the sources whole, so this file grew their "+
		"Motivation and Discussion chapters as well and an agent read a standing layer several "+
		"times the size it should be, with nothing saying so, because the file is generated and "+
		"nobody diffs it. Do not write this file by hand. Edit the source under %s and project "+
		"again, so the headings come out as the projector builds them.",
		rel, p.Section, p.SourcesFrom, at+1, theHeadingAt(want, at), theHeadingAt(got, at), p.SourcesFrom)
}

// theChapteredProjectionAt answers the projection this path is the target of,
// and only while that projection names a chapter.
//
// ONLY A CHAPTERED PROJECTION IS THIS DOOR'S BUSINESS. One that copies a whole
// file names no chapter, and copying it whole is what it is for.
func theChapteredProjectionAt(r Roots, rel string) (Projection, bool) {
	if !r.MethodFound() {
		return Projection{}, false
	}
	list, err := LoadProjections(r.Method)
	if err != nil {
		return Projection{}, false
	}
	written := theTargetPath(rel)
	for _, p := range list {
		if p.Section == "" || p.SourcesFrom == "" {
			continue
		}
		if theTargetPath(p.Target) == written {
			return p, true
		}
	}
	return Projection{}, false
}

// theTargetPath writes a path the one way, so the map and the write being
// judged are compared as the same string.
func theTargetPath(rel string) string {
	return path.Clean(strings.TrimPrefix(filepath.ToSlash(rel), "./"))
}

// theHeadingLines answers a text's headings, each as the line it would be
// written on. Two files are compared on the shape they carry rather than on the
// prose under it, which is the source's business and not this door's.
func theHeadingLines(text string) []string {
	out := []string{}
	for _, line := range strings.Split(text, "\n") {
		depth := headingDepth(line)
		if depth == 0 {
			continue
		}
		out = append(out, strings.Repeat("#", depth)+" "+strings.TrimSpace(line[depth:]))
	}
	return out
}

// theFirstHeadingApart answers where two heading sequences first differ, which
// is the end of the shorter one when one is a prefix of the other.
func theFirstHeadingApart(want, got []string) (int, bool) {
	for i := range want {
		if i >= len(got) {
			return i, true
		}
		if want[i] != got[i] {
			return i, true
		}
	}
	if len(got) > len(want) {
		return len(want), true
	}
	return 0, false
}

// theHeadingAt names one heading for the refusal to quote, and says so plainly
// where the sequence has already ended.
func theHeadingAt(lines []string, at int) string {
	if at < len(lines) {
		return "\"" + lines[at] + "\""
	}
	return "nothing"
}
