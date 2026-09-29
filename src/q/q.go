// The q core: every name has one owner, one type and one default. Modules
// register at init into Main, and a test builds a catalog of its own.
// [[spec/design_output/model]]
package q

import (
	"fmt"
	"reflect"
	"runtime"
	"strings"
	"sync"
	"time"
)

type provider int

// The mark a q tag carries after its name where the input reads with no writer. [[spec/tickets/the-config-module-resolves-layers]]
const optionalMark = "optional"

const (
	out provider = iota
	derived
	fold
	action
)

type input struct {
	field    string
	name     string
	port     string
	typ      reflect.Type
	optional bool
	absolute bool
}

type registration struct {
	name     string
	instance string
	port     string
	kind     provider
	typ      reflect.Type
	def      any
	missing  bool
	doc      string
	label    string
	icon     string
	looks    Look
	fields   []Field
	out      []Field
	answers  reflect.Type
	takes    reflect.Type
	deadline time.Duration
	writes   bool
	io       bool
	where    string
	key      bool
	shared   bool
	inputs   []input
	run      func(Snapshot) any
	keyed    func(snap Snapshot, name string) (any, error)
	mirror   Mirror
	globs    []string
	trip     func(body []byte) ([]byte, error)
	step     func(state, event any) (any, error)
	act      func(input any) ([]Request, error)
}

// The value under files/<path>, one type for every writer and reader of the family: the empty Content stands for a path the tree tracks nowhere. [[spec/tickets/files-seed-one-type]]
type Content struct {
	Hash string `json:"hash"`
	Text string `json:"text"`
	// The time the file last changed, in nanoseconds, as the index's file table stores it, so a view sorts by it. [[spec/tickets/tickets-becomes-a-module]]
	Changed int64 `json:"changed,omitempty"`
}

type Catalog struct {
	mu   sync.Mutex
	regs []*registration
}

// The hand a registration gives its module, which a commit names as its writer. [[spec/tickets/commits-name-their-writer]]
type Writer struct{ ones []*registration }

// Whether the hand carries the registration. [[spec/tickets/commits-name-their-writer]]
func (w Writer) holds(one *registration) bool {
	for _, held := range w.ones {
		if held == one {
			return true
		}
	}
	return false
}

// [[spec/tickets/commits-name-their-writer]]
func Join(hands ...Writer) Writer {
	var joined Writer
	for _, hand := range hands {
		joined.ones = append(joined.ones, hand.ones...)
	}
	return joined
}

var Main = New()

func New() *Catalog { return &Catalog{} }

type Option func(*registration)

func Doc(text string) Option             { return func(one *registration) { one.doc = text } }
func Deadline(span time.Duration) Option { return func(one *registration) { one.deadline = span } }

// An action declares its writes, and every call of it takes a record and a wait. [[spec/design_output/model#a-caller-sets-its-wait]]
func Writes() Option { return func(one *registration) { one.writes = true } }

// Marks the registration of an IO module, whose package reaches the outside. [[spec/design_output/model#io-modules-are-modules]]
func IO() Option { return func(one *registration) { one.io = true } }

// An out-port a module's start commits, with its built-in value, so what comes in has a writer module like any output. [[spec/tickets/commits-name-their-writer]]
func OutIn[T any](c *Catalog, name string, def T, opts ...Option) Writer {
	return c.add(outOf(name, def), callerAt(2), opts)
}

func Derived[In, Out any](name string, def Out, fn func(In) Out, opts ...Option) Writer {
	return Main.add(derivedOf(name, def, fn), callerAt(2), opts)
}

func DerivedIn[In, Out any](c *Catalog, name string, def Out, fn func(In) Out, opts ...Option) Writer {
	return c.add(derivedOf(name, def, fn), callerAt(2), opts)
}

func Fold[S, E any](name string, def S, step func(S, E) S, opts ...Option) Writer {
	return Main.add(foldOf(name, def, step), callerAt(2), opts)
}

func FoldIn[S, E any](c *Catalog, name string, def S, step func(S, E) S, opts ...Option) Writer {
	return c.add(foldOf(name, def, step), callerAt(2), opts)
}

// A fold whose step refuses an event, so the land answers the error and keeps the state. [[spec/tickets/the-config-module-resolves-layers]]
func GuardIn[S, E any](c *Catalog, name string, def S, step func(S, E) (S, error), opts ...Option) Writer {
	return c.add(guardOf(name, def, step), callerAt(2), opts)
}

// Marks a config key the whole project shares, which reads the default file alone. [[spec/design_output/model#a-keys-layers]]
func Shared() Option { return func(one *registration) { one.shared = true } }

// Marks every input of the registration optional, so each passes the check with no writer and reads its zero value. [[spec/tickets/the-config-module-resolves-layers]]
func Optional() Option {
	return func(one *registration) {
		for i := range one.inputs {
			one.inputs[i].optional = true
		}
	}
}

func callerAt(skip int) string {
	_, file, line, ok := runtime.Caller(skip)
	if !ok {
		return "unknown"
	}
	return fmt.Sprintf("%s:%d", file, line)
}

