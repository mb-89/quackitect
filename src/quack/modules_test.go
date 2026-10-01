// Each topic the modules table names stands as a folder under src/modules,
// which a change there restarts.
// [[spec/design_output/model#a-module-rebuilds-alone]]
package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestEachTopicNamesAFolderUnderModules(t *testing.T) {
	for name, module := range modules {
		if module.topic == "" {
			continue
		}
		if module.starts != nil {
			t.Fatalf("%s carries a start and the topic %s, where an IO module stays in the IO process", name, module.topic)
		}
		if info, err := os.Stat(filepath.Join("..", "modules", module.topic)); err != nil || !info.IsDir() {
			t.Fatalf("%s names the topic %s, which stands as no folder under src/modules", name, module.topic)
		}
	}
}
