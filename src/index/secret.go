// The run's secret: the index mints it as its doors open, and writes it at the
// owner's mode beside the standing file. A /v1 post marking a person and every
// call to the first port carry it, so a caller the agent drives runs no verb as
// a person.
// [[spec/tickets/v1-takes-a-run-secret]]
package index

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"path/filepath"
	"reflect"
)

// The secret's file under the runtime folder, the header a caller carries it in, the field the person mark stands under, its length, and the owner's mode both files stand at. [[spec/tickets/v1-takes-a-run-secret]]
const (
	SecretFile   = "person.json"
	PersonHeader = "X-Quack-Person"
	personKey    = "Person"
	secretBytes  = 24
	ownerMode    = 0o600
)

// The secret's file under the root. [[spec/tickets/v1-takes-a-run-secret]]
func SecretPath(root string) string {
	return filepath.Join(root, filepath.FromSlash(Runtime), SecretFile)
}

// The body of the secret's file. [[spec/tickets/v1-takes-a-run-secret]]
type secretBody struct {
	Secret string `json:"secret"`
}

// A fresh secret, hex over random bytes. [[spec/tickets/v1-takes-a-run-secret]]
func mintsSecret() (string, error) {
	raw := make([]byte, secretBytes)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return hex.EncodeToString(raw), nil
}

// The secret the root's file holds, or nothing where it stands nowhere. [[spec/tickets/v1-takes-a-run-secret]]
func SecretOf(root string) string {
	said, err := readFile(SecretPath(root))
	if err != nil {
		return ""
	}
	var body secretBody
	if json.Unmarshal(said, &body) != nil {
		return ""
	}
	return body.Secret
}

// Writes a file at the owner's mode, and sets the mode again, since a write keeps the mode of a file that stands. [[spec/tickets/v1-takes-a-run-secret]] [[spec/tickets/standing-chmods-existing-file]]
func writesOwned(at string, body []byte) error {
	if err := writeFile(at, body, ownerMode); err != nil {
		return err
	}
	return chmodOf(at, ownerMode)
}

// Whether a caller's word matches the run's secret. A door holding none matches nothing. [[spec/tickets/v1-takes-a-run-secret]]
func (one *door) holdsSecret(said string) bool {
	return one.secret != "" && subtle.ConstantTimeCompare([]byte(said), []byte(one.secret)) == 1
}

// Whether a decoded input marks a person: a struct whose Person field stands true. The store decodes keys in any case, so the mark reads off the decoded value. [[spec/tickets/v1-takes-a-run-secret]] [[spec/tickets/v1-gate-reads-decoded-input]]
func MarksPerson(input any) bool {
	value := reflect.ValueOf(input)
	for value.Kind() == reflect.Pointer && !value.IsNil() {
		value = value.Elem()
	}
	if value.Kind() != reflect.Struct {
		return false
	}
	field := value.FieldByName(personKey)
	return field.IsValid() && field.Kind() == reflect.Bool && field.Bool()
}
