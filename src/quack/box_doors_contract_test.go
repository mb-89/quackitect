//go:build contract

// The contract of the box doors: one suite of cases a door, run against the
// fake the box verbs take in a test and against the box itself.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package main

import (
	"errors"
	"io"
	"io/fs"
	"net"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The disk contract, one case a member, held by the fake and by the box's own disk under a temp folder. [[spec/tickets/quack-reaches-the-box-through-doors]]
func TestTheFakeDiskKeepsTheContractTheRealDiskKeeps(t *testing.T) {
	t.Parallel()
	disks := map[string]func(t *testing.T) (diskDoors, string){
		"fake": func(*testing.T) (diskDoors, string) { return newFakeDisk(), "/tree" },
		"real": func(t *testing.T) (diskDoors, string) { return realDisk(), t.TempDir() },
	}
	for name, open := range disks {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			for clause, check := range diskContract {
				t.Run(clause, func(t *testing.T) {
					disk, root := open(t)
					if err := disk.makeAll(root, 0o777); err != nil {
						t.Fatal(err)
					}
					check(t, disk, root)
				})
			}
		})
	}
}

// Each member's case, over a disk and a root folder standing empty. [[spec/tickets/quack-reaches-the-box-through-doors]]
var diskContract = map[string]func(t *testing.T, disk diskDoors, root string){
	"write then read answers the text": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "a.txt")
		if err := disk.write(at, []byte("said"), 0o644); err != nil {
			t.Fatal(err)
		}
		if got, err := disk.read(at); err != nil || string(got) != "said" || disk.text(at) != "said" {
			t.Fatalf("read answers %q, %v", got, err)
		}
	},
	"read of no file answers not exist": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "none.txt")
		if _, err := disk.read(at); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("read answers %v", err)
		}
		if disk.text(at) != "" || disk.stands(at) {
			t.Fatal("a file standing nowhere reads as one")
		}
	},
	"write into no folder refuses until makeAll makes it": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "deep", "er", "a.txt")
		if err := disk.write(at, []byte("x"), 0o644); err == nil {
			t.Fatal("a write into no folder passes")
		}
		if err := disk.makeAll(filepath.Dir(at), 0o777); err != nil {
			t.Fatal(err)
		}
		if err := disk.makeAll(filepath.Dir(at), 0o777); err != nil {
			t.Fatalf("makeAll over a standing folder answers %v", err)
		}
		if err := disk.write(at, []byte("x"), 0o644); err != nil {
			t.Fatal(err)
		}
	},
	"stat answers the size and the kind": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "a.txt")
		_ = disk.write(at, []byte("four"), 0o644)
		file, err := disk.stat(at)
		if err != nil || file.Size() != 4 || file.IsDir() {
			t.Fatalf("stat answers %v, %v", file, err)
		}
		if folder, err := disk.stat(root); err != nil || !folder.IsDir() {
			t.Fatalf("stat of the folder answers %v, %v", folder, err)
		}
		if _, err := disk.stat(filepath.Join(root, "none")); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("stat of nothing answers %v", err)
		}
	},
	"list names each entry by name, a folder as one": func(t *testing.T, disk diskDoors, root string) {
		_ = disk.write(filepath.Join(root, "b.txt"), nil, 0o644)
		_ = disk.makeAll(filepath.Join(root, "a"), 0o777)
		got := []string{}
		for _, one := range disk.listed(root) {
			got = append(got, one.Name()+map[bool]string{true: "/"}[one.IsDir()])
		}
		if !slices.Equal(got, []string{"a/", "b.txt"}) {
			t.Fatalf("list names %v", got)
		}
		if disk.listed(filepath.Join(root, "none")) != nil {
			t.Fatal("a folder standing nowhere lists entries")
		}
	},
	"remove takes a file and refuses a full folder": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "f", "a.txt")
		_ = disk.makeAll(filepath.Dir(at), 0o777)
		_ = disk.write(at, nil, 0o644)
		if err := disk.remove(filepath.Dir(at)); err == nil {
			t.Fatal("remove takes a folder holding a file")
		}
		if err := disk.remove(at); err != nil || disk.stands(at) {
			t.Fatalf("remove answers %v", err)
		}
		if err := disk.remove(at); err == nil {
			t.Fatal("remove of nothing passes")
		}
	},
	"removeAll takes a folder with all it holds": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "f", "g", "a.txt")
		_ = disk.makeAll(filepath.Dir(at), 0o777)
		_ = disk.write(at, nil, 0o644)
		if err := disk.removeAll(filepath.Join(root, "f")); err != nil || disk.stands(filepath.Join(root, "f")) {
			t.Fatalf("removeAll answers %v", err)
		}
		if err := disk.removeAll(filepath.Join(root, "none")); err != nil {
			t.Fatalf("removeAll of nothing answers %v", err)
		}
	},
	"appendTo adds to the end, makes the file, and refuses a missing folder": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "a.jsonl")
		if err := disk.appendTo(at, []byte("one\n")); err != nil {
			t.Fatal(err)
		}
		if err := disk.appendTo(at, []byte("two\n")); err != nil || disk.text(at) != "one\ntwo\n" {
			t.Fatalf("appendTo answers %v, and the file reads %q", err, disk.text(at))
		}
		if err := disk.appendTo(filepath.Join(root, "none", "a.jsonl"), []byte("x")); err == nil {
			t.Fatal("an append into no folder passes")
		}
	},
	"symlink makes a link readlink answers, and readlink refuses a plain file": func(t *testing.T, disk diskDoors, root string) {
		at := filepath.Join(root, "link")
		if err := disk.symlink(filepath.Join(root, "target"), at); err != nil {
			t.Fatal(err)
		}
		if got, err := disk.readlink(at); err != nil || got != filepath.Join(root, "target") {
			t.Fatalf("readlink answers %q, %v", got, err)
		}
		if err := disk.symlink("elsewhere", at); err == nil {
			t.Fatal("a link over a standing link passes")
		}
		_ = disk.write(filepath.Join(root, "plain"), []byte("a"), 0o644)
		if _, err := disk.readlink(filepath.Join(root, "plain")); err == nil {
			t.Fatal("readlink of a plain file passes")
		}
		if _, err := disk.readlink(filepath.Join(root, "none")); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("readlink of nothing answers %v", err)
		}
	},
	"makeTemp makes a fresh empty folder under the folder each call": func(t *testing.T, disk diskDoors, root string) {
		one, err := disk.makeTemp(root, "cold-")
		if err != nil {
			t.Fatal(err)
		}
		other, err := disk.makeTemp(root, "cold-")
		if err != nil {
			t.Fatal(err)
		}
		if one == other || !strings.HasPrefix(filepath.Base(one), "cold-") || filepath.Dir(filepath.Clean(one)) != filepath.Clean(root) {
			t.Fatalf("makeTemp answers %q and %q under %q", one, other, root)
		}
		if said, err := disk.stat(one); err != nil || !said.IsDir() || len(disk.listed(one)) != 0 {
			t.Fatalf("the folder %q stands not empty: %v", one, err)
		}
	},
	"rename moves a file and a folder with what it holds": func(t *testing.T, disk diskDoors, root string) {
		_ = disk.makeAll(filepath.Join(root, "f"), 0o777)
		_ = disk.write(filepath.Join(root, "f", "a.txt"), []byte("a"), 0o644)
		if err := disk.rename(filepath.Join(root, "f"), filepath.Join(root, "g")); err != nil {
			t.Fatal(err)
		}
		if disk.stands(filepath.Join(root, "f")) || disk.text(filepath.Join(root, "g", "a.txt")) != "a" {
			t.Fatal("the folder stays where it stood")
		}
		if err := disk.rename(filepath.Join(root, "g", "a.txt"), filepath.Join(root, "b.txt")); err != nil || disk.text(filepath.Join(root, "b.txt")) != "a" {
			t.Fatalf("rename of a file answers %v", err)
		}
		if err := disk.rename(filepath.Join(root, "none"), filepath.Join(root, "c")); err == nil {
			t.Fatal("rename of nothing passes")
		}
	},
	"stat and read follow a link, and a link pointing nowhere stands nowhere": func(t *testing.T, disk diskDoors, root string) {
		target, link := filepath.Join(root, "t.txt"), filepath.Join(root, "l")
		if err := disk.write(target, []byte("t"), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := disk.symlink(target, link); err != nil {
			t.Skip("this box makes no link:", err)
		}
		if said, err := disk.stat(link); err != nil || said.IsDir() || disk.text(link) != "t" {
			t.Fatalf("a link to a file stats %v and reads %q", err, disk.text(link))
		}
		if err := disk.remove(target); err != nil {
			t.Fatal(err)
		}
		if disk.stands(link) {
			t.Fatal("a link pointing nowhere stands")
		}
		if got, err := disk.readlink(link); err != nil || got != target {
			t.Fatalf("readlink answers %q, %v", got, err)
		}
	},
}

