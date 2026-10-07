// The cloud read over either variable, off the cases test/level0/writes-here.test.js
// and test/level0/cloud-desk.test.js held over lib/cloud.js.
// [[spec/tickets/cage-libs-leave]]
package command

import "testing"

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
		if got := InCloud(func(name string) string { return one.env[name] }); got != one.want {
			t.Errorf("InCloud over %v reads %v, and wants %v", one.env, got, one.want)
		}
	}
}
