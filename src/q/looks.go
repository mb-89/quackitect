// How a registration presents itself: its doc, label, icon and look, and
// the fields of an action's input. The start refuses a name or a field
// with no description. [[spec/design_output/model#the-options]]
package q

// The kind of value a port holds, so a renderer knows how to draw it. [[spec/design_output/model#the-options]]
type Look string

const (
	Count Look = "count"
	Rows  Look = "rows"
	State Look = "state"
)

// [[spec/design_output/model#the-options]]
func Label(text string) Option { return func(one *registration) {} }

// [[spec/design_output/model#the-options]]
func Icon(name string) Option { return func(one *registration) {} }

// [[spec/design_output/model#the-options]]
func Looks(kind Look) Option { return func(one *registration) {} }

// A field of an action's input, off its json, label and doc tags. [[spec/design_output/model#a-module-is-one-file]]
type Field struct {
	Name  string
	Label string
	Doc   string
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
	return Presentation{}, false
}

// A fault for each registration with no doc, and each action field with no doc tag. [[spec/design_output/model#a-module-is-one-file]]
func (c *Catalog) Undescribed() []Fault {
	return nil
}
