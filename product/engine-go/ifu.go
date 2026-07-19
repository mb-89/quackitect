package main

import (
	"regexp"
	"strings"
)

// design: go-ifu-arc-lint  implements: req-ifu-user-stories, req-ifu-base-state, req-ifu-quality
// The IFU arc shape check (owner rulings 2026-07-17). Every kind: ifu deck follows ONE
// fixed narrative arc: a problem slide, a starting-state slide, at most six step
// slides, a result slide, and a coverage slide LAST. The coverage slide is the one
// machine-readable reference home: use cases count as covered only when LINKED there.
// A bare id list is coverage theater and never counts. A story slide carrying use-case
// references is clutter, since the refs' home is the coverage slide. The check is pure
// text over the deck body. The book render runs it for every kind: ifu deck, and the
// coverage rule (ifu-usecases) reads the same linked-last-slide semantics.
var ifuUcRe = regexp.MustCompile(`\buc-[a-z0-9-]+`)

// ifuRefLinked reports whether id appears in text in LINK position: as a label
// ([uc-x](...) / [[uc-x]]) or a target ((uc-x)). A bare mention never counts.
func ifuRefLinked(text, id string) bool {
	for i := 0; ; {
		j := strings.Index(text[i:], id)
		if j < 0 {
			return false
		}
		p := i + j
		after := p + len(id)
		bounded := after >= len(text) || !ifuIDChar(text[after])
		if bounded && p > 0 && (text[p-1] == '[' || text[p-1] == '(') {
			return true
		}
		i = after
	}
}

func ifuIDChar(c byte) bool {
	return c == '-' || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')
}

// ifuArcFindings checks one deck body against the arc. Every finding names the deck
// and the repair.
func ifuArcFindings(deckID, body string) []string {
	var f []string
	units := parseManifestUnits(body)
	if len(units) < 4 {
		return append(f, "deck "+deckID+": the IFU arc needs problem, starting-state, result, and coverage slides - "+
			itoa(len(units))+" present; add the missing beats")
	}
	if steps := len(units) - 4; steps > 6 {
		f = append(f, "deck "+deckID+": "+itoa(steps)+" step slides - the arc caps at six; split the journey into two IFUs")
	}
	last := units[len(units)-1].Body
	linked := 0
	for _, m := range ifuUcRe.FindAllStringIndex(last, -1) {
		id := last[m[0]:m[1]]
		prev := byte(0)
		if m[0] > 0 {
			prev = last[m[0]-1]
		}
		if prev == '[' || prev == '(' {
			linked++
			continue
		}
		f = append(f, "deck "+deckID+": bare use-case id "+id+" on the coverage slide - link it; a bare id list is coverage theater")
	}
	if linked == 0 {
		f = append(f, "deck "+deckID+": the coverage slide links no use case - the last slide is the coverage home; link every use case this IFU covers")
	}
	for i, u := range units[:len(units)-1] {
		if ids := ifuUcRe.FindAllString(u.Body, -1); len(ids) > 0 {
			f = append(f, "deck "+deckID+": use-case reference "+ids[0]+" on story slide "+itoa(i+1)+" - references live on the coverage slide only; move it")
		}
	}
	return f
}

// enddesign
