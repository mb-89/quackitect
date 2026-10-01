// The watchdog: the leases, the wait before a restart, the alarms, and the
// given name session/alarms.
// [[spec/design_output/model#watchdogs]]
package index

import (
	"sort"
	"sync"
	"time"

	"quackitect/src/config"
	"quackitect/src/q"
)

const AlarmsName = "session/alarms"

// [[spec/design_output/model#a-lease]]
type Lease struct {
	Part    string        `json:"part"`
	Renewed time.Time     `json:"renewed"`
	Term    time.Duration `json:"term"`
}

// [[spec/design_output/model#watchdogs]]
type Alarm struct {
	Part   string    `json:"part"`
	Since  time.Time `json:"since"`
	Faults int       `json:"faults"`
	Error  string    `json:"error"`
	Clears string    `json:"clears"`
}

// [[spec/design_output/model#restarts]]
type DogSettings struct {
	First  time.Duration
	Cap    time.Duration
	Faults int
	Window time.Duration
}

type Dog struct {
	mu       sync.Mutex
	now      func() time.Time
	store    *q.Store
	as       q.Writer
	settings DogSettings
	leases   map[string]Lease
	faults   map[string][]time.Time
	waits    map[string]time.Duration
	alarms   map[string]Alarm
}

// [[spec/design_output/model#restarts]]
func dogSettingsOf(root string) DogSettings {
	return DogSettings{
		First:  time.Duration(config.Count(root, "watchdog.backoffFirst")) * time.Second,
		Cap:    time.Duration(config.Count(root, "watchdog.backoffCap")) * time.Second,
		Faults: config.Count(root, "watchdog.faults"),
		Window: time.Duration(config.Count(root, "watchdog.window")) * time.Second,
	}
}

// The dog commits its alarms as the writer Registers hands back. [[spec/tickets/commits-name-their-writer]]
func NewDog(now func() time.Time, store *q.Store, as q.Writer, settings DogSettings) *Dog {
	return &Dog{
		now: now, store: store, as: as, settings: settings,
		leases: map[string]Lease{}, faults: map[string][]time.Time{},
		waits: map[string]time.Duration{}, alarms: map[string]Alarm{},
	}
}

// A part takes a lease under its provider's name. [[spec/design_output/model#a-lease]]
func (d *Dog) Hold(part string, term time.Duration) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.leases[part] = Lease{Part: part, Renewed: d.now(), Term: term}
}

func (d *Dog) Beat(part string) {
	d.mu.Lock()
	defer d.mu.Unlock()
	if one, ok := d.leases[part]; ok {
		one.Renewed = d.now()
		d.leases[part] = one
	}
}

// The lease a part holds, which a case reads. [[spec/design_output/model#a-lease]]
func (d *Dog) Lease(part string) (Lease, bool) {
	d.mu.Lock()
	defer d.mu.Unlock()
	one, ok := d.leases[part]
	return one, ok
}

// An expired lease marks its part stale where a provider owns the part, and the next commit of the part clears it. A part with no provider, as the index, still reads expired. [[spec/design_output/model#a-stale-mark]]
func (d *Dog) Check() []string {
	d.mu.Lock()
	defer d.mu.Unlock()
	now, expired := d.now(), []string{}
	for part, one := range d.leases {
		since := one.Renewed.Add(one.Term)
		if now.After(since) {
			d.store.Stale(part, since)
			expired = append(expired, part)
		}
	}
	sort.Strings(expired)
	return expired
}

// Hands each part a later Check finds expired to hand. [[spec/tickets/watchdogs-span-the-processes]]
func (d *Dog) Expired(hand func(part string)) {}

// The parts whose lease still holds, in order. [[spec/design_output/model#a-context-holds-a-lease]]
func (d *Dog) Live() []string {
	d.mu.Lock()
	defer d.mu.Unlock()
	now, live := d.now(), []string{}
	for part, one := range d.leases {
		if !now.After(one.Renewed.Add(one.Term)) {
			live = append(live, part)
		}
	}
	sort.Strings(live)
	return live
}

// The wait doubles from the first to the cap, and a run of faults in the window raises an alarm and stops the restarts. [[spec/design_output/model#restarts]]
func (d *Dog) Fault(part string, err error) (time.Duration, bool) {
	d.mu.Lock()
	defer d.mu.Unlock()
	now := d.now()
	kept := []time.Time{}
	for _, at := range append(d.faults[part], now) {
		if now.Sub(at) <= d.settings.Window {
			kept = append(kept, at)
		}
	}
	d.faults[part] = kept
	if d.settings.Faults > 0 && len(kept) >= d.settings.Faults {
		said := ""
		if err != nil {
			said = err.Error()
		}
		d.alarms[part] = Alarm{Part: part, Since: kept[0], Faults: len(kept), Error: said, Clears: "quack restart " + part}
		d.publish()
		return 0, false
	}
	wait := d.settings.First
	if held, ok := d.waits[part]; ok {
		wait = min(held*2, d.settings.Cap)
	}
	d.waits[part] = wait
	return wait, true
}

func (d *Dog) Alarms() []Alarm {
	d.mu.Lock()
	defer d.mu.Unlock()
	return d.standing()
}

// The clear takes the alarm off session/alarms, and the next fault starts a new run. [[spec/design_output/model#restarts]]
func (d *Dog) Clear(part string) error {
	d.mu.Lock()
	defer d.mu.Unlock()
	delete(d.alarms, part)
	delete(d.faults, part)
	delete(d.waits, part)
	return d.publish()
}

func (d *Dog) standing() []Alarm {
	out := make([]Alarm, 0, len(d.alarms))
	for _, one := range d.alarms {
		out = append(out, one)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Part < out[j].Part })
	return out
}

func (d *Dog) publish() error {
	_, err := d.store.Commit(d.store.Snapshot().Revision, d.as, map[string]any{AlarmsName: d.standing()})
	return err
}
