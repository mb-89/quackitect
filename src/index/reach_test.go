// A caller from another build, the window among them, meets the door the
// tree's index stands, and keeps it.
// [[spec/design_output/index#a-door-comes-back]]
package index // level0: InPackageTest - it drives the unexported stands, stampOf and startingPath

import (
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"quackitect/src/q"
)

// A build of the tree's index, which no case runs, so its stamp stands apart from the test binary's. [[spec/design_output/index#a-door-comes-back]]
func builtIndex(t *testing.T, root, body string) string {
	t.Helper()
	bin := indexBinary(root)
	if err := os.MkdirAll(filepath.Dir(bin), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(bin, []byte(body), 0o755); err != nil {
		t.Fatal(err)
	}
	return bin
}

// A door that answers every call and names each method it hears. [[spec/design_output/index#a-door-comes-back]]
func heardDoor(t *testing.T) (*httptest.Server, func() []string) {
	t.Helper()
	var guard sync.Mutex
	var heard []string
	door := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var said call
		json.NewDecoder(r.Body).Decode(&said)
		guard.Lock()
		heard = append(heard, said.Method)
		guard.Unlock()
		writes(w, answer{Result: map[string]any{"method": said.Method}, ID: said.ID})
	}))
	t.Cleanup(door.Close)
	return door, func() []string {
		guard.Lock()
		defer guard.Unlock()
		return append([]string(nil), heard...)
	}
}

func standsAt(t *testing.T, root string, said Standing) {
	t.Helper()
	body, err := json.Marshal(said)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Dir(standingPath(root)), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(standingPath(root), body, 0o644); err != nil {
		t.Fatal(err)
	}
}

