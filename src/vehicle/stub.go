// A stub: a bare project the vehicle drives from outside. The pure half names the files, the git door
// answers the upstream, and the disk door writes.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
package vehicle

import (
	"path/filepath"
	"slices"
	"strings"
)

// Git runs git in the method root, and answers its trimmed output and whether it exited zero. [[spec/design_output/doors#a-door-standing-on-another]]
type Git func(args ...string) (string, bool)

// Stubbed is what a stub answers: whether it landed, why not, and the files it holds. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
type Stubbed struct {
	OK    bool
	Why   string
	Files []string
}

// Writes a stub of the method into dest, under the upstream named or the method's remote. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
func StubInto(d Disk, git Git, now Clock, method, dest string, pid int, named string) (Stubbed, error) {
	if Same(dest, method) {
		return Stubbed{Why: "a stub lands beside its vehicle, elsewhere"}, nil
	}
	remote, ok := git("remote", "get-url", "origin")
	if !ok {
		remote = ""
	}
	upstream := UpstreamOf(remote, named)
	if upstream == "" {
		return Stubbed{Why: "the vehicle has no remote a cloud box can clone. Give it one, or say --upstream <url>."}, nil
	}
	// The brand enters the record here, so an empty one stops here. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
	brand := BrandOf(method)
	if brand == "" {
		return Stubbed{Why: EmptyBrand(method)}, nil
	}
	template := under(method, Template)
	files, err := walk(d, template, "")
	if err != nil {
		return Stubbed{}, err
	}
	version := VersionOf(d, method)
	id, err := IdentityHere(d, now, method, pid)
	if err != nil {
		return Stubbed{}, err
	}
	record := LinkOf(id, brand, upstream, version, Stamp(now))
	if err := d.MakeDir(dest); err != nil {
		return Stubbed{}, err
	}
	// A reader opening a stub reads the project it names. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
	for _, folder := range StubFolders(dest) {
		if err := d.MakeDir(under(dest, folder)); err != nil {
			return Stubbed{}, err
		}
		if err := d.Write(under(dest, folder+"/"+Keep), ""); err != nil {
			return Stubbed{}, err
		}
	}
	if err := d.Write(under(dest, Link), Doc(record)); err != nil {
		return Stubbed{}, err
	}
	if err := d.MakeDir(filepath.Dir(under(dest, Settings))); err != nil {
		return Stubbed{}, err
	}
	if err := d.Write(under(dest, Settings), Doc(SettingsOf(readIf(d, under(method, Settings))))); err != nil {
		return Stubbed{}, err
	}
	for _, rel := range files {
		at := under(dest, rel)
		if err := d.MakeDir(filepath.Dir(at)); err != nil {
			return Stubbed{}, err
		}
		text, err := d.Read(under(template, rel))
		if err != nil {
			return Stubbed{}, err
		}
		// The template's manifest carries no version, so the copy writes the tree's own. [[spec/design_output/vehicle#one-file-holds-the-version]]
		if strings.HasSuffix(rel, manifest) {
			text = VersionedJSON(text, version)
		}
		if err := d.Write(at, text); err != nil {
			return Stubbed{}, err
		}
		if strings.HasSuffix(rel, ".sh") {
			if err := d.Runnable(at); err != nil {
				return Stubbed{}, err
			}
		}
	}
	return Stubbed{OK: true, Files: StubFiles(files, dest)}, nil
}

// Enabled is what an enable answers: whether the settings stand, why not, and whether this run wrote them. [[spec/design_output/level0#a-stub-names-its-vehicle]]
type Enabled struct {
	OK    bool
	Why   string
	Wrote bool
}

// Names the method a directory marketplace in the work root's settings.local.json, under the brand its record names, and enables the plugin there. The file changes only where its text does. [[spec/design_output/level0#a-stub-names-its-vehicle]]
func EnablePlugin(d Disk, work, method string) (Enabled, error) {
	record, _ := Parse(readIf(d, under(work, Link)))
	name, _ := Get(record, "name")
	if !Truthy(name) {
		return Enabled{Why: work + " holds no " + Link + " naming a brand, so no marketplace takes the vehicle."}, nil
	}
	at := under(work, SettingsLocal)
	was := readIf(d, at)
	// The register spells a path with forward slashes, so the marketplace does too. [[spec/design_output/vehicle#the-register-holds-the-port]]
	made := ShimSettings(was, slashed(method), JSString(name))
	if made == was {
		return Enabled{OK: true}, nil
	}
	if err := d.MakeDir(filepath.Dir(at)); err != nil {
		return Enabled{}, err
	}
	if err := d.Write(at, made); err != nil {
		return Enabled{}, err
	}
	return Enabled{OK: true, Wrote: true}, nil
}

// Every file under a folder, slashed and sorted, or none where the folder stands nowhere. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
func walk(d Disk, at, rel string) ([]string, error) {
	if !d.Exists(at) {
		return []string{}, nil
	}
	listed, err := d.List(at)
	if err != nil {
		return nil, err
	}
	out := []string{}
	for _, one := range listed {
		next := one.Name
		if rel != "" {
			next = rel + "/" + one.Name
		}
		if one.Dir {
			inner, err := walk(d, filepath.Join(at, one.Name), next)
			if err != nil {
				return nil, err
			}
			out = append(out, inner...)
		} else {
			out = append(out, next)
		}
	}
	slices.Sort(out)
	return out, nil
}
