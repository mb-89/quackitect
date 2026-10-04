// A vehicle, and the project it drives: the pure half lib/vehicle.js holds. A
// vehicle carries an identity, a project names the vehicle driving it, and a
// register turns an identity into a place.
// [[spec/design_output/vehicle#what-a-vehicle-needs]]
package vehicle

import (
	"math"
	"regexp"
	"slices"
	"strings"
)

// The runtime folder RUN in lib/folders.js names. [[spec/design_input/the-runtime-files-stand-apart]]
const Run = ".se/.runtime"

// The files a vehicle and a project keep, and the register's name. [[spec/design_output/vehicle#what-a-vehicle-needs]]
const (
	Identity = Run + "/identity.json"
	Project  = Run + "/project.json"
	Register = "registry.json"
)

// The plugin folder a stub carries, and the manifest inside it that marks a vehicle's root. [[spec/design_output/vehicle#a-marker-names-the-root]]
const (
	PluginFolder = ".claude/skills/level0"
	manifest     = ".claude-plugin/plugin.json"
	Marker       = PluginFolder + "/" + manifest
)

// The folders a vehicle leaves behind. [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
var Left = []string{".git", ".se", "node_modules", "_to_delete"}

// The first port the register hands out. [[spec/design_output/vehicle#the-register-holds-the-port]]
const PortBase = 6510

// The pointer a project keeps to its vehicle and port. [[spec/design_input/the-runtime-files-stand-apart]]
const Pointer = ".se/.runtime/vehicle.json"

// The hooks manifest, and the two manifests a stub takes beside the modules. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
const Hooks = "hooks/hooks.json"

// Manifests are the two files a project's plugin folder always takes. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
var Manifests = []string{Hooks, manifest}

// The files and folders a stub holds. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
const (
	Link     = "vehicle.json"
	Template = "src/stub"
	Settings = ".claude/settings.json"
	Keep     = ".gitkeep"
)

// The folders a stub opens with, under the name the stub itself carries. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
var StubInside = []string{"spec/tickets", "spec/guidance", "src"}

// The identity a vehicle holds, or a fresh one where it holds none, and whether it is new. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func IdentityOf(read, fresh, at string) (any, bool) {
	held, _ := Parse(read)
	if id, _ := Get(held, "id"); Truthy(id) {
		return held, false
	}
	record := NewObject()
	record.Set("id", fresh)
	record.Set("made", at)
	return record, true
}

// The project's record where it names a driver, else nil. [[spec/design_output/vehicle#a-project-names-its-driver]]
func DrivenOf(read string) *Object {
	held, _ := Parse(read)
	if driver, _ := Get(held, "driver"); Truthy(driver) {
		return held.(*Object)
	}
	return nil
}

// The record a project keeps of its driver. [[spec/design_output/vehicle#a-project-names-its-driver]]
func Attaches(id, at string) *Object {
	out := NewObject()
	out.Set("driver", id)
	out.Set("since", at)
	return out
}

// The register with the entry in, past any entry of its id or its root. [[spec/design_output/vehicle#the-register-places-an-identity]]
func Registers(read string, entry *Object) []any {
	parsed, _ := Parse(read)
	held, _ := parsed.([]any)
	id, _ := Get(entry, "id")
	root, _ := Get(entry, "method_root")
	kept := []any{}
	for _, one := range held {
		its, _ := Get(one, "id")
		if strictEqual(its, id) || Same(rootOf(one), JSString(root)) {
			continue
		}
		kept = append(kept, one)
	}
	return append(kept, entry)
}

// The method root an entry names, as `one?.method_root ?? ""` reads it. [[spec/design_output/vehicle#the-register-places-an-identity]]
func rootOf(one any) string {
	root, held := Get(one, "method_root")
	if !held || root == nil {
		return ""
	}
	return JSString(root)
}

