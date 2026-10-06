// The plans module's outside: the plan file under the root, the wall clock,
// the most open todos the config holds, and the queue's places over a plan
// text, off the values the wiring binds to the queue's ports.
// [[spec/tickets/plan-writes-off-go]]
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"path/filepath"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/modules/plans"
	"quackitect/src/modules/queue"
	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The plan file the queue reads, and the module type whose ports the places read. The most open todos read off planMostOpenKey in command.go. [[spec/design_output/stop#the-plan]]
const (
	// .claude/skills/level0/lib/folders.js owns the plan file's folder, and the package spells it again. [[spec/design_output/stop#the-plan]]
	planPath        = ".se/.runtime/plan.json"
	queueModuleType = "queue"
)

func plansOutside(disk diskDoors, root string, store *q.Store) plans.Outside {
	path := filepath.Join(root, filepath.FromSlash(planPath))
	return plans.Outside{
		Read: func() (string, error) {
			text, err := disk.read(path)
			return string(text), err
		},
		Write: func(text string) error {
			if err := disk.makeAll(filepath.Dir(path), planFolderMode); err != nil {
				return err
			}
			return disk.write(path, []byte(text), planFileMode)
		},
		Now:    time.Now,
		Most:   settingsreader.Count(root, planMostOpenKey),
		Places: placesOver(disk, root, store),
	}
}

// The modes the plan's folder and file take. [[spec/design_output/stop#the-plan]]
const (
	planFolderMode = 0o755
	planFileMode   = 0o644
)

// The queue's places over a plan text, off the snapshot values the wiring binds to the queue's ports, and none where the wiring loads no queue. The wiring reads at each call, as the file stands then. [[spec/tickets/plan-writes-off-go]]
func placesOver(disk diskDoors, root string, store *q.Store) func(string) map[string]string {
	return func(plan string) map[string]string {
		if bound, ok := queueBound(disk, root); ok && store != nil {
			snap := store.Snapshot()
			rows, _ := snap.Read(bound(queue.RowsPort)).([]ticket.Ticket)
			cloud, _ := snap.Read(bound(queue.CloudPort)).([]string)
			stood, _ := snap.Read(bound(queue.StoodPort)).(map[string]int64)
			minute, _ := snap.Read(bound(queue.MinutePort)).(int64)
			block, _ := snap.Read(bound("config/block")).(float64)
			day, _ := snap.Read(bound("config/day")).(float64)
			fail, _ := snap.Read(bound("config/fail")).(float64)
			sum := sha256.Sum256([]byte(plan))
			return queue.PlacesOf(queue.PlacesIn{
				Rows: rows, Plan: q.Content{Hash: hex.EncodeToString(sum[:]), Text: plan},
				Cloud: cloud, Stood: stood, Minute: minute, Block: block, Day: day, Fail: fail,
			})
		}
		return map[string]string{}
	}
}

// The name each local name of the first queue instance binds to, off the wiring under the root. [[spec/tickets/plan-writes-off-go]]
func queueBound(disk diskDoors, root string) (func(local string) string, bool) {
	text, err := disk.read(filepath.Join(root, filepath.FromSlash(q.WiringFile)))
	if err != nil {
		return nil, false
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		return nil, false
	}
	for _, one := range w.Instances {
		if one.Module == queueModuleType {
			name := one.Name
			return func(local string) string { return w.Bound(name, local) }, true
		}
	}
	return nil, false
}
