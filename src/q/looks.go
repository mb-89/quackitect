// How a registration presents itself: its doc, label, icon and look, and
// the fields of an action's input. The start refuses a name or a field
// with no description. [[spec/design_output/model#the-options]]
package q

import (
	"fmt"
	"reflect"
	"strings"
)

// The kind of value a port holds, so a renderer knows how to draw it. [[spec/design_output/model#the-options]]
type Look string

const (
	Count Look = "count"
	Rows  Look = "rows"
	State Look = "state"
)

// [[spec/design_output/model#the-options]]
func Label(text string) Option { return func(one *registration) { one.label = text } }

// [[spec/design_output/model#the-options]]
func Icon(name string) Option { return func(one *registration) { one.icon = name } }

// [[spec/design_output/model#the-options]]
func Looks(kind Look) Option { return func(one *registration) { one.looks = kind } }

// A field of an action's input, off its json, label and doc tags. [[spec/design_output/model#a-module-is-one-file]]
type Field struct {
	Name  string
	Key   string
	Label string
	Doc   string
}

// An input of a kind other than a struct answers no fields. [[spec/design_output/model#a-module-is-one-file]]
func fieldsOf(typ reflect.Type) []Field {
	if typ.Kind() != reflect.Struct {
		return nil
	}
	var fields []Field
	for i := 0; i < typ.NumField(); i++ {
		one := typ.Field(i)
		key, _, _ := strings.Cut(one.Tag.Get("json"), ",")
		if !one.IsExported() || key == "-" {
			continue
		}
		if key == "" {
			key = one.Name
		}
		fields = append(fields, Field{Name: one.Name, Key: key, Label: one.Tag.Get("label"), Doc: one.Tag.Get("doc")})
	}
	return fields
}

// The one text every surface reads off a registration. [[spec/design_output/model#the-options]]
type Presentation struct {
	Doc    string
	Label  string
	Icon   string
	Looks  Look
	Fields []Field
}

// [[spec/design_output/model#the-options]]
func (c *Catalog) Presentation(name string) (Presentation, bool) {
	for _, one := range c.all() {
		if one.name == name {
			return Presentation{Doc: one.doc, Label: one.label, Icon: one.icon, Looks: one.looks, Fields: one.fields}, true
		}
	}
	return Presentation{}, false
}

// A fault for each registration with no doc, and each action field with no doc tag. [[spec/design_output/model#a-module-is-one-file]]
func (c *Catalog) Undescribed() []Fault {
	var faults []Fault
	for _, one := range c.all() {
		if one.doc == "" {
			faults = append(faults, Fault{Kind: NoDoc, Name: one.portName(), Where: []string{one.where}, Says: "it carries no q.Doc"})
		}
		for _, field := range one.fields {
			if field.Doc == "" {
				faults = append(faults, Fault{Kind: NoDoc, Name: one.portName(), Where: []string{one.where}, Says: fmt.Sprintf("field %s carries no doc tag", field.Name)})
			}
		}
	}
	return faults
}