// One register entry. [[spec/design_output/vehicle#the-register-places-an-identity]]
func EntryOf(id string, version any, method, at string) *Object {
	out := NewObject()
	out.Set("id", id)
	out.Set("version", JSString(version))
	out.Set("method_root", method)
	out.Set("registered", at)
	return out
}

// The root the register places an identity at, or empty. [[spec/design_output/vehicle#the-register-places-an-identity]]
func Resolves(list []*Object, driver any) string {
	for _, one := range list {
		id, _ := Get(one, "id")
		root, _ := Get(one, "method_root")
		if strictEqual(id, driver) && Truthy(root) {
			return JSString(root)
		}
	}
	return ""
}

// The port the register holds for a root, or zero. [[spec/design_output/vehicle#the-register-holds-the-port]]
func PortOf(list []*Object, method string) float64 {
	for _, one := range list {
		root, _ := Get(one, "method_root")
		port, _ := Get(one, "port")
		if Truthy(root) && Same(JSString(root), method) && Truthy(ToNumber(port)) {
			return ToNumber(port)
		}
	}
	return 0
}

// The entry wearing the first port no other entry holds. [[spec/design_output/vehicle#the-register-holds-the-port]]
func WithPort(list []*Object, entry *Object) *Object {
	id, _ := Get(entry, "id")
	root, _ := Get(entry, "method_root")
	taken := map[float64]bool{}
	for _, one := range list {
		its, _ := Get(one, "id")
		if strictEqual(its, id) || Same(rootOf(one), JSString(root)) {
			continue
		}
		port, _ := Get(one, "port")
		number := ToNumber(port)
		if math.IsNaN(number) {
			number = 0
		}
		taken[number] = true
	}
	port := float64(PortBase)
	for taken[port] {
		port++
	}
	out := entry.Clone()
	out.Set("port", port)
	return out
}

// The method and port a pointer names, and whether it names any. [[spec/design_output/vehicle#a-project-names-its-driver]]
func PointerOf(read string) (string, float64, bool) {
	held, _ := Parse(read)
	method, _ := Get(held, "method")
	if !Truthy(method) {
		return "", 0, false
	}
	port, _ := Get(held, "port")
	number := ToNumber(port)
	if !Truthy(number) {
		number = PortBase
	}
	return JSString(method), number, true
}

// The one root the register holds, or empty where it holds none or several. [[spec/design_output/vehicle#one-vehicle-is-no-question]]
func OnlyVehicle(list []*Object) string {
	roots := []any{}
	for _, one := range list {
		root, _ := Get(one, "method_root")
		if Truthy(root) && !slices.ContainsFunc(roots, func(held any) bool { return strictEqual(held, root) }) {
			roots = append(roots, root)
		}
	}
	if len(roots) == 1 {
		return JSString(roots[0])
	}
	return ""
}

// The relative import or export a line opens with, as RELATIVE in lib/vehicle.js reads it. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
var relative = regexp.MustCompile(`(?m)^\s*(?:import|export)\b[^;'"]*?(?:\bfrom\s*)?["'](\.{1,2}/[^"']+)["']`)

// The relative imports a module names, read off its source. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func ImportsOf(source string) []string {
	out := []string{}
	for _, hit := range relative.FindAllStringSubmatch(source, -1) {
		out = append(out, hit[1])
	}
	return out
}

// The modules the hooks manifest names, each under the hooks folder. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func ModulesOf(read string) []string {
	held, _ := Parse(read)
	modules, _ := Get(held, "modules")
	list, ok := modules.([]any)
	if !ok {
		return []string{}
	}
	out := []string{}
	for _, one := range list {
		out = append(out, "hooks/"+strings.TrimPrefix(JSString(one), "./"))
	}
	return out
}

// Whether a path under the method travels into a vehicle. [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
func Travels(rel string) bool {
	said := slashed(rel)
	if said == "" || said == "." {
		return false
	}
	first, _, _ := strings.Cut(said, "/")
	return !slices.Contains(Left, first)
}