// A spawn that names the binary it runs, and stands the door again where the case hands one. [[spec/design_output/index#a-door-comes-back]]
// level0: RunsAlone - it swaps the package's spawns, which every start beside it reads
func fakeSpawn(t *testing.T, again func(root string)) func() []string {
	t.Helper()
	var ran []string
	was := spawns
	spawns = func(bin, root string) error {
		ran = append(ran, bin)
		if again != nil {
			again(root)
		}
		return nil
	}
	t.Cleanup(func() { spawns = was })
	return func() []string { return ran }
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestAClientKeepsTheDoorTheTreesIndexStands(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	self, _ := os.Executable()
	if stampOf(bin) == stampOf(self) {
		t.Fatal("the case needs a build apart from the caller's")
	}
	if !stands(Standing{Root: root, Stamp: stampOf(bin)}, root) {
		t.Fatal("a caller from another build stands a fresh door aside")
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestARebuiltIndexLeavesItsDoorStale(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	bin := builtIndex(t, root, "the old build")
	stamp := stampOf(bin)
	builtIndex(t, root, "the new build, longer than the old")
	if stands(Standing{Root: root, Stamp: stamp}, root) {
		t.Fatal("a door from the old build stands after the index rebuilt")
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestAStartRunsTheTreesIndexAndNeverTheCaller(t *testing.T) {
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	ran := fakeSpawn(t, func(root string) {
		standsAt(t, root, Standing{Port: 1, Root: root, Stamp: stampOf(bin)})
	})
	if err := starts(root); err != nil {
		t.Fatal(err)
	}
	if got := ran(); len(got) != 1 || got[0] != bin {
		t.Fatalf("a start runs %q, where the tree's index stands at %q", got, bin)
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestAClientReachesALiveDoorAndStopsNothing(t *testing.T) {
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	door, heard := heardDoor(t)
	port := door.Listener.Addr().(*net.TCPAddr).Port
	live := Standing{Port: port, Pid: 1, Root: root, Stamp: stampOf(bin)}
	standsAt(t, root, live)
	ran := fakeSpawn(t, func(root string) { standsAt(t, root, live) })

	if _, err := reaches(root, []string{"standing"}); err != nil {
		t.Fatal(err)
	}
	if got := heard(); len(got) != 1 || got[0] != "standing" {
		t.Fatalf("the live door hears %q, where a client asks one question", got)
	}
	if got := ran(); len(got) != 0 {
		t.Fatalf("a client starts %q beside a live door", got)
	}
}

// A serve meets the live door on its build and stands no second one, and a door on another build hears a stop and stands live no more. [[spec/tickets/process-shadow-reads-clean]]
// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestAServeBesideALiveDoorStandsNone(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	door, heard := heardDoor(t)
	port := door.Listener.Addr().(*net.TCPAddr).Port
	standsAt(t, root, Standing{Port: port, Pid: 1, Root: root, Stamp: stampOf(bin)})
	if _, live := liveDoor(root); !live {
		t.Fatal("a serve reads the live door on its build as gone")
	}
	standsAt(t, root, Standing{Port: port, Pid: 1, Root: root, Stamp: "another build"})
	if _, live := liveDoor(root); live {
		t.Fatal("a serve reads a door on another build as live")
	}
	standsAt(t, root, Standing{Port: port, Pid: pidOf(), Root: root, Stamp: stampOf(bin)})
	if _, live := liveDoor(root); live {
		t.Fatal("a serve reads the file naming itself as another live door")
	}
	if got := heard(); len(got) != 2 || got[0] != "standing" || got[1] != "stop" {
		t.Fatalf("the doors hear %q, and want a standing, then a stop for the other build", got)
	}
}

// A door leaving drops the standing file while it names that door, and leaves another door's file standing. [[spec/tickets/process-shadow-reads-clean]]
// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestADoorDropsItsOwnStandingFileAlone(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	standsAt(t, root, Standing{Port: 1, Pid: 2, Root: root})
	dropsOwn(root, 3)
	if _, err := standingOf(root); err != nil {
		t.Fatalf("a door drops another door's standing file: %v", err)
	}
	dropsOwn(root, 2)
	if _, err := os.Stat(standingPath(root)); err == nil {
		t.Fatal("a door leaving keeps its own standing file")
	}
}

// A door stays while the standing file names it, and leaves once the file names another door. [[spec/tickets/process-shadow-reads-clean]]
// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestADisplacedDoorLeaves(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	standsAt(t, root, Standing{Port: 1, Pid: 2, Root: root})
	gone := displaced(root, 2, time.Millisecond)
	select {
	case <-gone:
		t.Fatal("a door the standing file names leaves")
	case <-time.After(20 * time.Millisecond):
	}
	standsAt(t, root, Standing{Port: 4, Pid: 5, Root: root})
	select {
	case <-gone:
	case <-time.After(time.Second):
		t.Fatal("a door the standing file no longer names stays")
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestADoorNamingItsBuildStandsWhileThatBuildLies(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	built := filepath.Join(t.TempDir(), "another-index")
	if err := os.WriteFile(built, []byte("a build elsewhere"), 0o755); err != nil {
		t.Fatal(err)
	}
	stamp := stampOf(built)
	if !stands(Standing{Root: root, Stamp: stamp, Bin: built}, root) {
		t.Fatal("a door standing off a build elsewhere stands aside while that build lies unchanged")
	}
	if err := os.WriteFile(built, []byte("a build elsewhere, rebuilt longer"), 0o755); err != nil {
		t.Fatal(err)
	}
	if stands(Standing{Root: root, Stamp: stamp, Bin: built}, root) {
		t.Fatal("a door stands after its own build moved")
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestAStartWithNoIndexBuiltSaysSo(t *testing.T) {
	root := t.TempDir()
	ran := fakeSpawn(t, nil)
	if err := starts(root); err == nil {
		t.Fatal("a start with no index built answers no fault")
	}
	if got := ran(); len(got) != 0 {
		t.Fatalf("a start with no index built runs %q", got)
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestTheStandingFileNamesTheBuildThatStandsIt(t *testing.T) {
	t.Parallel()
	root := tree(t)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	self, _ := os.Executable()
	if standing.Bin != self || !stands(standing, root) {
		t.Fatalf("the standing file says %+v, where this build stands it", standing)
	}
}

// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestTheIndexStartsItselfAndAClientTheIndexBesideIt(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	vehicle := t.TempDir()
	self := filepath.Join(vehicle, "logview")
	if got := serverOf(self, root); got != indexBinary(root) {
		t.Fatalf("a client with no index beside it starts %q, where the tree's stands at %q", got, indexBinary(root))
	}
	beside := filepath.Join(vehicle, filepath.Base(indexBinary(root)))
	if err := os.WriteFile(beside, []byte("the vehicle's index"), 0o755); err != nil {
		t.Fatal(err)
	}
	if got := serverOf(self, root); got != beside {
		t.Fatalf("a client starts %q, where the index beside it stands at %q", got, beside)
	}
	Serving()
	t.Cleanup(func() { serving.Store(false) })
	if got := serverOf(self, root); got != self {
		t.Fatalf("the index starts %q, where it stands at %q itself", got, self)
	}
}

// A door past its answer time is busy, and its process still runs, so a client answers the fault and starts no index beside it. [[spec/tickets/one-index-a-tree]]
// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestASlowDoorKeepsItsPlaceAndStartsNoOther(t *testing.T) {
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	late := make(chan struct{})
	door := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-late
	}))
	t.Cleanup(door.Close)
	t.Cleanup(func() { close(late) })
	was := postTimeout
	postTimeout = 50 * time.Millisecond
	t.Cleanup(func() { postTimeout = was })
	port := door.Listener.Addr().(*net.TCPAddr).Port
	busy := Standing{Port: port, Pid: 1, Root: root, Stamp: stampOf(bin)}
	standsAt(t, root, busy)
	ran := fakeSpawn(t, func(root string) { standsAt(t, root, busy) })

	if _, err := reaches(root, []string{"standing"}); err == nil {
		t.Fatal("a client answers no fault, where the door answers late")
	}
	if got := ran(); len(got) != 0 {
		t.Fatalf("a client starts %q beside a busy door", got)
	}
	if _, err := standingOf(root); err != nil {
		t.Fatalf("the busy door loses its standing file: %v", err)
	}
}

// A caller meeting a fresh claim spawns nothing, and reads the door the claiming caller's index stands. [[spec/tickets/reaches-keeps-the-post-fault]]
// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestACallerMeetingAClaimWaitsAndSpawnsNothing(t *testing.T) {
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	ran := fakeSpawn(t, nil)
	if !claims(startingPath(root)) {
		t.Fatal("the first caller claims no start")
	}
	go func() {
		time.Sleep(3 * startPollPause)
		standsAt(t, root, Standing{Port: 1, Root: root, Stamp: stampOf(bin)})
	}()
	if err := starts(root); err != nil {
		t.Fatal(err)
	}
	if got := ran(); len(got) != 0 {
		t.Fatalf("a caller meeting a claim spawns %q", got)
	}
}

// A claim older than the start wait stands dead, so the next caller takes it and spawns. [[spec/tickets/reaches-keeps-the-post-fault]]
// level0: FixtureOutsideHome - the case stands, claims or displaces its own door over its own root
func TestAStaleClaimGivesWay(t *testing.T) {
	root := t.TempDir()
	bin := builtIndex(t, root, "the index build")
	if !claims(startingPath(root)) {
		t.Fatal("the first caller claims no start")
	}
	long := time.Now().Add(-2 * startPolls * startPollPause)
	if err := os.Chtimes(startingPath(root), long, long); err != nil {
		t.Fatal(err)
	}
	ran := fakeSpawn(t, func(root string) {
		standsAt(t, root, Standing{Port: 1, Root: root, Stamp: stampOf(bin)})
	})
	if err := starts(root); err != nil {
		t.Fatal(err)
	}
	if got := ran(); len(got) != 1 {
		t.Fatalf("a caller meeting a stale claim spawns %q", got)
	}
	if _, err := os.Stat(startingPath(root)); err == nil {
		t.Fatal("the claim outlives the start it guards")
	}
}
