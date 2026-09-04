package main

import (
	"bufio"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"go/ast"
	"go/parser"
	gotoken "go/token"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// THE TRACE FROM A TEST TO THE SOURCE IT EXERCISES, KEPT IN THE INDEX.
//
// THE OWNER'S WORDS: every test needs a region in the source that it belongs
// to, or multiple regions where it makes sense. And then when the region
// changes, the test has to run.
//
// A Go test is mapped the way pytest-testmon and Ekstazi map theirs: run it
// once under coverage and write down the lines it executed. Go has no tool
// for it, and it has the raw material: the test binary answers a coverage
// profile per run, so one run per test off a binary built with -cover is the
// map. The binary is built once per package and again when the package's
// source changes; each test is mapped when it has no map or its file changed,
// and mapped again as a side effect of being run, so the map heals through
// use rather than through a job.
//
// A CHECK DECLARES WHAT IT READS. The node checks are whole processes over
// the tree and coverage cannot see them, so each says in its header which
// paths it reads, and a change to one of those selects it. A check that
// declares nothing runs only when the whole battery does, and the answer
// says so, which is how a declaration gets written.

// aTest is one test the engine knows.
type aTest struct {
	ID     string // the test file's folder and the name, so two packages' TestX are two tests
	Name   string
	Kind   string // go, or check
	Path   string // the file it is in, root-relative
	Line   int
	Hash   string // of that file, as it is
	Reads  string // a check's declared inputs, comma separated globs
	Mapped string // the hash the regions were taken at, empty when there are none
}

// A region is a run of lines of one file that a test executed.
type region struct {
	Path          string
	Start, Finish int
}

// testTables are the trace's own tables, made beside the index's.
const testTables = `
CREATE TABLE IF NOT EXISTS test (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  kind   TEXT NOT NULL,
  path   TEXT NOT NULL,
  line   INTEGER NOT NULL,
  hash   TEXT NOT NULL,
  reads  TEXT NOT NULL DEFAULT '',
  mapped TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS test_path ON test (path);
CREATE TABLE IF NOT EXISTS test_region (
  test   TEXT NOT NULL,
  path   TEXT NOT NULL,
  start  INTEGER NOT NULL,
  finish INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS test_region_test ON test_region (test);
CREATE INDEX IF NOT EXISTS test_region_path ON test_region (path);
`

// checksDir is where the node checks live, root-relative.
const checksDir = "util/checks"

// discoverTests walks the tree for every test and brings the test table into
// step: a new one is written, a changed one has its hash moved, a gone one is
// dropped with its regions. Nothing here runs anything.
func discoverTests(r Roots, db *sql.DB) ([]aTest, error) {
	var found []aTest
	err := filepath.WalkDir(r.Work, func(abs string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		rel, skip := indexRel(r, abs, d.IsDir())
		if skip {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		if d.IsDir() {
			return nil
		}
		switch {
		case strings.HasSuffix(rel, "_test.go"):
			found = append(found, goTestsIn(abs, rel)...)
		case filepath.ToSlash(filepath.Dir(rel)) == checksDir && strings.HasSuffix(rel, ".mjs"):
			if t, ok := checkAt(abs, rel); ok {
				found = append(found, t)
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	known := map[string]aTest{}
	rows, err := db.Query("SELECT id, name, kind, path, line, hash, reads, mapped FROM test")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var t aTest
		if err := rows.Scan(&t.ID, &t.Name, &t.Kind, &t.Path, &t.Line, &t.Hash, &t.Reads, &t.Mapped); err != nil {
			rows.Close()
			return nil, err
		}
		known[t.ID] = t
	}
	rows.Close()
	seen := map[string]bool{}
	for i, t := range found {
		seen[t.ID] = true
		was, ok := known[t.ID]
		if ok {
			found[i].Mapped = was.Mapped
		}
		if ok && was.Hash == t.Hash && was.Line == t.Line && was.Reads == t.Reads {
			continue
		}
		if _, err := db.Exec("INSERT INTO test (id, name, kind, path, line, hash, reads, mapped) VALUES (?, ?, ?, ?, ?, ?, ?, ?) "+
			"ON CONFLICT(id) DO UPDATE SET name = excluded.name, kind = excluded.kind, path = excluded.path, "+
			"line = excluded.line, hash = excluded.hash, reads = excluded.reads",
			t.ID, t.Name, t.Kind, t.Path, t.Line, t.Hash, t.Reads, found[i].Mapped); err != nil {
			return nil, err
		}
	}
	for id := range known {
		if !seen[id] {
			if _, err := db.Exec("DELETE FROM test WHERE id = ?", id); err != nil {
				return nil, err
			}
			if _, err := db.Exec("DELETE FROM test_region WHERE test = ?", id); err != nil {
				return nil, err
			}
		}
	}
	sort.Slice(found, func(i, j int) bool { return found[i].ID < found[j].ID })
	return found, nil
}

// goTestsIn reads one test file for its tests, by parsing it rather than by
// compiling it: a function named Test with one parameter is a test.
func goTestsIn(abs, rel string) []aTest {
	b, err := os.ReadFile(abs)
	if err != nil {
		return nil
	}
	fset := gotoken.NewFileSet()
	f, err := parser.ParseFile(fset, abs, b, 0)
	if err != nil {
		return nil // a file that will not parse has no tests the toolchain would run either
	}
	hash := hashBytes(b)
	dir := filepath.ToSlash(filepath.Dir(rel))
	var out []aTest
	for _, d := range f.Decls {
		fn, ok := d.(*ast.FuncDecl)
		if !ok || fn.Recv != nil || !strings.HasPrefix(fn.Name.Name, "Test") || fn.Name.Name == "TestMain" {
			continue
		}
		if fn.Type.Params == nil || len(fn.Type.Params.List) != 1 {
			continue
		}
		out = append(out, aTest{ID: dir + "/" + fn.Name.Name, Name: fn.Name.Name, Kind: "go",
			Path: filepath.ToSlash(rel), Line: fset.Position(fn.Pos()).Line, Hash: hash})
	}
	return out
}

// checkAt reads one check for its declaration: a header line saying
// "// reads: glob, glob". A check with none is still a test, with nothing.
func checkAt(abs, rel string) (aTest, bool) {
	b, err := os.ReadFile(abs)
	if err != nil {
		return aTest{}, false
	}
	reads := ""
	sc := bufio.NewScanner(strings.NewReader(string(b)))
	for i := 0; sc.Scan() && i < 40; i++ {
		line := strings.TrimSpace(sc.Text())
		if strings.HasPrefix(line, "// reads:") {
			reads = strings.TrimSpace(strings.TrimPrefix(line, "// reads:"))
			break
		}
	}
	name := strings.TrimSuffix(filepath.Base(rel), ".mjs")
	return aTest{ID: checksDir + "/" + name, Name: name, Kind: "check", Path: filepath.ToSlash(rel), Line: 1,
		Hash: hashBytes(b), Reads: reads}, true
}

func hashBytes(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])[:16]
}

// regionsOf answers what the index holds for one test.
func regionsOf(db *sql.DB, id string) ([]region, error) {
	rows, err := db.Query("SELECT path, start, finish FROM test_region WHERE test = ? ORDER BY path, start", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []region
	for rows.Next() {
		var g region
		if err := rows.Scan(&g.Path, &g.Start, &g.Finish); err != nil {
			return nil, err
		}
		out = append(out, g)
	}
	return out, rows.Err()
}

// writeRegions replaces a test's regions and marks the test mapped at the
// hash its file has now.
func writeRegions(db *sql.DB, t aTest, regions []region) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec("DELETE FROM test_region WHERE test = ?", t.ID); err != nil {
		return err
	}
	for _, g := range regions {
		if _, err := tx.Exec("INSERT INTO test_region (test, path, start, finish) VALUES (?, ?, ?, ?)",
			t.ID, g.Path, g.Start, g.Finish); err != nil {
			return err
		}
	}
	if _, err := tx.Exec("UPDATE test SET mapped = ? WHERE id = ?", t.Hash, t.ID); err != nil {
		return err
	}
	return tx.Commit()
}

// THE COVER BINARY, ONE PER PACKAGE, REBUILT WHEN THE PACKAGE CHANGES.

// coverBinary answers the path of a test binary for the package at dir,
// built with coverage, building it when the package's source has changed
// since the last build. The hash of every Go file in the folder is what
// decides that, kept in the index's meta.
func coverBinary(r Roots, db *sql.DB, dir string) (string, error) {
	abs := filepath.Join(r.Work, filepath.FromSlash(dir))
	entries, err := os.ReadDir(abs)
	if err != nil {
		return "", err
	}
	h := sha256.New()
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".go") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(abs, e.Name()))
		if err != nil {
			return "", err
		}
		h.Write([]byte(e.Name()))
		h.Write(b)
	}
	want := hex.EncodeToString(h.Sum(nil))[:16]
	bin := filepath.Join(r.Private("tests"), exeName(strings.ReplaceAll(dir, "/", "_")+".cover"))
	if had, _ := metaOf(db, "coverbin:"+dir); had == want {
		if _, err := os.Stat(bin); err == nil {
			return bin, nil
		}
	}
	if err := os.MkdirAll(filepath.Dir(bin), 0o755); err != nil {
		return "", err
	}
	cmd := Quietly(exec.Command(goTool(), "test", "-c", "-cover", "-o", bin, "."))
	cmd.Dir = abs
	cmd.Env = buildEnv()
	if out, err := cmd.CombinedOutput(); err != nil {
		return "", fmt.Errorf("the cover binary for %s will not build: %v\n%s", dir, err, out)
	}
	return bin, setMeta(db, "coverbin:"+dir, want)
}