// Pair is the method a tree runs and the work it keeps, and whether they are one tree. [[spec/design_output/vehicle#one-tree-drives-itself]]
type Pair struct {
	Method string
	Work   string
	Itself bool
}

// The pair, where a missing half stands as the other. [[spec/design_output/vehicle#one-tree-drives-itself]]
func PairOf(method, work string) Pair {
	if method == "" {
		return Pair{Method: work, Work: work, Itself: true}
	}
	if work == "" {
		return Pair{Method: method, Work: method, Itself: true}
	}
	return Pair{Method: method, Work: work, Itself: Same(method, work)}
}

// Whether two paths name one root, in either slash and a drive letter in either case. [[spec/design_output/vehicle#the-register-holds-the-port]]
func Same(one, other string) bool { return RootKey(one) == RootKey(other) }

var drive = regexp.MustCompile(`^[A-Za-z]:/`)
var trailing = regexp.MustCompile(`/+$`)

// A path as Same compares it: forward slashes, no trailing slash, and a drive letter's case folded. [[spec/tickets/box-keys-fold-drive-letters]]
func RootKey(said string) string {
	path := trailing.ReplaceAllString(slashed(said), "")
	if drive.MatchString(path) {
		return strings.ToLower(path)
	}
	return path
}

func slashed(said string) string { return strings.ReplaceAll(said, `\`, "/") }

// The folders a stub opens with, under its own name or "project". [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
func StubFolders(name string) []string {
	said := FolderOf(name)
	if said == "" {
		said = "project"
	}
	out := []string{}
	for _, one := range StubInside {
		out = append(out, said+"/"+one)
	}
	return out
}

// The last folder of a path. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func FolderOf(method string) string {
	parts := strings.Split(trailing.ReplaceAllString(slashed(method), ""), "/")
	return parts[len(parts)-1]
}

var unslugged = regexp.MustCompile(`[^a-z0-9]+`)
var edges = regexp.MustCompile(`^-+|-+$`)

// The slug a marketplace takes off the vehicle's folder. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func BrandOf(method string) string {
	return edges.ReplaceAllString(unslugged.ReplaceAllString(strings.ToLower(FolderOf(method)), "-"), "")
}

// The refusal a folder slugging to nothing answers. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func EmptyBrand(method string) string {
	return FolderOf(method) + " carries no letter and no digit, so it slugs to an empty brand. Rename the folder to one a marketplace takes, or move the vehicle into one."
}

// A manifest wearing the tree's version, and the text as it stands where the version is empty or the text no object. [[spec/design_output/vehicle#one-file-holds-the-version]]
func VersionedJSON(text string, version any) string {
	held, _ := Parse(text)
	object, ok := held.(*Object)
	if !Truthy(version) || !ok {
		return text
	}
	out := object.Clone()
	out.Set("version", version)
	return Doc(out)
}

// The upstream: what --upstream names, else the remote. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
func UpstreamOf(remote, named string) string {
	if said := strings.TrimSpace(named); said != "" {
		return said
	}
	return strings.TrimSpace(remote)
}

// The record a stub keeps of its vehicle. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
func LinkOf(id, name, upstream string, version any, at string) *Object {
	out := NewObject()
	out.Set("vehicle", id)
	out.Set("name", name)
	out.Set("upstream", upstream)
	out.Set("version", JSString(version))
	out.Set("made", at)
	return out
}

// The vehicle's settings past every key opening on $. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
func SettingsOf(read string) *Object {
	held, _ := Parse(read)
	out := NewObject()
	object, ok := held.(*Object)
	if !ok {
		return out
	}
	for _, key := range object.Keys() {
		if !strings.HasPrefix(key, "$") {
			out.Set(key, object.vals[key])
		}
	}
	return out
}

// The files a stub holds: its folders' keeps, the record, the settings and the template. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
func StubFiles(template []string, name string) []string {
	out := []string{}
	for _, one := range StubFolders(name) {
		out = append(out, one+"/"+Keep)
	}
	out = append(out, Link, Settings)
	return append(out, template...)
}
