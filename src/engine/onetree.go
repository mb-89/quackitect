package main

import (
	"os"
	"sync"

	"quackitect/engine/internal/treelock"
)

// ONE ENGINE PER TREE, HELD BY A LOCK THE SECOND START MEETS.
//
// AlreadyHere read engine.json, and an engine writes engine.json late: after
// the log is open, the projections are written and the tools are probed. A
// session hook's wake and the lane's se_start each looked in that gap, each
// saw nothing, and each started an engine a second apart. Nothing refused the
// second. The socket code removes any socket it finds, so the second took the
// socket while the first kept the hook port, and the lane's calls flipped
// between the two: engine.json named one pid and the record carried the
// other's session.
//
// SO THE FIRST THING A STARTING ENGINE DOES IS TAKE THE TREE. The lock is a
// file under the private folder, held for as long as the process lives, and
// the kernel drops it when the process dies however it dies, which a marker
// file cannot promise. A second start finds it held, says so, and leaves.
//
// A SWAP IS THE ONE HANDOVER ON PURPOSE. The predecessor lets go before it
// starts its successor, so the successor takes the tree while the predecessor
// still answers what is in flight. See handOver.

var theTree struct {
	sync.Mutex
	file *os.File
}

func treeLockPath(r Roots) string { return r.Private("engine.lock") }

// HoldTheTree takes the tree for this process. It answers false, and no
// error, when another process holds it.
func HoldTheTree(r Roots) (bool, error) {
	theTree.Lock()
	defer theTree.Unlock()
	if theTree.file != nil {
		return true, nil
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return false, err
	}
	f, err := os.OpenFile(treeLockPath(r), os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return false, err
	}
	held, err := treelock.Take(f)
	if err != nil || !held {
		f.Close()
		return false, err
	}
	theTree.file = f
	return true, nil
}

// LetGoOfTheTree gives the tree back, for a predecessor that hands over and
// for an engine on its way out. Calling it with nothing held does nothing.
func LetGoOfTheTree() {
	theTree.Lock()
	defer theTree.Unlock()
	if theTree.file == nil {
		return
	}
	_ = treelock.Drop(theTree.file)
	theTree.file.Close()
	theTree.file = nil
}