// goTool is the go on this machine: the probe's when it found one, PATH's
// otherwise.
func goTool() string {
	if p, err := exec.LookPath("go"); err == nil {
		return p
	}
	return "go"
}

// buildEnv is the environment a build runs in. The engine may have been
// started by a window that knows nothing of cgo, so the installer's file
// is read here, the way the battery sources it.
func buildEnv() []string {
	env := os.Environ()
	base := os.Getenv("LOCALAPPDATA")
	if base == "" {
		base = filepath.Join(os.Getenv("HOME"), ".local", "share")
	}
	b, err := os.ReadFile(filepath.Join(base, "quackitect", "cgo.env"))
	if err != nil {
		return env
	}
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(line), "export "))
		k, v, ok := strings.Cut(line, "=")
		if !ok || k == "" || strings.HasPrefix(line, "#") {
			continue
		}
		v = strings.Trim(strings.TrimSpace(v), "\"'")
		env = append(env, k+"="+v)
	}
	return env
}

// runOneGoTest runs one test off its package's cover binary and answers
// whether it passed, what it said, and the regions it executed.
//
// THE ENGINE FIXTURE IS NAMED, so a suite whose TestMain builds an engine
// uses the one this engine is, and a per-test run costs the test and not a
// link.
func runOneGoTest(r Roots, bin string, t aTest) (ok bool, said string, took time.Duration, regions []region, err error) {
	profile, err := os.CreateTemp(r.Private("tests"), "profile.*.out")
	if err != nil {
		return false, "", 0, nil, err
	}
	profile.Close()
	defer os.Remove(profile.Name())
	dir := filepath.Join(r.Work, filepath.FromSlash(filepath.Dir(t.Path)))
	cmd := Quietly(exec.Command(bin, "-test.run", "^"+t.Name+"$", "-test.count", "1", "-test.coverprofile", profile.Name()))
	cmd.Dir = dir
	env := buildEnv()
	if engine := filepath.Join(r.Method, ".bin", exeName("se")); fileExists(engine) {
		env = append(env, "SE_ENGINE="+engine)
	}
	cmd.Env = env
	start := time.Now()
	out, runErr := cmd.CombinedOutput()
	took = time.Since(start)
	said = string(out)
	ok = runErr == nil
	module, moduleRoot := moduleOf(dir)
	rootRel, _ := filepath.Rel(r.Work, moduleRoot)
	regions, perr := regionsFromProfile(profile.Name(), module, filepath.ToSlash(rootRel))
	if perr != nil {
		return ok, said, took, nil, perr
	}
	return ok, said, took, regions, nil
}

