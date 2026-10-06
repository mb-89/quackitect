// The switch, ported off test/level0/work-switch.test.js: a group naming a
// config key under enabled_by waits while trunk's tracked config reads it
// anything but true, so the take, the list and the trigger pass it over.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"
)

// The key the switched group names. [[spec/tickets/work-verbs-port-to-go]]
const pdSwitchKey = "migration.phase2switch"

// The tracked config with the switch at a value. [[spec/tickets/work-verbs-port-to-go]]
func pdShared(value string) string {
	return `{"migration": {"phase2switch": ` + value + `}}`
}

// Two free groups each holding a child a hand takes: work/a-switched names the switch, and work/b-free names none. An empty config leaves trunk's file out. [[spec/tickets/work-verbs-port-to-go]]
func pdTwoGroups(t *testing.T, config string) *tree {
	t.Helper()
	files := map[string]string{}
	if config != "" {
		files[trackedConfig] = config
	}
	one := newTree(t, files)
	one.branch("a-switched", map[string]string{
		ticketAt("a-switched"): pdUnderKind(groupNote, switchField+": "+pdSwitchKey),
		ticketAt("a-child"):    strings.Replace(childNote, "group: g", "group: a-switched", 1),
	})
	one.branch("b-free", map[string]string{
		ticketAt("b-free"):  groupNote,
		ticketAt("b-child"): strings.Replace(childNote, "group: g", "group: b-free", 1),
	})
	return one
}

// Whether origin's copy of a group carries an open claim. [[spec/tickets/work-verbs-port-to-go]]
func pdClaimed(one *tree, name string) bool {
	return heldIn(one.d.textAt("origin/"+workBranch+name, ticketAt(name))) != nil
}

// A take passes over a group whose switch reads false on trunk, and claims the next. [[spec/tickets/work-verbs-port-to-go]]
func TestPDTakePassesOverASwitchedGroup(t *testing.T) {
	t.Parallel()
	one := pdTwoGroups(t, pdShared("false"))
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if pdClaimed(one, "a-switched") {
		t.Fatal("the take claims the switched group")
	}
	if !pdClaimed(one, "b-free") {
		t.Fatalf("the take leaves b-free unclaimed: %s", one.out.String())
	}
}

// A switch reading true on trunk frees its group for the take. [[spec/tickets/work-verbs-port-to-go]]
func TestPDATrueSwitchFreesItsGroup(t *testing.T) {
	t.Parallel()
	one := pdTwoGroups(t, pdShared("true"))
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if !pdClaimed(one, "a-switched") {
		t.Fatalf("the take leaves the freed group unclaimed: %s", one.out.String())
	}
}

// A switch this box alone turns on, in its local file or its environment, frees nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPDALocalSwitchFreesNothing(t *testing.T) {
	t.Parallel()
	one := pdTwoGroups(t, pdShared("false"))
	one.write(map[string]string{runtimeFolder + "/config.json": pdShared("true")})
	one.d.Env["SE_MIGRATION_PHASE2SWITCH"] = "true"
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if pdClaimed(one, "a-switched") {
		t.Fatal("a local switch frees the group")
	}
}

// A switch the tracked config on trunk lacks reads as off. [[spec/tickets/work-verbs-port-to-go]]
func TestPDAMissingSwitchReadsOff(t *testing.T) {
	t.Parallel()
	one := pdTwoGroups(t, "")
	one.branchSays("take")
	if pdClaimed(one, "a-switched") {
		t.Fatal("a switch trunk lacks frees the group")
	}
}

// The list says a switched group waits for its key to read true, and the other waits for nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPDTheListNamesTheSwitch(t *testing.T) {
	t.Parallel()
	one := pdTwoGroups(t, pdShared("false"))
	if code := one.branchSays("list"); code != codeOK {
		t.Fatalf("list answers %d: %s", code, one.errs.String())
	}
	var switched, free string
	for _, row := range strings.Split(one.out.String(), "\n") {
		switch {
		case strings.HasPrefix(row, "work/a-switched"):
			switched = row
		case strings.HasPrefix(row, "work/b-free"):
			free = row
		}
	}
	holds(t, switched, "waits for "+pdSwitchKey+" to read true")
	if free == "" || strings.Contains(free, "waits for") {
		t.Fatalf("the free row reads %q", free)
	}
}

// The trigger counts a switched group nowhere among the free ones. [[spec/tickets/work-verbs-port-to-go]]
func TestPDTheTriggerSkipsTheSwitchedGroup(t *testing.T) {
	t.Parallel()
	one := pdTwoGroups(t, pdShared("false"))
	one.out.Reset()
	Cloud(one.d, []string{"trigger"})
	said := one.out.String()
	if strings.Contains(said, "work/a-switched") {
		t.Fatalf("the trigger counts the switched group: %s", said)
	}
	holds(t, said, "work/b-free")
}

// A switch reads true alone, and a key the shared config lacks reads off. [[spec/tickets/work-verbs-port-to-go]]
func TestPDShutByReadsTrueAlone(t *testing.T) {
	t.Parallel()
	text := pdUnderKind(pdGroupNote, switchField+": "+pdSwitchKey)
	cases := []struct {
		shared map[string]any
		want   string
	}{
		{map[string]any{pdSwitchKey: true}, ""},
		{map[string]any{pdSwitchKey: false}, pdSwitchKey},
		{map[string]any{pdSwitchKey: "true"}, pdSwitchKey},
		{map[string]any{}, pdSwitchKey},
	}
	for _, one := range cases {
		if said := shutBy(text, one.shared); said != one.want {
			t.Fatalf("shutBy over %v answers %q", one.shared, said)
		}
	}
	if said := shutBy(pdGroupNote, map[string]any{}); said != "" {
		t.Fatalf("a group naming no key waits on %q", said)
	}
}

// A branch waits for the groups it names first, then for its switch. [[spec/tickets/work-verbs-port-to-go]]
func TestPDWaitsOfNamesGroupsThenTheSwitch(t *testing.T) {
	t.Parallel()
	ticket := pdUnderKind(pdGroupNote, "depends_on: [before]")
	standing := map[string]string{workBranch + "before": todo}
	said := waitsOf(stand{Ticket: ticket, Shut: pdSwitchKey}, standing, nil)
	if strings.Join(said, "|") != "before|"+pdSwitchKey+" to read true" {
		t.Fatalf("waitsOf answers %v", said)
	}
	if said := waitsOf(stand{Ticket: pdGroupNote}, standing, nil); len(said) != 0 {
		t.Fatalf("a free group waits on %v", said)
	}
}
