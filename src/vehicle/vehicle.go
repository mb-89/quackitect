// A vehicle, made and placed: the roads src/scripts/vehicle.js walks. The pure
// half decides, the disk door writes, and a project keeps the identity of
// whatever drives it.
// [[spec/design_output/vehicle#what-a-vehicle-needs]]
package vehicle

import (
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Clock is the door the stamps read, so a case replays. [[spec/design_output/doors#one-door-per-outside-thing]]
type Clock func() time.Time

// The layout toISOString writes. [[spec/design_output/doors#one-door-per-outside-thing]]
const isoLayout = "2006-01-02T15:04:05.000Z"

// Stamp answers the clock's time as the clock door's stamp writes it. [[spec/design_output/doors#one-door-per-outside-thing]]
func Stamp(now Clock) string { return now().UTC().Format(isoLayout) }

// The digits of a stamp an identity keeps, and the base it writes them in. [[spec/design_output/vehicle#a-marker-names-the-root]]
const (
	stampTail = 12
	hexBase   = 16
)

// The path of a slashed relative name under a folder. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func under(folder, rel string) string { return filepath.Join(folder, filepath.FromSlash(rel)) }

// The method root a path stands under, found by the marker it carries, or empty. [[spec/design_output/vehicle#a-marker-names-the-root]]
func MethodRootFrom(d Disk, start string) string {
	here := trailing.ReplaceAllString(slashed(start), "")
	for here != "" {
		if d.Exists(under(here, Marker)) {
			return here
		}
		var up string
		if at := strings.LastIndex(here, "/"); at >= 0 {
			up = here[:at]
		} else {
			up = here[:len(here)-1]
		}
		if up == "" || up == here {
			return ""
		}
		here = up
	}
	return ""
}

// The identity the method holds, made and written where it holds none. The pid comes off the hand a root builds, so an identity replays in a case. [[spec/design_output/doors#a-door-reads-the-outside]]
func IdentityHere(d Disk, now Clock, method string, pid int) (string, error) {
	at := under(method, Identity)
	record, made := IdentityOf(readIf(d, at), idOf(now, pid), Stamp(now))
	if made {
		if err := d.MakeDir(filepath.Dir(at)); err != nil {
			return "", err
		}
		if err := d.Write(at, Doc(record)); err != nil {
			return "", err
		}
	}
	id, _ := Get(record, "id")
	return JSString(id), nil
}

var nonDigits = regexp.MustCompile(`[^0-9]`)

// A fresh identity: the stamp's last digits and the pid, each in hex. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func idOf(now Clock, pid int) string {
	digits := nonDigits.ReplaceAllString(Stamp(now), "")
	if len(digits) > stampTail {
		digits = digits[len(digits)-stampTail:]
	}
	tail, _ := strconv.ParseInt(digits, decimalBase, bitSize)
	return strconv.FormatInt(tail, hexBase) + strconv.FormatInt(int64(pid), hexBase)
}

// The folders the register stands in: SE_REGISTRY split by the platform's separator, else the runtime folder under home. [[spec/design_output/vehicle#the-register-places-an-identity]]
func RegisterDirs(env map[string]string, windows bool) []string {
	if said := env["SE_REGISTRY"]; said != "" {
		sep := ":"
		if windows {
			sep = ";"
		}
		out := []string{}
		for _, one := range strings.Split(said, sep) {
			if one != "" {
				out = append(out, one)
			}
		}
		return out
	}
	if home := HomeIn(env); home != "" {
		return []string{under(home, Run)}
	}
	return []string{}
}

// The home folder, as homeIn in src/scripts/editor.js reads it. [[spec/design_output/extension#the-link-stands]]
func HomeIn(env map[string]string) string {
	if said := env["USERPROFILE"]; said != "" {
		return said
	}
	return env["HOME"]
}

// Every register entry whose root still carries the marker. [[spec/design_output/vehicle#the-register-places-an-identity]]
func ReadRegister(d Disk, env map[string]string, windows bool) []*Object {
	out := []*Object{}
	for _, dir := range RegisterDirs(env, windows) {
		parsed, _ := Parse(readIf(d, filepath.Join(dir, Register)))
		list, _ := parsed.([]any)
		for _, one := range list {
			root, _ := Get(one, "method_root")
			if said, ok := root.(string); ok && said != "" && d.Exists(under(said, Marker)) {
				out = append(out, one.(*Object))
			}
		}
	}
	return out
}

// Writes the entry into every register folder that takes a write, and answers whether any did. [[spec/design_output/vehicle#the-register-places-an-identity]]
func RegisterVehicle(d Disk, env map[string]string, entry *Object, windows bool) bool {
	wrote := false
	for _, dir := range RegisterDirs(env, windows) {
		at := filepath.Join(dir, Register)
		if d.MakeDir(dir) != nil {
			continue
		}
		if d.Write(at, Doc(Registers(readIf(d, at), entry))) == nil {
			wrote = true
		}
	}
	return wrote
}

// Names the driver in the project. [[spec/design_output/vehicle#a-project-names-its-driver]]
func Attach(d Disk, now Clock, work, id string) error {
	at := under(work, Project)
	if err := d.MakeDir(filepath.Dir(at)); err != nil {
		return err
	}
	return d.Write(at, Doc(Attaches(id, Stamp(now))))
}

// Forgets the driver. [[spec/design_output/vehicle#a-project-names-its-driver]]
func Detach(d Disk, work string) error { return d.Remove(under(work, Project)) }

// The method and the work: the shim names the work root, and the tree the command line runs in is the fallback. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func RootsHere(d Disk, env map[string]string, start string) Pair {
	work := strings.TrimSpace(env["SE_WORK_ROOT"])
	if work == "" {
		work = start
	}
	if here := MethodRootFrom(d, start); here != "" {
		return PairOf(here, work)
	}
	list := ReadRegister(d, env, false)
	named := ""
	if driven := DrivenOf(readIf(d, under(work, Project))); driven != nil {
		driver, _ := Get(driven, "driver")
		named = Resolves(list, driver)
	}
	if named == "" {
		named = OnlyVehicle(list)
	}
	return PairOf(named, work)
}

// Put is what a copy answers: whether it landed, why not, and the files it carried. [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
type Put struct {
	OK    bool
	Why   string
	Count int
}

// Copies the method into a new place, its private folders left behind. [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
func Produce(d Disk, method, dest string, into bool) (Put, error) {
	if !into && d.Exists(dest) {
		return Put{Why: dest + " stands already. A vehicle lands in a new place"}, nil
	}
	// A Windows dest spells its folders with backslashes, and the method root comes slashed, so the two compare slashed. [[spec/tickets/window-verbs-windows-green]]
	if trailing.ReplaceAllString(slashed(dest), "") == trailing.ReplaceAllString(slashed(method), "") {
		return Put{Why: "a vehicle lands beside its method, elsewhere"}, nil
	}
	// One copy carries the method, its bytes and its run bits, and Travels leaves the private folders behind. [[spec/tickets/disk-door-copies-a-folder]]
	if err := d.MakeDir(dest); err != nil {
		return Put{}, err
	}
	count, err := d.CopyFolder(method, dest, Travels)
	if err != nil {
		return Put{}, err
	}
	return Put{OK: true, Count: count}, nil
}

// The method's identity and the register entry naming it. [[spec/design_output/vehicle#the-register-places-an-identity]]
func EntryFor(d Disk, now Clock, method string, version any, pid int) (string, *Object, error) {
	id, err := IdentityHere(d, now, method, pid)
	if err != nil {
		return "", nil, err
	}
	return id, EntryOf(id, version, method, Stamp(now)), nil
}

// The version a folder's package.json holds, or "0", as version() in src/scripts/cli-read.js reads it. [[spec/design_output/vehicle#one-file-holds-the-version]]
func VersionOf(d Disk, folder string) any {
	parsed, ok := Parse(readIf(d, filepath.Join(folder, "package.json")))
	if !ok {
		return "0"
	}
	if said, held := Get(parsed, "version"); held && said != nil {
		return said
	}
	return "0"
}

func readIf(d Disk, at string) string {
	said, err := d.Read(at)
	if err != nil {
		return ""
	}
	return said
}
