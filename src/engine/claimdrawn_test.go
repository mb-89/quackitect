package main

import (
	"testing"
	"time"
)

// THE CLAIM IS A COLUMN, BECAUSE IT IS THE ONE THING THAT KEEPS TWO BOXES OFF
// ONE TOKEN.
//
// It is written on the token as claimed_by and no view drew it, so a person
// could see what this box had taken, or what another box had, only by running
// se claim --list at a prompt.
//
// THE ROW CARRIES THE STANDING CLAIM AND NOT THE FIELD. A claim made here is on
// the note and one made elsewhere reached this box through git, so a row that
// read the field alone would draw another box's token as free.
func TestARowCarriesTheClaim(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	mine := mintStandard(t, r, "claimed on this box")
	elsewhere := mintUnclaimed(t, r, "claimed on another")
	free := mintUnclaimed(t, r, "claimed by nobody")

	// WHAT ANOTHER BOX PUBLISHED, in the store the sync writes.
	saveFarClaims(r, TheFarClaims{Claims: map[string]FarClaim{
		elsewhere.ID: {By: "0b0b0b0b/worker-far", At: time.Now().UTC().Format(ClaimStamp)},
	}})

	rows := map[string]string{}
	for _, row := range TokenRows(r) {
		rows[row["id"].S] = row["claimed_by"].S
	}

	if got, want := rows[mine.ID], Claimant(r, "main"); got != want {
		t.Errorf("the token this box claimed draws %q, and this box is %q", got, want)
	}
	if got, want := rows[elsewhere.ID], "0b0b0b0b/worker-far"; got != want {
		t.Errorf("a token another box claimed draws %q, and that box wrote %q", got, want)
	}
	if got := rows[free.ID]; got != "" {
		t.Errorf("a token nobody claimed draws %q", got)
	}
}
