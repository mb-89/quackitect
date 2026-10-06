// What each door owns, off the owns.yaml beside it, and every use of an owned
// name standing outside the doors that own it.
// [[spec/design_output/doors#a-door-declares-what-it-owns]]
package owns

// The declaration's file name, and the marker passing one line. [[spec/design_output/doors#a-door-declares-what-it-owns]]
const (
	File   = "owns.yaml"
	Marker = "level0: OutsideInDoors - "
)

// One door's declaration: its name, the folder its owns.yaml stands in, the names it owns in each language, its files, and whether it stands at report. [[spec/design_output/doors#a-door-declares-what-it-owns]]
type Door struct {
	Name   string
	At     string
	Line   int
	Go     []string
	JS     []string
	Files  []string
	Report bool
}

// One use of an owned name outside every door owning it. [[spec/design_output/doors#nothing-walks-around-a-door]]
type Walk struct {
	File   string
	Line   int
	Column int
	Name   string
	Doors  []string
	Marked bool
	Reason string
	Report bool
}

// A declaration that reads as none, and where. [[spec/design_output/doors#a-door-declares-what-it-owns]]
type Fault struct {
	File string
	Line int
	Says string
}

// Every door the declarations name, and each fault of their form. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func Read(declared map[string]string, exists func(string) bool) ([]Door, []Fault) {
	return nil, nil
}

// Whether a path names a declaration. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func Declares(path string) bool {
	return false
}

// Whether the door's files hold the path. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func (one Door) Holds(path string) bool {
	return false
}

// Every use of an owned name the file makes outside the doors owning it. [[spec/design_output/doors#nothing-walks-around-a-door]]
func Walks(path, text string, doors []Door) []Walk {
	return nil
}

// The Go packages the declarations name, whole or by a member, sorted. [[spec/design_output/model#the-build-checks-imports]]
func Packages(doors []Door) []string {
	return nil
}

// The Go packages a door owns whole, sorted. [[spec/design_output/model#the-build-checks-imports]]
func Whole(doors []Door) []string {
	return nil
}
