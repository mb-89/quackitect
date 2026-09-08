package main

import (
	"strings"
	"testing"
	"time"
)

// THE FILE IS READ BY SOMETHING WITH NO ENGINE, AND THREE RULES MAKE IT
// READABLE BY SOMETHING DUMB.
//
// No entry means free, lapses is an absolute stamp, and a finished thing carries
// no lease. Each of them is planted here beside the case that must not be
// refused, because a reader that answers no to everything passes a planted case
// for the wrong reason.

func TestNoEntryMeansAGroupIsFree(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	now := mustTime(t, "2026-09-08T12:00:00Z")
	live := now.Add(2 * time.Hour).UTC().Format(ClaimStamp)

	// THE CLEAN CASE: a file naming another group and saying nothing about this
	// one. Absence is the default, so this group is workable.
	have := TheGroups{"group/tests": {State: GroupHeld, By: "another-box", Lapses: live}}
	if why := whyTheGroupIsNotWorkable(t.Context(), r, have, "group/voice", now); why != "" {
		t.Errorf("a group with no entry was refused: %s", why)
	}

	// THE PLANTED CASE: the same file with an entry for this group, held now.
	have["group/voice"] = GroupEntry{State: GroupHeld, By: "another-box", Lapses: live}
	why := whyTheGroupIsNotWorkable(t.Context(), r, have, "group/voice", now)
	if why == "" {
		t.Fatal("a group another box holds was offered as workable")
	}
	if !strings.Contains(why, "another-box") {
		t.Errorf("the refusal does not name who holds it: %s", why)
	}
}

// A LAPSED ENTRY IS AS GOOD AS NONE, which is what frees a group from a box that
// never came back.
func TestALapsedEntryIsAsGoodAsNone(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	now := mustTime(t, "2026-09-08T12:00:00Z")

	// THE PLANTED CASE: a lease that ran out a minute ago.
	over := TheGroups{"group/voice": {State: GroupHeld, By: "another-box",
		Lapses: now.Add(-time.Minute).UTC().Format(ClaimStamp)}}
	if why := whyTheGroupIsNotWorkable(t.Context(), r, over, "group/voice", now); why != "" {
		t.Errorf("a lapsed hold still keeps a box off the group: %s", why)
	}

	// THE CLEAN CASE: the same entry with a minute left on it.
	standing := TheGroups{"group/voice": {State: GroupHeld, By: "another-box",
		Lapses: now.Add(time.Minute).UTC().Format(ClaimStamp)}}
	if why := whyTheGroupIsNotWorkable(t.Context(), r, standing, "group/voice", now); why == "" {
		t.Error("a hold with a minute left on it was read as free")
	}

	// AND A STAMP FROM A CLOCK RUNNING DAYS FAST IS NOT HONOURED, because every
	// later read would clamp it again and the group would never come back.
	fast := TheGroups{"group/voice": {State: GroupHeld, By: "another-box",
		Lapses: now.Add(48 * time.Hour).UTC().Format(ClaimStamp)}}
	if why := whyTheGroupIsNotWorkable(t.Context(), r, fast, "group/voice", now); why != "" {
		t.Errorf("a hold stamped two days out held the group: %s", why)
	}
}

// A LEASE EXPIRES AND A FINISHED THING DOES NOT BECOME UNFINISHED.
func TestDoneAndBlockedCarryNoLapses(t *testing.T) {
	t.Parallel()
	now := mustTime(t, "2026-09-08T12:00:00Z").Format(ClaimStamp)

	// THE CLEAN CASE: a held entry carries the lease, so the field is not simply
	// missing from every entry this writer makes.
	held := theGroupsText(TheGroups{"group/voice": {State: GroupHeld, By: "cloud-7", Lapses: now}})
	if !strings.Contains(held, "lapses") {
		t.Fatalf("a held group carries no lease, so nothing ever frees it:\n%s", held)
	}
	if !strings.Contains(held, now) {
		t.Errorf("the lease is not the absolute stamp the writer resolved:\n%s", held)
	}

	// THE PLANTED CASES.
	for _, e := range []GroupEntry{
		{State: GroupDone, By: "cloud-3", At: now},
		{State: GroupBlocked, By: "cloud-2", Why: "a token needs a person"},
	} {
		text := theGroupsText(TheGroups{"group/voice": e})
		if strings.Contains(text, "lapses") {
			t.Errorf("a %s group carries a lease, so a finished thing becomes unfinished:\n%s", e.State, text)
		}
	}
}

// A PERSON TYPES voice AND A SCHEDULER READS refs/heads/group/voice, and both
// mean one group.
func TestAGroupIsNamedOneWayHoweverItIsTyped(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]string{
		"voice":                   "group/voice",
		"group/voice":             "group/voice",
		"refs/heads/group/voice":  "group/voice",
		"origin/group/voice":      "group/voice",
		"  group/voice  ":         "group/voice",
		"":                        "",
		"   ":                     "",
	} {
		if got := aGroupName(said); got != want {
			t.Errorf("%q names the group %q, and it should name %q", said, got, want)
		}
	}
}
