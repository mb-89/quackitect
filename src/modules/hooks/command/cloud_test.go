// The cloud read over either variable, where a flat value reads false.
// [[spec/tickets/cage-libs-leave]]
package command_test

import (
	"testing"

	"quackitect/src/modules/hooks/command"
)

// [[spec/guidance/cloud/cloud]]
func TestInCloudReadsEitherVariableAndAFlatValueReadsFalse(t *testing.T) {
	for _, one := range []struct {
		env  map[string]string
		want bool
	}{
		{map[string]string{"CLAUDE_CODE_REMOTE": "1"}, true},
		{map[string]string{"CLAUDE_CODE_REMOTE": "true"}, true},
		{map[string]string{"SE_CLOUD": "yes"}, true},
		{map[string]string{"SE_CLOUD": "0", "CLAUDE_CODE_REMOTE": "true"}, true},
		{map[string]string{"CLAUDE_CODE_REMOTE": "0"}, false},
		{map[string]string{"SE_CLOUD": "false"}, false},
		{map[string]string{"SE_CLOUD": " False "}, false},
		{map[string]string{"SE_CLOUD": ""}, false},
		{map[string]string{}, false},
	} {
		if got := command.InCloud(func(name string) string { return one.env[name] }); got != one.want {
			t.Errorf("command.InCloud over %v reads %v, and wants %v", one.env, got, one.want)
		}
	}
}
