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

const (
	given provider = iota
	derived
	fold
	action
)

type input struct {
	field string
	name  string
	typ   reflect.Type
}

type registration struct {
	name     string
	kind     provider
	typ      reflect.Type
	def      any
	missing  bool
	alt      string
	doc      string
	deadline time.Duration
	op       bool
	writes   bool
	where    string
	inputs   []input
	run      func(Snapshot) any
	step     func(state, event any) (any, error)
	act      func(input any) ([]Call, error)
}

type Catalog struct {
	mu   sync.Mutex
	regs []*registration
}

// The hand a registration gives its module, which a commit names as its writer. [[spec/tickets/commits-name-their-writer]]
type Writer struct{ ones []*registration }

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
func Alt(name string) Option             { return func(one *registration) { one.alt = name } }
func Deadline(span time.Duration) Option { return func(one *registration) { one.deadline = span } }

// An action declares its writes; the Op option stands until every call takes a record and a wait. [[spec/design_output/model#a-caller-sets-its-wait]]
func Op() Option     { return func(one *registration) { one.op = true } }
func Writes() Option { return func(one *registration) { one.writes = true } }

func Given[T any](name string, def T, opts ...Option) Writer {
	return Main.add(givenOf(name, def), callerAt(2), opts)
}

func GivenIn[T any](c *Catalog, name string, def T, opts ...Option) Writer {
	return c.add(givenOf(name, def), callerAt(2), opts)
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

func givenOf[T any](name string, def T) *registration {
	return &registration{name: name, kind: given, typ: typeOf[T](), def: def, missing: missing(def)}
}

// Each field tagged q:"<name>" reads that name off the snapshot. [[spec/design_output/model#snapshots-and-revisions]]
func derivedOf[In, Out any](name string, def Out, fn func(In) Out) *registration {
	inType := typeOf[In]()
	var inputs []input
	if inType.Kind() == reflect.Struct {
		for i := range inType.NumField() {
			field := inType.Field(i)
			if read, ok := field.Tag.Lookup("q"); ok {
				inputs = append(inputs, input{field: field.Name, name: read, typ: field.Type})
			}
		}
	}
	run := func(snap Snapshot) any {
		filled := reflect.New(inType).Elem()
		for _, one := range inputs {
			value := reflect.ValueOf(snap.Read(one.name))
			if value.IsValid() && value.Type().AssignableTo(one.typ) {
				filled.FieldByName(one.field).Set(value)
			}
		}
		return fn(filled.Interface().(In))
	}
	return &registration{name: name, kind: derived, typ: typeOf[Out](), def: def, missing: missing(def), inputs: inputs, run: run}
}

func foldOf[S, E any](name string, def S, step func(S, E) S) *registration {
	apply := func(state, event any) (any, error) {
		now, ok := state.(S)
		if !ok {
			return nil, fmt.Errorf("%s holds a %T, not a %s", name, state, typeOf[S]())
		}
		one, ok := event.(E)
		if !ok {
			return nil, fmt.Errorf("%s takes a %s, not a %T", name, typeOf[E](), event)
		}
		return step(now, one), nil
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
