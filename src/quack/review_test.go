// The review seam reads the verb's newest material line, or says why none stands.
// [[spec/tickets/review-spawns-off-the-door]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheSeamReadsTheNewestMaterialLine(t *testing.T) {
	t.Parallel()
	printed := "gathering\n{\"branch\":\"work/old\"}\r\n{\"branch\":\"work/a-group\",\"retro\":true}\n{not json\n"
	material, why := gatheredOf(printed, "")
	if why != "" || material.Branch != "work/a-group" || !material.Retro {
		t.Errorf("the seam reads %+v and %q, and wants work/a-group with its retro", material, why)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheSeamSaysWhyItGatheredNothing(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ stdout, stderr, want string }{
		{"usage\n", " no such branch \n", "no such branch"},
		{" usage \n", "", "usage"},
		{"", "", saidNothing},
	} {
		if _, why := gatheredOf(one.stdout, one.stderr); why != one.want {
			t.Errorf("the seam says %q over %q and %q, and wants %q", why, one.stdout, one.stderr, one.want)
		}
	}
}
