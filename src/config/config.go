// The config a Go program reads. One reader answers a key over the three
// layers, and answers the map a named file holds.
// [[spec/tickets/the-colours-stand-in-config]]
package config

// [[spec/tickets/the-colours-stand-in-config]]
const (
	Tracked = "spec/config/level0.json"
	Local   = ".se/.runtime/config.json"
)

// [[spec/tickets/the-colours-stand-in-config]]
func EnvOf(key string) string {
	return ""
}

// [[spec/tickets/the-colours-stand-in-config]]
func Value(root, key string) (any, bool) {
	return nil, false
}

// [[spec/tickets/the-colours-stand-in-config]]
func Map(root, path, key string) map[string]string {
	return nil
}
