// The batch framing and the tree names git answers.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"slices"
	"testing"
)

// The batch reads a header a line, then the payload, and an ask git misses reads empty. [[spec/design_output/work#the-listing-reads-git-once]]
func TestTheBatchReadsEachAskByItsSize(t *testing.T) {
	stream := "aaa blob 5\nhello\nmain:x missing\nbbb blob 2\nhi\n"
	said := framed(stream, []string{"one", "two", "three"})
	if said["one"] != "hello" || said["two"] != "" || said["three"] != "hi" {
		t.Fatalf("the batch reads %v", said)
	}
}

// A raw tree reads a name between its mode and its zero byte. [[spec/design_output/work#the-listing-reads-git-once]]
func TestARawTreeReadsItsNames(t *testing.T) {
	object := string(make([]byte, nameBytes))
	tree := "100644 a.md\x00" + object + "100644 b.md\x00" + object
	if got := namesIn(tree); !slices.Equal(got, []string{"a.md", "b.md"}) {
		t.Fatalf("the tree names %v", got)
	}
}

// A ref row reads its branch past origin, its tip and its time. [[spec/design_output/work#the-listing-reads-git-once]]
func TestARefRowReadsItsFields(t *testing.T) {
	said := refsIn("origin/work/a abc 100\n\norigin/work/b def 7", map[string]bool{"work/b": true})
	if len(said) != 2 || said[0].Branch != "work/a" || said[0].When != 100 || said[0].Merged || !said[1].Merged {
		t.Fatalf("the refs read %+v", said)
	}
}
