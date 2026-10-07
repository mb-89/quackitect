// The sentinel: it hears each event, fires the failure a matching watch
// names, and arms a quiet watch on the clock door, so nothing polls.
// [[spec/design_output/failures#the-sentinel-fires-a-watch]]
package failure

import (
	"fmt"
	"regexp"
	"sort"
	"sync"
	"time"
)

// The failure a reaction raises where it answers a nonzero exit or runs nowhere. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
const reactionFails = "failure-reaction-fails"

// The clock the sentinel arms a quiet watch on, which the clock module's Clock answers. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Timer interface {
	AfterFunc(span time.Duration, hand func()) (stop func() bool)
}

// One event the hooks door hears: its kind and its text. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Event struct {
	Kind string
	Text string
}

// One quiet watch armed on the clock: its stop, and the round that armed it, so a hand firing as its stop lands drops its fire. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type armed struct {
	stop  func() bool
	round int
}

// The watches of a registry, armed on a clock, firing through a hand and running each reaction through the process door. The real clock calls a hand on its own goroutine, so a mutex holds the armed watches. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Sentinel struct {
	mu       sync.Mutex
	registry Registry
	clock    Timer
	fire     func(Raised)
	run      Runner
	watched  []Node
	matches  map[string]*regexp.Regexp
	armed    map[string]*armed
	rounds   int
}

// A sentinel over the registry's watches, each quiet watch armed at once. A watch whose match reads as no pattern stays out, since NodeOf names it. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func NewSentinel(registry Registry, clock Timer, fire func(Raised), run Runner) *Sentinel {
	one := &Sentinel{registry: registry, clock: clock, fire: fire, run: run, matches: map[string]*regexp.Regexp{}, armed: map[string]*armed{}}
	for _, node := range registry {
		if node.Watch == nil {
			continue
		}
		match, err := regexp.Compile(node.Watch.Match)
		if err != nil {
			continue
		}
		one.matches[node.ID] = match
		one.watched = append(one.watched, node)
	}
	sort.Slice(one.watched, func(a, b int) bool { return one.watched[a].ID < one.watched[b].ID })
	one.mu.Lock()
	for _, node := range one.watched {
		if node.Watch.Quiet > 0 {
			one.arm(node)
		}
	}
	one.mu.Unlock()
	return one
}

// Fires each watch the event matches with no quiet span, and arms each quiet one again. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func (one *Sentinel) Hear(event Event) {
	one.mu.Lock()
	due := []Node{}
	for _, node := range one.watched {
		if node.Watch.Event != event.Kind || !one.matches[node.ID].MatchString(event.Text) {
			continue
		}
		if node.Watch.Quiet > 0 {
			one.arm(node)
			continue
		}
		due = append(due, node)
	}
	one.mu.Unlock()
	for _, node := range due {
		one.fires(node)
	}
}

// Arms the node's quiet span on the clock, stopping the span it armed before. The caller holds the mutex. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func (one *Sentinel) arm(node Node) {
	if held := one.armed[node.ID]; held != nil {
		held.stop()
	}
	one.rounds++
	round := one.rounds
	one.armed[node.ID] = &armed{round: round, stop: one.clock.AfterFunc(time.Duration(node.Watch.Quiet)*time.Minute, func() { one.quietPasses(node, round) })}
}

// Fires a quiet watch once its span passes, where no later round armed it again, and leaves it unarmed until a matching event comes. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func (one *Sentinel) quietPasses(node Node, round int) {
	one.mu.Lock()
	held := one.armed[node.ID]
	if held == nil || held.round != round {
		one.mu.Unlock()
		return
	}
	delete(one.armed, node.ID)
	one.mu.Unlock()
	one.fires(node)
}

// Raises the node's failure through the door, then runs its reaction, and raises failure-reaction-fails where the reaction fails. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func (one *Sentinel) fires(node Node) {
	one.fire(Raise(one.registry, node.ID, fmt.Sprintf("%s fires on its %s watch", node.ID, node.Watch.Event)))
	if node.Reaction == "" {
		return
	}
	if exit, err := one.run.Run(node.Reaction); err != nil || exit != 0 {
		one.fire(Raise(one.registry, reactionFails, fmt.Sprintf("%s runs ./RUNME.sh %s, and it answers exit %d, %v", node.ID, node.Reaction, exit, err)))
	}
}
