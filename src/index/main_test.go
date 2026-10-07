// The fixture home of the index's cases: the tree, the doors and the listing
// several cases read, each built once a run and read by every case.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package index // level0: InPackageTest - its builders drive the unexported door, and every case file shares its helpers

import (
	"database/sql"
	"fmt"
	"os" // level0: OutsideInDoors - the fixture home makes and removes the run's own temp folder, and the run exits on its code
	"path/filepath"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The files every case tree holds, by their path under the root. [[spec/guidance/code/testing]]
var treeFiles = [][2]string{
	{"spec/one.md", "---\nkind: note\nid: one\n---\n\nThe first note says [[two]] out loud.\n"},
	{"spec/two.md", "---\nkind: note\nid: two\n---\n\nThe second note names [[nobody]] at all.\n"},
	{"src/plain.js", "// a line the search finds\nconst said = 1;\n"},
	{".se/.runtime/skipped.md", "---\nid: skipped\n---\n\nThis never reaches the index.\n"},
	{".se/tickets/parked.md", "---\nid: parked\n---\n\nA word standing under the private folder alone: marzipan.\n"},
}

// Writes one file under root, with the folders it stands in. [[spec/guidance/code/testing]]
func plantFile(root, rel, text string) error {
	at := filepath.Join(root, filepath.FromSlash(rel))
	if err := makeDir(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	return writeFile(at, []byte(text), 0o644)
}

// Writes the case tree's files under root. [[spec/guidance/code/testing]]
func plantTree(root string) error {
	for _, one := range treeFiles {
		if err := plantFile(root, one[0], one[1]); err != nil {
			return err
		}
	}
	return nil
}

// Whether the run made the fixture folder, so the end removes it; a helper process killed mid-run makes none. [[spec/design_output/model#the-guards-hold-a-baseline]]
var homeMade atomic.Bool

// The folder the shared fixtures stand under, made on the first build. [[spec/design_output/model#the-guards-hold-a-baseline]]
var fixtureHome = qtest.Shared(func() string {
	dir, err := os.MkdirTemp("", "index-fixtures-")
	if err != nil {
		panic(err)
	}
	homeMade.Store(true)
	return dir
})

// The stops the shared fixtures leave, which the end of the run takes. [[spec/design_output/model#the-guards-hold-a-baseline]]
var (
	endsMu sync.Mutex
	ends   []func()
)

// Keeps a stop for the end of the run. [[spec/design_output/model#the-guards-hold-a-baseline]]
func atEnd(stop func()) {
	endsMu.Lock()
	defer endsMu.Unlock()
	ends = append(ends, stop)
}

// A fresh folder under the fixture home, with the case tree's files where planted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func sharedRoot(planted bool) (string, error) {
	root, err := os.MkdirTemp(fixtureHome(), "tree-")
	if err != nil || !planted {
		return root, err
	}
	return root, plantTree(root)
}

// A fresh index file under the fixture home. [[spec/design_output/model#the-guards-hold-a-baseline]]
func sharedIndexAt() (string, error) {
	dir, err := os.MkdirTemp(fixtureHome(), "db-")
	return filepath.Join(dir, "index.db"), err
}

func TestMain(m *testing.M) {
	code := m.Run()
	endsMu.Lock()
	for i := len(ends) - 1; i >= 0; i-- {
		ends[i]()
	}
	endsMu.Unlock()
	if homeMade.Load() {
		os.RemoveAll(fixtureHome())
	}
	os.Exit(code)
}

// The case tree swept once into an index, which the reading cases query and none writes. [[spec/guidance/code/testing]]
var sweptTree = qtest.Shared(func() (out struct {
	db  *sql.DB
	err error
}) {
	root, err := sharedRoot(true)
	if err != nil {
		out.err = err
		return out
	}
	at, err := sharedIndexAt()
	if err != nil {
		out.err = err
		return out
	}
	db, err := Open(root, at)
	if err != nil {
		out.err = err
		return out
	}
	atEnd(func() { db.Close() })
	if _, _, err := Sweep(db, root); err != nil {
		out.err = err
		return out
	}
	out.db = db
	return out
})

// The shared swept index of the case tree, read-only to the case. [[spec/guidance/code/testing]]
func sweptDB(t *testing.T) *sql.DB {
	t.Helper()
	swept := sweptTree()
	if swept.err != nil {
		t.Fatal(swept.err)
	}
	return swept.db
}

// Gets path off the /v1 surface of the door standing, over the transport a client posts on. [[spec/design_output/model#surfaces]]
func fetchV1(standing Standing, path string) (reply, error) {
	return asksDoor("GET", fmt.Sprintf("http://127.0.0.1:%d%s", standing.V1, path), nil, nil)
}

// A door over the fake network and the clock the case hands, and the standing file it writes. [[spec/tickets/test-walks-move-onto-fakes]]
func served(t *testing.T, clock q.Clock, root string, catalog *q.Catalog, manage Manage, starts ...Start) (*door, Standing) {
	t.Helper()
	fake := newMemNet(t)
	one, stop, _, err := opensOn(clock, fake.listen, root, filepath.Join(t.TempDir(), "index.db"), catalog, manage, starts...)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	return one, standing
}

// The network the shared doors listen on, over the port table every case shares. [[spec/tickets/test-walks-move-onto-fakes]]
var sharedNet = &memNet{}

// A shared door: its standing, or the fault that refused it. [[spec/design_output/index#the-door-owns-the-database]]
type sharedDoor struct {
	standing Standing
	err      error
}

// Serves a door on the fake network over a fresh case tree under the fixture home, stopped at the end of the run. [[spec/design_output/index#the-door-owns-the-database]]
func serveShared(c *q.Catalog, starts ...Start) (out sharedDoor) {
	root, err := sharedRoot(true)
	if err != nil {
		out.err = err
		return out
	}
	at, err := sharedIndexAt()
	if err != nil {
		out.err = err
		return out
	}
	_, stop, _, err := opensOn(qtest.Wall(), sharedNet.listen, root, at, c, nil, starts...)
	if err != nil {
		out.err = err
		return out
	}
	atEnd(stop)
	out.standing, out.err = standingOf(root)
	return out
}

// The standing of a shared door, or a fault on the case. [[spec/design_output/index#the-door-owns-the-database]]
func (one sharedDoor) of(t *testing.T) Standing {
	t.Helper()
	if one.err != nil {
		t.Fatal(one.err)
	}
	return one.standing
}

// One door over the case tree and an empty catalog, started once and asked by every case. [[spec/design_output/index#the-door-owns-the-database]]
var sharedBare = qtest.Shared(func() sharedDoor { return serveShared(q.New()) })

// The standing of the shared bare door, which the case asks and writes nothing to. [[spec/design_output/index#the-door-owns-the-database]]
func bareDoor(t *testing.T) Standing {
	t.Helper()
	return sharedBare().of(t)
}

// One door over the case tree, whose file start commits files/spec/one.md, started once and read by every case. [[spec/design_output/model#surfaces]]
var sharedV1 = qtest.Shared(func() sharedDoor {
	c := q.New()
	hand := q.OutIn(c, "files/<path...>", q.Content{})
	file := func(_ string, commit Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"files/spec/one.md": q.Content{Hash: "one", Text: "one"}})
	}
	out := serveShared(c, file)
	if out.err == nil && (out.standing.V1 == 0 || out.standing.V1 == out.standing.Port) {
		out.err = fmt.Errorf("the standing file says %+v", out.standing)
	}
	return out
})

