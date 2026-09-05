package main

import (
	"os"
	"strings"
	"testing"
)

// A LONG OUTPUT IS PAGED, NOT TRUNCATED. Nothing is lost.
//
// The first answer cut the head off and kept the tail, and the dropped bytes
// went nowhere: a build that printed a hundred errors answered with the last
// few and the agent could not go and look, because there was nowhere to look.
func TestALongOutputIsKeptWholeAndPaged(t *testing.T) {
	t.Parallel()
	r := aTreeToRunIn(t)

	// Enough lines to run past several windows, each one numbered so a window
	// can say where in the output it came from.
	got, err := Run(r, `awk 'BEGIN{for(i=1;i<=6000;i++) printf "line %06d padded out to make it longer\n", i}'`)
	if err != nil {
		t.Fatal(err)
	}
	if got.Exit != 0 {
		t.Fatalf("the command failed: exit %d, %.200s", got.Exit, got.Output)
	}
	if got.Bytes <= ThePageSize {
		t.Skipf("this machine's awk wrote %d bytes, which is not long enough to page", got.Bytes)
	}
	if len(got.Output) != ThePageSize || !got.More || got.Page == "" {
		t.Fatalf("the first window is %d bytes, more=%v page=%q", len(got.Output), got.More, got.Page)
	}
	if !strings.Contains(got.Output, "line 000001") {
		t.Error("the first window does not start at the start")
	}

	// EVERY WINDOW, END TO END, IS THE WHOLE OUTPUT. This is the property that
	// says nothing was dropped, and it is the one truncation cannot have.
	var whole strings.Builder
	for from := 0; ; {
		page, err := ReadPage(r, got.Page, from)
		if err != nil {
			t.Fatal(err)
		}
		whole.WriteString(page.Output)
		if !page.More {
			break
		}
		from += len(page.Output)
	}
	if whole.Len() != got.Bytes {
		t.Errorf("paging through answered %d bytes where the output was %d", whole.Len(), got.Bytes)
	}
	if !strings.Contains(whole.String(), "line 006000") {
		t.Error("the last line is not in what paging answered")
	}
}

// FROM COUNTS BACK FROM THE END WHEN IT IS NEGATIVE, because the reason to page
// a build log is usually to read how it ended.
func TestAPageCanBeAskedForFromTheEnd(t *testing.T) {
	t.Parallel()
	r := aTreeToRunIn(t)
	got, err := Run(r, `awk 'BEGIN{for(i=1;i<=6000;i++) printf "line %06d padded out to make it longer\n", i}'`)
	if err != nil {
		t.Fatal(err)
	}
	if got.Page == "" {
		t.Skip("this machine's awk wrote too little to page")
	}
	tail, err := ReadPage(r, got.Page, -200)
	if err != nil {
		t.Fatal(err)
	}
	if tail.More {
		t.Error("a window taken from the end says there is more after it")
	}
	if !strings.Contains(tail.Output, "line 006000") {
		t.Errorf("the last window does not hold the last line: %q", tail.Output)
	}
}

// A SHORT OUTPUT IS KEPT NOWHERE, so the folder does not fill with one file per
// command that printed a line.
func TestAShortOutputIsNotKept(t *testing.T) {
	t.Parallel()
	r := aTreeToRunIn(t)
	got, err := Run(r, "echo the whole answer")
	if err != nil {
		t.Fatal(err)
	}
	if got.Page != "" || got.More {
		t.Errorf("a one-line output was paged: page=%q more=%v", got.Page, got.More)
	}
	if !strings.Contains(got.Output, "the whole answer") {
		t.Errorf("it answered %q", got.Output)
	}
	if _, err := os.Stat(outDir(r)); err == nil {
		if kept, _ := os.ReadDir(outDir(r)); len(kept) > 0 {
			t.Errorf("%d output file(s) were written for a short answer", len(kept))
		}
	}
}

// AN EXIT CODE IS ANSWERED, because a command that failed and one that printed
// nothing look the same without it.
func TestAFailingCommandAnswersItsExitCode(t *testing.T) {
	t.Parallel()
	r := aTreeToRunIn(t)
	got, err := Run(r, "exit 3")
	if err != nil {
		t.Fatal(err)
	}
	if got.Exit != 3 {
		t.Errorf("it answered exit %d", got.Exit)
	}
}

// A PAGE NAME IS NOT A PATH. Reading one names no token, so it must not be a
// way to read a file the gate would have refused.
func TestAPageNameCannotLeaveTheFolder(t *testing.T) {
	t.Parallel()
	r := aTreeToRunIn(t)
	for _, name := range []string{
		"../../../etc/passwd",
		`..\..\secrets`,
		"a/b",
		"C:/Windows/win",
	} {
		if _, err := ReadPage(r, name, 0); err == nil {
			t.Errorf("%q was read", name)
		}
	}
}
