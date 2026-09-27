// The catalog check: every fault at once, each naming its file and line, so
// the index refuses to start on any of them.
// [[spec/design_output/model#the-catalog-check]]
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
	TwoActive Kind = "two providers active"
	NoAlt     Kind = "a key picking no registered alt"
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

func providerKey(name string) string { return "providers." + name }

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

// The key providers.<name> picks an alt, and with the key empty the plain registration stands. [[spec/design_output/model#the-provider-kinds]]
func pick(group named, keys map[string]string) (*registration, *Fault) {
	if chosen := keys[providerKey(group.name)]; chosen != "" {
		for _, one := range group.regs {
			if one.alt == chosen {
				return one, nil
			}
		}
		return nil, &Fault{Kind: NoAlt, Name: group.name, Where: placesOf(group.regs), Says: fmt.Sprintf("%s names %q", providerKey(group.name), chosen)}
	}
	if len(group.regs) == 1 {
		return group.regs[0], nil
	}
	var plain []*registration
	for _, one := range group.regs {
		if one.alt == "" {
			plain = append(plain, one)
		}
	}
	if len(plain) >= 1 {
		return plain[0], nil
	}
	return nil, &Fault{Kind: TwoActive, Name: group.name, Where: placesOf(group.regs), Says: fmt.Sprintf("%s picks none of them", providerKey(group.name))}
}

func placesOf(regs []*registration) []string {
	places := make([]string, 0, len(regs))
	for _, one := range regs {
		places = append(places, one.where)
	}
	return places
}

func twice(group named) []Fault {
	byAlt := map[string][]*registration{}
	var alts []string
	for _, one := range group.regs {
		if _, ok := byAlt[one.alt]; !ok {
			alts = append(alts, one.alt)
		}
		byAlt[one.alt] = append(byAlt[one.alt], one)
	}
	var faults []Fault
	for _, alt := range alts {
		if regs := byAlt[alt]; len(regs) > 1 {
			faults = append(faults, Fault{Kind: Twice, Name: group.name, Where: placesOf(regs), Says: fmt.Sprintf("alt %q stands %d times", alt, len(regs))})
		}
	}
	return faults
}

func (c *Catalog) Check(keys map[string]string) []Fault {
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
	active := map[string]*registration{}
	for _, group := range groups {
		faults = append(faults, twice(group)...)
		chosen, fault := pick(group, keys)
		if fault != nil {
			faults = append(faults, *fault)
			continue
		}
		active[group.name] = chosen
	}
	for _, group := range groups {
		if one := active[group.name]; one != nil {
			faults = append(faults, inputFaults(one, groups)...)
		}
	}
	return append(faults, cycles(groups, active)...)
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
		if held := group.regs[0].typ; held != in.typ {
			faults = append(faults, Fault{Kind: OtherType, Name: one.name, Where: []string{one.where}, Says: fmt.Sprintf("field %s is %s, and %s is %s", in.field, in.typ, in.name, held)})
		}
	}
	return faults
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
