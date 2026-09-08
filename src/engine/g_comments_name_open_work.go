package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// A COMMENT THAT POINTS AT WORK STILL TO COME POINTS AT AN OPEN TOKEN.
//
// A door in this engine said that a token carried making an absent record a
// refusal, and that token had already closed deferring it. A reader who follows
// the pointer finds a closed note and no work. The sentence in the code is a
// promise nobody is keeping, and the fix was to point it at a token that is open.
//
// THE RULE THIS REPLACES ASKED GIT, AND GIT ANSWERS THE WRONG QUESTION. It took
// every id written in a Go file under src. It asked which commit first put that
// line there, and it failed wherever the commit's subject named the same id.
// Over one tip of the branch it looked at 24 pairs and failed 7.
//
// SIX OF THE SEVEN WERE PROVENANCE A READER WANTS. One of them says "See" and
// then an id, and the commit that put the line there is that token's own. The
// code points at the evidence that explains it, and five more files carry the
// same shape. A rule built on git reddens the battery over six deliberate
// comments.
//
// SO THE SENTENCE DECIDES, AND THE TENSE IS THE SIGNAL. "wk-1111111111 carried
// an ask of 249 words" is history. "wk-1111111111 carries making an absent
// record a refusal" is a promise. One verb apart, and only the second can be
// broken by the token ending.
//
// AND THE RECORD SAYS WHAT ENDED, BECAUSE GIT CANNOT. A note on the disk
// carries its own disposition, and the archive list carries a row for every
// token that has closed and been swept.
//
// AN ID THE RECORD DOES NOT KNOW IS LEFT ALONE. The archive carried 127 ids
// when this was measured, and eight ids written in src were in neither it nor
// the tracked folder. Nothing here can tell an id lost from the archive from
// one that never existed. Calling an unknown id ended would fail this door on
// the archive's defect rather than on the comment's.
func aCommentPromisingWorkOnAnEndedToken(r Roots, _ bool, rel, text string) error {
	rel = filepath.ToSlash(rel)
	if !commentsNameWorkReadsThisFile(rel) {
		return nil
	}
	made := commentsNameWorkPromisesIn(text)
	if len(made) == 0 {
		return nil
	}
	// THE LIST IS READ ONCE FOR THE WHOLE FILE, and a tree without one decides
	// on the notes alone. A door that refused every write on a fresh clone would
	// be a wall rather than a door.
	said, _ := os.ReadFile(ArchiveList(r))
	swept := theIDsThisArchiveNames(string(said))
	for _, one := range made {
		how, known := commentsNameWorkTheRecordSays(r, one.id, swept)
		// AN ID THE RECORD DOES NOT KNOW IS LEFT ALONE, and so is an open one.
		if !known || how == "" {
			continue
		}
		return fmt.Errorf("%s line %d says %q, and the record says that token has ended as %s. "+
			"A present-tense verb promises work still to come. The reader who follows this "+
			"pointer finds a closed note and no work. That is how a door here came to promise "+
			"a refusal its own token had closed deferring. Name a token that is open, or write "+
			"the sentence in the past tense. Past tense reads as provenance, and a close cannot "+
			"break it.",
			rel, one.line, one.id+" "+one.verb, how)
	}
	return nil
}

// commentsNameWorkReadsThisFile answers whether a written path is one this rule
// reads. It is the source under src that a reader opens.
//
// A TEST IS LEFT OUT BECAUSE A TEST NAMES NO TOKEN AT ALL. Another door here
// refuses an id from the record in a test file outright, so a promise cannot be
// written into one to begin with.
func commentsNameWorkReadsThisFile(rel string) bool {
	return strings.HasPrefix(rel, "src/") && strings.HasSuffix(rel, ".go") &&
		!strings.HasSuffix(rel, "_test.go")
}

