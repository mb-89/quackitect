// The folder under a root and its fake answer the same reads.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestDirAndFakeDirAnswerAlike(t *testing.T) {
	t.Parallel()
	files := map[string]string{Folder + "/a.md": "one", Folder + "/b.md": "two", "spec/other.md": "three"}
	root := t.TempDir()
	for path, text := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	for name, reader := range map[string]Reader{"dir": Dir{Root: root}, "fake": FakeDir(files)} {
		if got := reader.Files(Folder); !reflect.DeepEqual(got, []string{"a.md", "b.md"}) {
			t.Errorf("%s lists %v", name, got)
		}
		if got, ok := reader.Read(Folder + "/b.md"); !ok || got != "two" {
			t.Errorf("%s reads %q, %v", name, got, ok)
		}
		if _, ok := reader.Read(Folder + "/none.md"); ok {
			t.Errorf("%s reads a file nobody wrote", name)
		}
		if got := reader.Files("spec/none"); len(got) != 0 {
			t.Errorf("%s lists %v under a folder nobody made", name, got)
		}
		if got := reader.Walk("spec"); !reflect.DeepEqual(got, []string{Folder + "/a.md", Folder + "/b.md", "spec/other.md"}) {
			t.Errorf("%s walks %v", name, got)
		}
		if got := reader.Walk("spec/none"); len(got) != 0 {
			t.Errorf("%s walks %v under a folder nobody made", name, got)
		}
	}
}
