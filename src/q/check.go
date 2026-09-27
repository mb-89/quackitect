// The catalog check: every fault at once, each naming its file and line, so
// the index refuses to start on any of them.
// [[spec/design_output/model#the-index-resolves-in-passes]]
package q

import (
	"fmt"
	"regexp"
	"strings"
)

type Kind string

const (
	Twice     Kind = "a name registered twice"
	NoDefault Kind = "a name with no default"
	NoName    Kind = "an input naming no name"
	OtherType Kind = "an input of another type"
	Cycle     Kind = "a cycle among derived names"
	BadName   Kind = "a name of other than lowercase segments"
)

type Fault struct {
	Kind  Kind
	Name  string
	Where []string
	Says  string
}

func (one Fault) String() string {
	return fmt.Sprintf("%s: %s, %s, at %s", one.Kind, one.Name, one.Says, strings.Join(one.Where, " and "))
}

var (
	segment = regexp.MustCompile(`^([a-z0-9][a-z0-9-]*|<[a-z0-9][a-z0-9-]*>)$`)
	rest    = regexp.MustCompile(`^<[a-z0-9][a-z0-9-]*\.\.\.>$`)
)

// A key taking the rest of the name stands last, after a segment of its own. [[spec/tickets/files-topic-reads-the-rows]]
func wellNamed(name string) bool {
	parts := strings.Split(name, "/")
	for i, one := range parts {
		last := i > 0 && i == len(parts)-1
		if !segment.MatchString(one) && !(last && rest.MatchString(one)) {
			return false
		}
	}
	return true
}

type named struct {
	name string
	regs []*registration
}

func byName(regs []*registration) []named {
	var order []named
	at := map[string]int{}
	for _, one := range regs {
		i, ok := at[one.name]
		if !ok {
			i = len(order)
			at[one.name] = i
			order = append(order, named{name: one.name})
		}
		order[i].regs = append(order[i].regs, one)
	}
	return order
}

func placesOf(regs []*registration) []string {
	places := make([]string, 0, len(regs))
	for _, one := range regs {
		places = append(places, one.where)
	}
	return places
}

// A name takes one writer, since an alternative calculation is another module type in the wiring. [[spec/tickets/the-wiring-file-binds-ports]]
func twice(group named) []Fault {
	if len(group.regs) < 2 {
		return nil
	}
	ports := make([]string, 0, len(group.regs))
	for _, one := range group.regs {
		ports = append(ports, one.portName())
	}
	return []Fault{{Kind: Twice, Name: group.name, Where: placesOf(group.regs), Says: fmt.Sprintf("it stands %d times, written by %s", len(group.regs), strings.Join(ports, " and "))}}
}

func (c *Catalog) Check() []Fault {
	regs := c.all()
	var faults []Fault
	for _, one := range regs {
		if !wellNamed(one.name) {
			faults = append(faults, Fault{Kind: BadName, Name: one.name, Where: []string{one.where}, Says: "each segment reads lowercase, or a <key>"})
		}
		if one.missing {
			faults = append(faults, Fault{Kind: NoDefault, Name: one.name, Where: []string{one.where}, Says: fmt.Sprintf("its %s default stands nil", one.typ)})
		}
	}
	groups := byName(regs)
	active := activeOf(groups)
	for _, group := range groups {
		faults = append(faults, twice(group)...)
	}
	for _, group := range groups {
		if one := active[group.name]; one != nil {
			faults = append(faults, inputFaults(one, groups)...)
		}
	}
	return append(faults, cycles(groups, active)...)
}

// The first registration of each name stands, and Check names every other as Twice. [[spec/tickets/the-wiring-file-binds-ports]]
func activeOf(groups []named) map[string]*registration {
	active := make(map[string]*registration, len(groups))
	for _, group := range groups {
		active[group.name] = group.regs[0]
	}
	return active
}

func resolve(groups []named, name string) *named {
	for i := range groups {
		if groups[i].name == name {
			return &groups[i]
		}
	}
	for i := range groups {
		if matches(groups[i].name, name) {
			return &groups[i]
		}
	}
	return nil
}

func inputFaults(one *registration, groups []named) []Fault {
	var faults []Fault
	for _, in := range one.inputs {
		group := resolve(groups, in.name)
		if group == nil {
			faults = append(faults, Fault{Kind: NoName, Name: one.name, Where: []string{one.where}, Says: fmt.Sprintf("field %s reads %s, which the catalog lacks", in.field, in.name)})
			continue
		}
		if writer := group.regs[0]; writer.typ != in.typ {
			faults = append(faults, Fault{Kind: OtherType, Name: one.name, Where: []string{one.where}, Says: fmt.Sprintf("field %s at %s is %s, and %s at %s is %s", in.field, in.portOr(), in.typ, in.name, writer.portName(), writer.typ)})
		}
	}
	return faults
}

func (in input) portOr() string {
	if in.port == "" {
		return in.name
	}
	return in.port
}

func cycles(groups []named, active map[string]*registration) []Fault {
	const (
		unseen = iota
		open
		closed
	)
	state := map[string]int{}
	var faults []Fault
	var path []string
	var walk func(name string)
	walk = func(name string) {
		one := active[name]
		if one == nil || one.kind != derived {
			return
		}
		switch state[name] {
		case closed:
			return
		case open:
			for i, at := range path {
				if at == name {
					round := append(append([]string(nil), path[i:]...), name)
					faults = append(faults, Fault{Kind: Cycle, Name: name, Where: []string{one.where}, Says: strings.Join(round, " reads ")})
				}
			}
			return
		}
		state[name] = open
		path = append(path, name)
		for _, in := range one.inputs {
			if group := resolve(groups, in.name); group != nil {
				walk(group.name)
			}
		}
		path = path[:len(path)-1]
		state[name] = closed
	}
	for _, group := range groups {
		walk(group.name)
	}
	return faults
}
