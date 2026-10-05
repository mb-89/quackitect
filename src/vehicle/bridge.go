// The vehicle a project carries, and the port the register hands it: the
// roads src/bridge/vehicle.js walks.
// [[spec/design_output/vehicle#the-register-holds-the-port]]
package vehicle

import (
	"path"
	"path/filepath"
	"slices"
)

// Settled is the vehicle a project reaches: its method and port, whether the project drives itself, and whether this call made the project. [[spec/design_output/vehicle#the-register-holds-the-port]]
type Settled struct {
	Method string
	Port   float64
	Itself bool
	Made   bool
}

// The vehicle the work's pointer names, or the work itself where it is a vehicle, else nil. [[spec/design_output/vehicle#the-register-holds-the-port]]
func VehicleOf(d Disk, env map[string]string, now Clock, work string, pid int, windows bool) (*Settled, error) {
	if method, port, ok := PointerOf(readIf(d, under(work, Pointer))); ok {
		return &Settled{Method: method, Port: port}, nil
	}
	if !IsVehicle(d, work) {
		return nil, nil
	}
	port, err := RegisteredPort(d, env, now, work, pid, windows)
	if err != nil {
		return nil, err
	}
	return &Settled{Method: work, Port: port, Itself: true}, nil
}

// Makes the work a project of the vehicle: the plugin's closure copied in, and the pointer written. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func MakesProject(d Disk, env map[string]string, now Clock, work, vehicle string, pid int, windows bool) (Settled, error) {
	port, err := RegisteredPort(d, env, now, vehicle, pid, windows)
	if err != nil {
		return Settled{}, err
	}
	for _, rel := range FilesOf(d, vehicle) {
		to := under(filepath.Join(work, filepath.FromSlash(PluginFolder)), rel)
		if err := d.MakeDir(filepath.Dir(to)); err != nil {
			return Settled{}, err
		}
		text, err := d.Read(under(filepath.Join(vehicle, filepath.FromSlash(PluginFolder)), rel))
		if err != nil {
			return Settled{}, err
		}
		if err := d.Write(to, text); err != nil {
			return Settled{}, err
		}
	}
	at := under(work, Pointer)
	if err := d.MakeDir(filepath.Dir(at)); err != nil {
		return Settled{}, err
	}
	pointer := NewObject()
	pointer.Set("method", vehicle)
	pointer.Set("port", port)
	if err := d.Write(at, Doc(pointer)); err != nil {
		return Settled{}, err
	}
	return Settled{Method: vehicle, Port: port, Made: true}, nil
}

// The files a stub takes: the two manifests, the modules the hooks manifest names, and the closure of their imports, read off the source. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func FilesOf(d Disk, vehicle string) []string {
	plugin := filepath.Join(vehicle, filepath.FromSlash(PluginFolder))
	out := slices.Clone(Manifests)
	queue := ModulesOf(readIf(d, under(plugin, Hooks)))
	for len(queue) > 0 {
		rel := queue[0]
		queue = queue[1:]
		if slices.Contains(out, rel) {
			continue
		}
		out = append(out, rel)
		for _, one := range ImportsOf(readIf(d, under(plugin, rel))) {
			queue = append(queue, path.Join(path.Dir(rel), one))
		}
	}
	return out
}

// The vehicle the work reaches, made a project where it reaches none. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func Settles(d Disk, env map[string]string, now Clock, work, vehicle string, pid int, windows bool) (Settled, error) {
	said, err := VehicleOf(d, env, now, work, pid, windows)
	if err != nil {
		return Settled{}, err
	}
	if said != nil {
		return *said, nil
	}
	return MakesProject(d, env, now, work, vehicle, pid, windows)
}

// Names the vehicle as the work's driver and settles the work on it. The pid comes off the root, so an identity made here replays in a case. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func AttachTo(d Disk, env map[string]string, now Clock, work, vehicle string, pid int, windows bool) (Settled, error) {
	id, err := IdentityHere(d, now, vehicle, pid)
	if err != nil {
		return Settled{}, err
	}
	if err := Attach(d, now, work, id); err != nil {
		return Settled{}, err
	}
	return Settles(d, env, now, work, vehicle, pid, windows)
}

// Whether a folder carries the plugin's manifest and the binary's source. [[spec/tickets/the-bridge-server-leaves]]
func IsVehicle(d Disk, folder string) bool {
	return d.Exists(under(folder, Marker)) && d.Exists(filepath.Join(folder, "src", "quack", "main.go"))
}

// The port the register holds for the method, registered at the first free one where it holds none. [[spec/design_output/vehicle#the-register-holds-the-port]]
func RegisteredPort(d Disk, env map[string]string, now Clock, method string, pid int, windows bool) (float64, error) {
	held := ReadRegister(d, env, windows)
	if known := PortOf(held, method); known != 0 {
		return known, nil
	}
	id, err := IdentityHere(d, now, method, pid)
	if err != nil {
		return 0, err
	}
	entry := WithPort(held, EntryOf(id, JSString(VersionOf(d, method)), method, Stamp(now)))
	RegisterVehicle(d, env, entry, windows)
	port, _ := Get(entry, "port")
	return port.(float64), nil
}
