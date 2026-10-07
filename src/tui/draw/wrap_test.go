// A wrapped value lines up under itself, and a half-typed filter says it is
// still typing. The cases moved here from the log tab, which reads both.
// [[spec/design_output/tui#the-filter-language]]
package draw_test

import (
	"errors"
	"strings"
	"testing"

	"quackitect/src/tui/draw"
)

func TestAWrappedValueLinesUpUnderItself(t *testing.T) {
	t.Parallel()
	said := draw.Wrap("tool  "+strings.Repeat("abc ", 10), 20)
	for at, line := range strings.Split(said, "\n") {
		if at > 0 && !strings.HasPrefix(line, "      ") {
			t.Fatalf("a continuation starts under the value at column 6, and read %q", line)
		}
		if len([]rune(line)) > 20 {
			t.Fatalf("no line runs past 20, and %q does", line)
		}
	}
}

func TestAWrapLinesUpUnderAValueACharacterWiderThanAByte(t *testing.T) {
	t.Parallel()
	lines := strings.Split(draw.Wrap("  1…9        open the tab at that place and the next one too", 40), "\n")
	if len(lines) < 2 {
		t.Fatalf("a long line wraps, and reads %v", lines)
	}
	under := len([]rune(lines[0][:strings.Index(lines[0], "open")]))
	if got := len([]rune(lines[1])) - len([]rune(strings.TrimLeft(lines[1], " "))); got != under {
		t.Fatalf("the rest lines up under the value at %d, and stands at %d", under, got)
	}
}

func TestAHalfFilterIsStillTypingAndABadPatternSaysSo(t *testing.T) {
	t.Parallel()
	for _, said := range []string{`"open`, "/open", "(a or", "kind:", "a and"} {
		if _, err := draw.ParseFilter(said); !errors.Is(err, draw.ErrIncomplete) {
			t.Fatalf("%q is still typing, and read %v", said, err)
		}
	}
	if _, err := draw.ParseFilter("/[a/"); err == nil || errors.Is(err, draw.ErrIncomplete) {
		t.Fatalf("a pattern that fails to compile says so, and read %v", err)
	}
}