func (c *Catalog) add(one *registration, where string, opts []Option) Writer {
	one.where = where
	for _, opt := range opts {
		opt(one)
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.regs = append(c.regs, one)
	return Writer{[]*registration{one}}
}

// A registration the wiring loads reads as `<instance>.<port>`, and any other as its name. [[spec/design_output/model#the-index-resolves-in-passes]]
func (one *registration) portName() string {
	if one.instance == "" {
		return one.name
	}
	return one.instance + "." + one.port
}

// Takes every registration of another catalog, such as the one the wiring loads. [[spec/design_output/model#the-wiring-file]]
func (c *Catalog) Take(other *Catalog) {
	regs := other.all()
	c.mu.Lock()
	defer c.mu.Unlock()
	c.regs = append(c.regs, regs...)
}

func (c *Catalog) all() []*registration {
	c.mu.Lock()
	defer c.mu.Unlock()
	return append([]*registration(nil), c.regs...)
}

func typeOf[T any]() reflect.Type { return reflect.TypeOf((*T)(nil)).Elem() }

func missing(value any) bool {
	v := reflect.ValueOf(value)
	if !v.IsValid() {
		return true
	}
	switch v.Kind() {
	case reflect.Pointer, reflect.Map, reflect.Slice, reflect.Interface, reflect.Func, reflect.Chan:
		return v.IsNil()
	}
	return false
}

func outOf[T any](name string, def T) *registration {
	return &registration{name: name, kind: out, typ: typeOf[T](), def: def, missing: missing(def)}
}

// Each field tagged q:"<name>" reads that name off the snapshot, and q:"<name>,optional" reads it where nobody writes it. The run reads the registration's inputs, so the name the wiring binds reaches it. [[spec/tickets/the-wiring-file-binds-ports]]
func derivedOf[In, Out any](name string, def Out, fn func(In) Out) *registration {
	inType := typeOf[In]()
	var inputs []input
	if inType.Kind() == reflect.Struct {
		for i := range inType.NumField() {
			field := inType.Field(i)
			if read, ok := field.Tag.Lookup("q"); ok {
				name, mark, _ := strings.Cut(read, ",")
				inputs = append(inputs, input{field: field.Name, name: name, typ: field.Type, optional: mark == optionalMark})
			}
		}
	}
	one := &registration{name: name, kind: derived, typ: typeOf[Out](), def: def, missing: missing(def), inputs: inputs}
	one.run = func(snap Snapshot) any {
		filled := reflect.New(inType).Elem()
		for _, in := range one.inputs {
			value := reflect.ValueOf(snap.Read(in.name))
			if in.family() {
				value = snap.family(in.name, in.typ)
			}
			if value.IsValid() && value.Type().AssignableTo(in.typ) {
				filled.FieldByName(in.field).Set(value)
			}
		}
		return fn(filled.Interface().(In))
	}
	return one
}

// An input of a map by path over a family, such as map[string]Content over files/<path...>, reads every value the family holds. [[spec/tickets/tickets-becomes-a-module]]
func (in input) family() bool {
	return in.typ.Kind() == reflect.Map && in.typ.Key().Kind() == reflect.String && keyed(in.name)
}

func foldOf[S, E any](name string, def S, step func(S, E) S) *registration {
	return guardOf(name, def, func(state S, event E) (S, error) { return step(state, event), nil })
}

// A fold whose step answers an error, which the land hands back with the state kept. [[spec/tickets/the-config-module-resolves-layers]]
func guardOf[S, E any](name string, def S, step func(S, E) (S, error)) *registration {
	apply := func(state, event any) (any, error) {
		now, ok := state.(S)
		if !ok {
			return nil, fmt.Errorf("%s holds a %T, not a %s", name, state, typeOf[S]())
		}
		one, ok := event.(E)
		if !ok {
			return nil, fmt.Errorf("%s takes a %s, not a %T", name, typeOf[E](), event)
		}
		return step(now, one)
	}
	return &registration{name: name, kind: fold, typ: typeOf[S](), def: def, missing: missing(def), step: apply}
}

// A family such as ops/<id> answers every key in its place. [[spec/design_output/model#a-name]]
func matches(pattern, name string) bool {
	if pattern == name {
		return true
	}
	want, got := strings.Split(pattern, "/"), strings.Split(name, "/")
	if last := len(want) - 1; isRest(want[last]) && len(got) > last {
		for _, one := range got[last:] {
			if one == "" {
				return false
			}
		}
		want, got = want[:last], got[:last]
	}
	if len(want) != len(got) {
		return false
	}
	for i := range want {
		if want[i] != got[i] && !(isKey(want[i]) && got[i] != "") {
			return false
		}
	}
	return true
}

func isKey(segment string) bool {
	return len(segment) > 2 && segment[0] == '<' && segment[len(segment)-1] == '>'
}

// A key <name...> takes the rest of the name, one segment or more. [[spec/tickets/files-topic-reads-the-rows]]
func isRest(segment string) bool {
	return isKey(segment) && strings.HasSuffix(segment, "...>")
}