// The standing of the shared /v1 door, which the case reads and writes nothing to. [[spec/design_output/model#surfaces]]
func standingV1(t *testing.T) Standing {
	t.Helper()
	return sharedV1().of(t)
}

// The catalog of the tools door: the case's own actions, then t/add and t/echo under the fake manager on the clock the case hands. [[spec/tickets/the-hook-registers-index-tools]]
func toolsCatalog(clock q.Clock, adds func(*q.Catalog)) (*q.Catalog, Manage) {
	c := q.New()
	adds(c)
	ops := q.OutIn(c, "ops/<id>", map[string]any{}, q.Doc("the fake manager's operations"))
	q.ActionIn(c, "t/add", func(in addIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("adds two terms"))
	q.ActionIn(c, "t/echo", func(in string) []q.Request {
		return []q.Request{{Module: "t", Verb: "echo", Args: in, NoUndo: "an echo writes nothing"}}
	}, q.Doc("echoes its input"))
	accept := func(asked q.Request) (any, error) { return asked.Args, nil }
	return c, fakeManager(clock, ops, accept)
}

// The body /v1/tools answers over one door holding t/add and t/echo, fetched once a run. [[spec/tickets/the-hook-registers-index-tools]]
var sharedTools = qtest.Shared(func() (out struct {
	body []byte
	err  error
}) {
	root, err := sharedRoot(true)
	if err != nil {
		out.err = err
		return out
	}
	at, err := sharedIndexAt()
	if err != nil {
		out.err = err
		return out
	}
	clock := qtest.NewFake(time.Time{})
	c, manage := toolsCatalog(clock, func(*q.Catalog) {})
	_, stop, _, err := opensOn(clock, sharedNet.listen, root, at, c, manage)
	if err != nil {
		out.err = err
		return out
	}
	atEnd(stop)
	standing, err := standingOf(root)
	if err != nil {
		out.err = err
		return out
	}
	said, err := fetchV1(standing, "/v1/tools")
	if err != nil {
		out.err = err
		return out
	}
	if said.StatusCode != statusOK {
		out.err = fmt.Errorf("/v1/tools answers %d: %.300s", said.StatusCode, said.Body)
		return out
	}
	out.body = said.Body
	return out
})

// The body /v1/tools answers over a door holding t/add and t/echo, shared and read-only to the case. [[spec/tickets/the-hook-registers-index-tools]]
func toolsBody(t *testing.T) []byte {
	t.Helper()
	shared := sharedTools()
	if shared.err != nil {
		t.Fatal(shared.err)
	}
	return shared.body
}