// The box contract, one case a member past the disk, held by the fake box and by the box itself. [[spec/tickets/quack-reaches-the-box-through-doors]]
func TestTheFakeBoxKeepsTheContractTheRealBoxKeeps(t *testing.T) {
	t.Parallel()
	boxes := map[string]func(t *testing.T) boxDoors{
		"fake": func(t *testing.T) boxDoors { d, _, _, _ := fakeBoxDoors(t); return d },
		"real": func(*testing.T) boxDoors { return quietBox() },
	}
	for name, open := range boxes {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			d := open(t)
			t.Run("environ names each variable as env reads it", func(t *testing.T) {
				pairs := d.environ()
				if len(pairs) == 0 {
					t.Fatal("environ names no variable")
				}
				for key, value := range vehicleEnv(pairs) {
					if got := d.env(key); got != value {
						t.Errorf("environ names %s=%q, and env reads %q", key, value, got)
					}
				}
			})
		})
	}
}

// A box with no runtime hears which one to install, in one line, off the fault the box's own PATH search answers. [[spec/tickets/bare-desk-names-missing-node]]
func TestAStartFaultNamesAMissingRuntime(t *testing.T) {
	t.Parallel()
	_, err := exec.LookPath("no-such-runtime")
	said := startFault("no-such-runtime", err)
	if strings.Contains(said, "\n") || said != "No no-such-runtime stands on the PATH. Install no-such-runtime, and run this again." {
		t.Fatalf("the fault reads %q", said)
	}
}

