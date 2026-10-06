// The sentinel fires a watch on a matching event, fires a quiet watch once
// its span passes on the fake clock, and runs each reaction.
// [[spec/design_output/failures#the-sentinel-fires-a-watch]]
package failure

import (
	"reflect"
	"testing"
	"time"

	"quackitect/src/modules/clock"
)

var sentinelStart = time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)

var (
	take       = Event{Kind: "tool", Text: "./RUNME.sh branch take work/x"}
	loopNode   = Node{ID: "take-loops", Level: "warn", Remedies: []string{"Read the last answer."}, Watch: &Watch{Event: "tool", Match: "branch take"}}
	stallNode  = Node{ID: "take-stalls", Level: "warn", Remedies: []string{"Take the branch again."}, Watch: &Watch{Event: "tool", Match: "branch take", Quiet: 30}}
	reactsNode = Node{ID: "take-reacts", Level: "error", Remedies: []string{"Hand the branch back."}, Reaction: "branch release", Watch: &Watch{Event: "tool", Match: "branch take"}}
)

type firedIds struct{ ids []string }

func (one *firedIds) hand(raised Raised) { one.ids = append(one.ids, raised.ID) }

func TestAnEventMatchingAWatchFiresItsFailure(t *testing.T) {
	t.Parallel()
	fired := &firedIds{}
	sentinel := NewSentinel(Fake(loopNode), clock.NewFake(sentinelStart), fired.hand, &FakeRunner{})
	sentinel.Hear(take)
	sentinel.Hear(Event{Kind: "tool", Text: "git status"})
	sentinel.Hear(Event{Kind: "prompt", Text: "branch take"})
	if want := []string{"take-loops"}; !reflect.DeepEqual(fired.ids, want) {
		t.Fatalf("the sentinel fires %q, want %q", fired.ids, want)
	}
}

func TestAQuietSpanFiresOnceAndAMatchingEventArmsItAgain(t *testing.T) {
	t.Parallel()
	fired := &firedIds{}
	fake := clock.NewFake(sentinelStart)
	sentinel := NewSentinel(Fake(stallNode), fake, fired.hand, &FakeRunner{})
	fake.Tick(20 * time.Minute)
	sentinel.Hear(take)
	fake.Tick(20 * time.Minute)
	if len(fired.ids) != 0 {
		t.Fatalf("the sentinel fires %q inside the quiet span a matching event arms", fired.ids)
	}
	fake.Tick(10 * time.Minute)
	fake.Tick(60 * time.Minute)
	if want := []string{"take-stalls"}; !reflect.DeepEqual(fired.ids, want) {
		t.Fatalf("the sentinel fires %q once the span passes, want %q", fired.ids, want)
	}
	sentinel.Hear(take)
	fake.Tick(30 * time.Minute)
	if want := []string{"take-stalls", "take-stalls"}; !reflect.DeepEqual(fired.ids, want) {
		t.Fatalf("the sentinel fires %q after a matching event arms it again, want %q", fired.ids, want)
	}
}

func TestAFiredFailureRunsItsReaction(t *testing.T) {
	t.Parallel()
	fired := &firedIds{}
	runner := &FakeRunner{}
	sentinel := NewSentinel(Fake(reactsNode, loopNode), clock.NewFake(sentinelStart), fired.hand, runner)
	sentinel.Hear(take)
	if want := []string{"branch release"}; !reflect.DeepEqual(runner.Lines, want) {
		t.Fatalf("the sentinel runs %q, want %q", runner.Lines, want)
	}
}
