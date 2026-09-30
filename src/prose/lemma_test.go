// The lemma reads the exception list over golem, and a word golem misses
// sheds its ending. The domain words read the vocabulary lists.
// [[spec/tickets/prose-shadow-hooks-reads-text]]
package prose

import "testing"

func TestTheExceptionListWinsOverGolem(t *testing.T) {
	for form, lemma := range Exceptions() {
		if said := Lemma(form); said != lemma {
			t.Fatalf("%s reads %s, and the exception list names %s", form, said, lemma)
		}
	}
	if said := Lemma("Found"); said != "find" {
		t.Fatalf("Found reads %s, and wants find", said)
	}
}

func TestAWordGolemMissesShedsItsEnding(t *testing.T) {
	for word, want := range map[string]string{"zorbed": "zorb", "zorbing": "zorb", "glass": "glass", "ok": "ok"} {
		if said := byEndings(word); said != want {
			t.Fatalf("%s sheds to %s, and wants %s", word, said, want)
		}
	}
}

func TestTheDomainWordsLeaveEverySwappedWord(t *testing.T) {
	core := "- {word: gate, means: a step a reviewer reads}\n"
	terms := "- {word: \"work branch\", means: 'the branch, a group'}\n"
	swaps := "- {word: branch, write: limb}\n"
	words := Words(core, terms, swaps)
	for _, want := range []string{"gate", "work"} {
		if !words[want] {
			t.Fatalf("the domain words %v leave out %s", words, want)
		}
	}
	if words["branch"] {
		t.Fatalf("the domain words %v keep branch, which the swaps list takes", words)
	}
}