// The check's runner meets a real process: a loud run prints what it says and keeps it, and a quiet run keeps it alone. [[spec/tickets/test-walks-move-onto-fakes]]
func TestTheCheckRunnerPrintsALoudRunAndKeepsEveryRun(t *testing.T) {
	t.Parallel()
	for _, quiet := range []bool{false, true} {
		var out, errs strings.Builder
		code, said, err := runsUnder(t.TempDir(), map[string]string{}, &out, &errs)([]string{"go", "env", "GOROOT"}, nil, quiet)
		if err != nil || code != 0 || strings.TrimSpace(said) == "" {
			t.Fatalf("the run answers %d, %q, %v", code, said, err)
		}
		if printed := out.String(); (printed == said) == quiet {
			t.Errorf("a run quiet %v prints %q and keeps %q", quiet, printed, said)
		}
	}
}

// The branch verbs' doors stand over the work root on the box's own disk, and their method disk over the root the method reads. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestTheBranchDoorsWriteTheWorkRootAndReadTheMethodRoot(t *testing.T) {
	work, method := t.TempDir(), t.TempDir()
	t.Setenv(workRootVar, work)
	doors := branchDoors(func() (string, error) { return method, nil }, func() (string, error) { return "", nil }, io.Discard, io.Discard)
	if doors.Root != work || doors.Method != method || doors.Repo == nil || doors.Run == nil {
		t.Fatalf("the doors stand at %s and %s, repo %v, runner set %v", doors.Root, doors.Method, doors.Repo, doors.Run != nil)
	}
	if err := doors.Disk.Write("a.md", "work"); err != nil {
		t.Fatal(err)
	}
	if body, err := realDisk().read(filepath.Join(work, "a.md")); err != nil || string(body) != "work" {
		t.Errorf("the disk writes %q, %v under the work root", body, err)
	}
	if err := realDisk().write(filepath.Join(method, "m.md"), []byte("method"), 0o644); err != nil {
		t.Fatal(err)
	}
	if text, ok, err := doors.Methods.Read("m.md"); err != nil || !ok || text != "method" {
		t.Errorf("the method disk reads %q, %v, %v under the method root", text, ok, err)
	}
}

// quack lsp dials the IO module's port on the box and relays a stream whole over the real socket, the token line first, its write side half-closed at the input's end. [[spec/tickets/the-lsp-door-lands]]
func TestQuackLspRelaysAWholeStreamOverTheRealSocket(t *testing.T) {
	t.Parallel()
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listen.Close()
	frame := "Content-Length: 2\r\n\r\n{}"
	heard := make(chan string, 1)
	go func() {
		conn, err := listen.Accept()
		if err != nil {
			heard <- ""
			return
		}
		defer conn.Close()
		read, _ := io.ReadAll(conn)
		conn.Write([]byte(frame))
		heard <- string(read)
	}()
	conn, err := dialLocal(listen.Addr().(*net.TCPAddr).Port)
	if err != nil {
		t.Fatal(err)
	}
	var out strings.Builder
	if err := relays(strings.NewReader(frame), &out, conn, "tok"); err != nil {
		t.Fatal(err)
	}
	conn.Close()
	if said := <-heard; said != "tok\n"+frame {
		t.Fatalf("the IO module hears %q, and wants the token line, then the frame whole", said)
	}
	if out.String() != frame {
		t.Fatalf("the editor reads %q, and wants the reply frame whole", out.String())
	}
}