func fileExists(p string) bool {
	_, err := os.Stat(p)
	return err == nil
}

// moduleOf answers the module path the package at dir belongs to, from the
// nearest go.mod above it, and the folder that go.mod is in.
func moduleOf(dir string) (module, root string) {
	for d := dir; ; d = filepath.Dir(d) {
		b, err := os.ReadFile(filepath.Join(d, "go.mod"))
		if err == nil {
			for _, line := range strings.Split(string(b), "\n") {
				if strings.HasPrefix(line, "module ") {
					return strings.TrimSpace(strings.TrimPrefix(line, "module ")), d
				}
			}
			return "", d
		}
		if filepath.Dir(d) == d {
			return "", dir
		}
	}
}

// regionsFromProfile reads a coverage profile into merged regions of the
// files under the package folder. A profile line is
// pkg/file.go:startLine.startCol,endLine.endCol statements count, and only
// a count above zero is a line the test reached.
func regionsFromProfile(profile, module, moduleRel string) ([]region, error) {
	b, err := os.ReadFile(profile)
	if err != nil {
		return nil, err
	}
	byFile := map[string][]region{}
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "mode:") {
			continue
		}
		file, rest, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		fields := strings.Fields(rest)
		if len(fields) != 3 {
			continue
		}
		count, _ := strconv.Atoi(fields[2])
		if count == 0 {
			continue
		}
		span := strings.Split(fields[0], ",")
		if len(span) != 2 {
			continue
		}
		start, _ := strconv.Atoi(strings.Split(span[0], ".")[0])
		finish, _ := strconv.Atoi(strings.Split(span[1], ".")[0])
		rel := relOfProfilePath(file, module, moduleRel)
		if rel == "" {
			continue
		}
		byFile[rel] = append(byFile[rel], region{Path: rel, Start: start, Finish: finish})
	}
	var out []region
	for _, regions := range byFile {
		out = append(out, mergeRegions(regions)...)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Path != out[j].Path {
			return out[i].Path < out[j].Path
		}
		return out[i].Start < out[j].Start
	})
	return out, nil
}