// THE PROMISE VERBS ARE THE TREE'S OWN, and not a list of every word English
// has for this. Measured over src, the tree writes carries in three files and
// settles in one. The rest below are the same promise in another word. A
// promise made in a verb outside this set is a miss rather than a false alarm,
// which is the direction this door exists to hold.
//
// EVERY PAST FORM IS ABSENT ON PURPOSE. Carried, settled, held, took, brought,
// finished and covered are history, and history is not broken by a close.
var commentsNameWorkPromiseVerbs = map[string]bool{
	"carries": true, "carry": true,
	"settles": true, "settle": true,
	"holds": true, "hold": true,
	"takes": true, "take": true,
	"brings": true, "bring": true,
	"finishes": true, "finish": true,
	"covers": true, "cover": true,
}

// commentsNameWorkAnID finds an id the way the record writes one.
var commentsNameWorkAnID = regexp.MustCompile(`wk-[0-9a-f]{10}`)

// commentsNameWorkAComment says whether a line is a comment.
// commentsNameWorkTheSlashes takes the marker off to leave the prose, and
// commentsNameWorkTheFirstWord reads the word a sentence carries on with.
var (
	commentsNameWorkAComment     = regexp.MustCompile(`^\s*//`)
	commentsNameWorkTheSlashes   = regexp.MustCompile(`^\s*//\s?`)
	commentsNameWorkTheFirstWord = regexp.MustCompile(`^[\s",.;:)\]]*([A-Za-z][A-Za-z-]*)`)
)

// commentsNameWorkPromise is one mention this door ruled a promise, with the
// line it stands on so the refusal can name it.
type commentsNameWorkPromise struct {
	id   string
	verb string
	line int
}

// commentsNameWorkPromisesIn answers every mention in the text whose verb makes
// a promise about work still to come.
func commentsNameWorkPromisesIn(text string) []commentsNameWorkPromise {
	lines := strings.Split(text, "\n")
	var out []commentsNameWorkPromise
	for n, line := range lines {
		if !commentsNameWorkAComment.MatchString(line) {
			continue // an id in code is not a sentence a reader follows
		}
		for _, at := range commentsNameWorkAnID.FindAllStringIndex(line, -1) {
			verb := commentsNameWorkTheWordAfter(lines, n, line[at[1]:])
			if !commentsNameWorkPromiseVerbs[verb] {
				continue // past tense is history, and a bare citation promises nothing
			}
			out = append(out, commentsNameWorkPromise{id: line[at[0]:at[1]], verb: verb, line: n + 1})
		}
	}
	return out
}

// commentsNameWorkTheWordAfter answers the first word following an id, reading
// on into the comment lines that continue the sentence.
//
// ONE FILE IN THE TREE PUTS THE ID AT THE END OF A LINE and its verb at the
// start of the next. A rule reading a single line would call that sentence
// silent and let the one shape it exists for through.
func commentsNameWorkTheWordAfter(lines []string, at int, rest string) string {
	text := rest
	for i := at + 1; i < len(lines) && strings.TrimSpace(text) == ""; i++ {
		if !commentsNameWorkAComment.MatchString(lines[i]) {
			break // the comment ended, so nothing continues the sentence
		}
		text += " " + commentsNameWorkTheSlashes.ReplaceAllString(lines[i], "")
	}
	word := commentsNameWorkTheFirstWord.FindStringSubmatch(text)
	if word == nil {
		return ""
	}
	return strings.ToLower(word[1])
}

// commentsNameWorkTheRecordSays answers how the record ended a token, and
// whether the record knows the id at all. An empty word with known set means
// the record carries the token and the work is still to come.
//
// IT READS THE DISPOSITION AND NEVER THE STATE. The states are each process's
// own words, so a rule spelling one of them out goes quiet on a process that
// names its states differently. Ended is the engine's own reader, and it asks
// what became of the work rather than which step it stands on.
func commentsNameWorkTheRecordSays(r Roots, id string, swept map[string]string) (string, bool) {
	if said, err := os.ReadFile(filepath.Join(TrackedDir(r), id+".md")); err == nil {
		t, err := noteToken(string(said), id)
		if err != nil || !t.Ended() {
			// A NOTE NOBODY CAN READ IS STILL A NOTE ON THE DISK. The reader who
			// follows the pointer opens a page, and that is what this is about.
			return "", true
		}
		return string(t.Disposition), true
	}
	if how, yes := swept[id]; yes {
		return how, true
	}
	return "", false
}
