package main

import (
	"os"
	"path/filepath"
	"strings"
	"time"
)

// A READ, A CHANGE AND A WRITE ARE ONE OPERATION, OR THE CHANGE IS LOST.
//
// Every store under .se was read whole, changed in one place, and written
// back whole. The guard is a fresh process on every tool call of every agent,
// so the gap between the read and the write is not a rare event: two agents
// overlapping lost one of the two changes every time. The owed store got a
// lock for it, and the other stores kept the gap, so an arrival, a call, a
// claim and a read could each vanish the same way.
//
// A LOCK FILE IS WHAT TWO PROCESSES CAN AGREE ON. They share nothing else: no
// memory, no parent, and not even a start time. Creating a file exclusively is
// the one thing the filesystem promises only one of them can do.
//
// locked runs change while holding the lock beside path. Whatever change
// reads and writes under that path is then read and written by one process
// at a time.
func locked(path string, change func() error) error {
	unlock, err := lockFile(path)
	if err != nil {
		return err
	}
	defer unlock()
	return change()
}

// A LOCK NOBODY CAN RELEASE IS WORSE THAN A LOST WRITE. A process that dies
// holding it would block every agent for good, so a lock that is older than
// the time any of these writes can take is taken from whoever left it.
func lockFile(path string) (func(), error) {
	lock := path + ".lock"
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	for tries := 0; ; tries++ {
		f, err := os.OpenFile(lock, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
		if err == nil {
			f.Close()
			return func() { os.Remove(lock) }, nil
		}
		if st, err := os.Stat(lock); err == nil && time.Since(st.ModTime()) > lockIsStale {
			os.Remove(lock)
			continue
		}
		if tries > lockTries {
			// The write matters more than the lock. Going ahead can lose a
			// write, and refusing loses one for certain.
			return func() {}, nil
		}
		time.Sleep(lockWait)
	}
}

// How long a lock is waited for, and when one is taken from whoever left it.
// These are this file's to decide: the write they guard is a few hundred bytes
// of JSON, so any holder that has not finished in a second has died.
//
// THE WAITER HAS TO OUTLAST THE STALENESS. It did not: a waiter gave up after
// one second and a lock went stale after five, so no waiter ever lived long
// enough to steal one. Every one of them went ahead without the lock instead,
// which is the unsynchronised write the lock exists to stop, and it did that
// for the whole five seconds after a process died holding it.
//
// SO STEALING IS WHAT RESOLVES A DEAD LOCK and going ahead is the last resort.
// Ten seconds is long enough that a live holder is never robbed, even under
// the battery's load with a scanner on every temporary file: a second was
// not, and a holder robbed mid-write is two writers on one file, which lost
// eleven counts in fifty. The budget is three times that, so a waiter always
// sees the steal first. TestTheWaiterOutlastsTheStaleness holds these three
// to that.
const (
	lockWait    = 2 * time.Millisecond
	lockTries   = 15000
	lockIsStale = 10 * time.Second
)

// EVERY WRITE IS ATOMIC, SO A CRASH LEAVES THE OLD FILE RATHER THAN HALF A NEW ONE.
//
// os.WriteFile truncates and then writes. A process that dies between the two
// leaves an empty or half-written file, and every loader in this program
// swallows a read failure into an empty value: loadOwed, loadClaims,
// loadTickets, LoadEvidence, loadHeard. So the obligation, the claim and the
// ticket do not come back wrong, they come back GONE, and nothing says they
// were ever there.
//
// IT MATTERS HERE MORE THAN IN MOST PROGRAMS. The guard is a fresh process on
// every tool call, several run at once, and the machine it runs on is somebody's
// laptop that gets shut. SaveToken already did this by hand for the one file
// that holds a token; this is the same three lines, named, for the rest.
//
// THE TEMPORARY FILE IS BESIDE THE TARGET, because rename is only atomic within
// a filesystem and the temp directory is often another one.
func writeAtomic(path string, b []byte, mode os.FileMode) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	f, err := os.CreateTemp(dir, filepath.Base(path)+".*.tmp")
	if err != nil {
		return err
	}
	name := f.Name()
	if _, err := f.Write(b); err != nil {
		f.Close()
		os.Remove(name)
		return err
	}
	// THE BYTES ARE ON THE DISK BEFORE THE NAME POINTS AT THEM. Without this a
	// power cut can leave the rename durable and the contents not, which is the
	// one case that turns an atomic write back into a truncating one.
	if err := f.Sync(); err != nil {
		f.Close()
		os.Remove(name)
		return err
	}
	if err := f.Close(); err != nil {
		os.Remove(name)
		return err
	}
	if err := os.Chmod(name, mode); err != nil {
		os.Remove(name)
		return err
	}
	// THE RENAME IS TRIED AGAIN ON A REFUSAL. Windows refuses to replace a
	// file that something has open, and a virus scanner or an indexer opens
	// a freshly written file for a moment. Under the battery's load one
	// write in fifty met that moment and answered access denied. A few short
	// waits ride it out, and a refusal that outlasts them is answered.
	for try := 0; try < renameTries; try++ {
		if err = os.Rename(name, path); err == nil {
			return nil
		}
		time.Sleep(renameWait)
	}
	os.Remove(name)
	return err
}

// How often a refused rename is tried again, and how long between tries.
const (
	renameTries = 20
	renameWait  = 10 * time.Millisecond
)

// SweepOrphanedWrites removes the temporary files an atomic write leaves when
// the process writing one does not live to rename it.
//
// writeAtomic cleans up after every failure it can see. It cannot clean up
// after being killed, and a swap kills the engine on purpose: the old one exits
// while a heartbeat's write is in flight, and a name like engine.json.NNN.tmp
// is left under .se for ever. The check that every private file has a writer
// then reports it, correctly, as a file nothing owns.
//
// ONLY WHAT THIS RUN DID NOT WRITE. A temp file younger than olderThan may
// belong to a write happening right now, in another process over the same tree.
// An engine handing over passes zero, because it knows it is the one ending and
// the write it is about to orphan is its own.
//
// .se AND THE FOLDERS DIRECTLY UNDER IT. A test run's coverage profile is made
// in .se/tests, so a sweep of the top level alone left every killed run's
// profile there. It goes one level and no further: nothing writes a temporary
// deeper than that, and a walk of the whole tree would reach the index.
func SweepOrphanedWrites(r Roots, olderThan time.Duration) int {
	swept := 0
	for _, dir := range append([]string{r.Private()}, foldersUnder(r.Private())...) {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".tmp") {
				continue
			}
			info, err := e.Info()
			if err != nil || time.Since(info.ModTime()) < olderThan {
				continue
			}
			if os.Remove(filepath.Join(dir, e.Name())) == nil {
				swept++
			}
		}
	}
	return swept
}

// foldersUnder answers the folders directly inside one, and nothing deeper.
func foldersUnder(dir string) []string {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() {
			out = append(out, filepath.Join(dir, e.Name()))
		}
	}
	return out
}