// relOfProfilePath turns a profile's import-path file into a root-relative
// one: the module path is replaced by the folder the module lives in.
func relOfProfilePath(file, module, moduleRel string) string {
	if module == "" || !strings.HasPrefix(file, module+"/") {
		return ""
	}
	rest := strings.TrimPrefix(file, module+"/")
	return filepath.ToSlash(filepath.Join(moduleRel, rest))
}

// mergeRegions joins runs that touch or overlap, so a function is one row
// rather than one per statement.
func mergeRegions(in []region) []region {
	sort.Slice(in, func(i, j int) bool { return in[i].Start < in[j].Start })
	var out []region
	for _, g := range in {
		if n := len(out); n > 0 && g.Start <= out[n-1].Finish+1 {
			if g.Finish > out[n-1].Finish {
				out[n-1].Finish = g.Finish
			}
			continue
		}
		out = append(out, g)
	}
	return out
}

// mapTests fills the gaps in the map, one test at a time, in the
// background: every Go test with no regions, or whose file changed since it
// was mapped. It stops when told, and it runs once per signal so an engine
// idling over a mapped tree runs nothing.
func mapTests(r Roots, log *Log, done <-chan struct{}, again <-chan struct{}) {
	db, err := openIndex(r)
	if err != nil {
		log.Write("engine", "error", "engine", "the mapper cannot open the index", No(), map[string]any{"reason": err.Error()})
		return
	}
	defer db.Close()
	for {
		mapped, failed, err := mapMissing(r, db, done)
		if err != nil {
			log.Write("engine", "error", "engine", "the tests could not be mapped", No(), map[string]any{"reason": err.Error()})
		}
		if mapped > 0 || failed > 0 {
			log.Write("engine", "tests", "engine", "the map from tests to source was brought up to date", Yes(),
				map[string]any{"mapped": mapped, "failed": failed})
		}
		select {
		case <-done:
			return
		case <-again:
		}
	}
}

// mapMissing is one pass: every Go test with no regions, or whose file
// changed since it was mapped, is run under coverage and its regions
// written. A cover binary that will not build takes its package's tests
// out of the pass and the error is answered once.
func mapMissing(r Roots, db *sql.DB, done <-chan struct{}) (mapped, failed int, err error) {
	tests, err := discoverTests(r, db)
	if err != nil {
		return 0, 0, err
	}
	bins := map[string]string{}
	var first error
	for _, t := range tests {
		if done != nil {
			select {
			case <-done:
				return mapped, failed, first
			default:
			}
		}
		if t.Kind != "go" || t.Mapped == t.Hash {
			continue
		}
		dir := filepath.ToSlash(filepath.Dir(t.Path))
		bin, ok := bins[dir]
		if !ok {
			b, err := coverBinary(r, db, dir)
			if err != nil {
				if first == nil {
					first = err
				}
				bins[dir] = ""
				continue
			}
			bin, bins[dir] = b, b
		}
		if bin == "" {
			continue
		}
		_, _, _, regions, err := runOneGoTest(r, bin, t)
		if err != nil {
			failed++
			continue
		}
		if err := writeRegions(db, t, regions); err != nil {
			failed++
			continue
		}
		mapped++
	}
	return mapped, failed, first
}
