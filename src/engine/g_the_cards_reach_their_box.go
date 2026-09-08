package main

import (
	"errors"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// A CARD DISCUSSES EVERY POINT IT LISTS, AND COUNTS UP THE WAY ITS LIST DOES.
//
// A card handed to a session is read by number. The actionables are numbered so
// that the section discussing one can be found, and the two halves only work
// while they agree.
//
// THE ORDER WENT FIRST. The cloud card gained a tenth actionable and its
// section went in above the ninth, leaving a discussion that ran 1, 2, 3, 10,
// 9, 5, 4, 7 under a list that counted up. A reader following 9 walks past 10
// to reach it, and the next hand adding a section copies the placement it
// finds.
//
// AND THEN THE SECTIONS WENT MISSING. Two of that card's ten numbered points
// had no section at all. A session gets the line and none of the case a person
// built out of the sessions that went wrong, and a line with nothing behind it
// is the first one it shaves.
//
// THE READER THAT SCANNED THE TREE FOR THIS COULD NOT FAIL ON EITHER. It walked
// the card folder and stepped over any card with fewer than two numbered
// sections, and over any card whose actionables it failed to find, both in
// silence, so a card that lost its numbering passed by being skipped. It also
// cut the actionables block at the first capital Z, because the escape it ended
// the block on is not one this language has, so every point listed after a word
// carrying that letter was never counted at all.
//
// SO THE RULE IS DECIDED PER WRITE, off the bytes going in. The card being
// written is the card being judged, and a card that carries no numbered point
// is the one case where nothing is asked.
func aCardDiscussesEveryPointItLists(_ Roots, _ bool, rel, text string) error {
	if !cardsReachIsACard(rel) {
		return nil
	}
	discussed := cardsReachSectionsDiscussed(text)
	listed, hasHeading := cardsReachPointsListed(text)
	if !hasHeading && len(discussed) == 0 {
		return nil // a card built out of prose rather than numbered points
	}
	for i, n := range discussed {
		if i == 0 || n >= discussed[i-1] {
			continue
		}
		return errors.New(rel + " discusses its points out of order: section " +
			strconv.Itoa(discussed[i-1]) + " is followed by section " + strconv.Itoa(n) +
			". A card is read by number, so a reader looking for one section walks past a " +
			"later one to reach it, and the next hand adding a section copies the placement " +
			"it finds. That is how this card came to run 1, 2, 3, 10, 9, 5, 4, 7 under a list " +
			"that counted up. Move the section so the discussion ascends the way the " +
			"actionables do.")
	}
	if hasHeading && len(listed) == 0 {
		return errors.New(rel + " carries an Actionables heading and lists no numbered point " +
			"under it. The numbers are how a session is told what to do and how it finds the " +
			"section holding the case behind each one, so a heading with nothing numbered under " +
			"it hands the session a card it cannot follow by number. Number the points under " +
			"that heading, one per line, as 1. and 2. and so on, or drop the heading.")
	}
	if len(listed) == 0 {
		return nil
	}
	var quiet []string
	for _, n := range listed {
		if cardsReachHolds(discussed, n) {
			continue
		}
		quiet = append(quiet, strconv.Itoa(n))
	}
	if len(quiet) > 0 {
		return errors.New(rel + " lists point " + strings.Join(quiet, ", ") +
			" and nothing discusses it. A session following that line gets the line and none " +
			"of the case a person built out of the sessions that went wrong, and a line with " +
			"nothing behind it is the first one it shaves. Two of this card's ten points sat " +
			"that way. Write a section headed with three hashes, the number, and a period, in " +
			"its place in the ascending run, saying what went wrong when the point was not " +
			"followed.")
	}
	return nil
}

// cardsReachIsACard says whether a written path is a card in the folder the wake
// hands cards out of. The folder is the set, so a second card written tomorrow
// is asked the same question on the same day.
func cardsReachIsACard(rel string) bool {
	at := strings.TrimPrefix(filepath.ToSlash(rel), "./")
	return strings.HasPrefix(at, "src/cage/") && strings.HasSuffix(at, ".md")
}

// A SECTION OF THE DISCUSSION OPENS ON ITS NUMBER, and a listed point is a
// numbered line under the actionables heading.
var (
	cardsReachASection    = regexp.MustCompile(`^###[ \t]+(\d+)\.`)
	cardsReachAListedLine = regexp.MustCompile(`^(\d+)\.[ \t]+\S`)
	cardsReachTheHeading  = regexp.MustCompile(`^##[ \t]+Actionables[ \t]*$`)
	cardsReachAnyHeading  = regexp.MustCompile(`^##[ \t]`)
)

// cardsReachSectionsDiscussed answers the numbers the discussion opens sections
// on, in the order they are written, so the order can be read off them.
func cardsReachSectionsDiscussed(text string) []int {
	var out []int
	for _, line := range cardsReachLines(text) {
		if m := cardsReachASection.FindStringSubmatch(line); m != nil {
			out = append(out, cardsReachNumber(m[1]))
		}
	}
	return out
}

// cardsReachPointsListed answers the numbers listed under the actionables
// heading, once each and in the order they read, and whether the card carries
// that heading at all.
//
// THE BLOCK RUNS TO THE NEXT HEADING OR TO THE END OF THE CARD. It is walked a
// line at a time rather than cut out with a pattern, which is what let the last
// reader end the block on a letter of the alphabet and lose everything after
// it.
func cardsReachPointsListed(text string) ([]int, bool) {
	var out []int
	seen := map[int]bool{}
	inside := false
	hasHeading := false
	for _, line := range cardsReachLines(text) {
		if cardsReachTheHeading.MatchString(line) {
			inside = true
			hasHeading = true
			continue
		}
		if inside && cardsReachAnyHeading.MatchString(line) {
			inside = false
			continue
		}
		if !inside {
			continue
		}
		m := cardsReachAListedLine.FindStringSubmatch(line)
		if m == nil {
			continue
		}
		n := cardsReachNumber(m[1])
		if seen[n] {
			continue
		}
		seen[n] = true
		out = append(out, n)
	}
	return out, hasHeading
}

// cardsReachLines reads the card a line at a time, with the carriage return a
// tree on this box carries taken off the end.
func cardsReachLines(text string) []string {
	var out []string
	for _, line := range strings.Split(text, "\n") {
		out = append(out, strings.TrimSuffix(line, "\r"))
	}
	return out
}

// cardsReachNumber reads a number the patterns have already found, so a number
// too long to hold is answered as none rather than as some other point.
func cardsReachNumber(said string) int {
	n, err := strconv.Atoi(said)
	if err != nil {
		return -1
	}
	return n
}

// cardsReachHolds says whether the discussion opened a section on a number.
func cardsReachHolds(all []int, want int) bool {
	for _, one := range all {
		if one == want {
			return true
		}
	}
	return false
}
