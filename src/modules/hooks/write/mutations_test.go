// The mutations an edit call decodes to: each edit tool, the patch envelope,
// and the ambiguous edits that refuse.
// [[spec/tickets/copilot-hooks-run-in-go]]
package write

import (
	"errors"
	"reflect"
	"strings"
	"testing"
)

// A read answering the text the map holds, and an error past it. [[spec/tickets/copilot-hooks-run-in-go]]
func readsFrom(held map[string]string) func(string) (string, error) {
	return func(path string) (string, error) {
		text, ok := held[path]
		if !ok {
			return "", errors.New("no file at " + path)
		}
		return text, nil
	}
}

func TestMutationsDecodeEachEditTool(t *testing.T) {
	t.Parallel()
	read := readsFrom(map[string]string{"a.md": "an old line", "spec/a.md": "The door reads.\n"})
	cases := []struct {
		name string
		tool string
		args map[string]any
		want []Mutation
	}{
		{"edit", "edit", map[string]any{"path": "a.md", "old_str": "old", "new_str": "new"}, []Mutation{{Path: "a.md", Text: "an new line"}}},
		{"replace", "replace_string_in_file", map[string]any{"filePath": "spec/a.md", "oldString": "reads", "newString": "writes"}, []Mutation{{Path: "spec/a.md", Text: "The door writes.\n"}}},
		{"create", "create_file", map[string]any{"filePath": "spec/b.md", "content": "New.\n"}, []Mutation{{Path: "spec/b.md", Text: "New.\n"}}},
		{"write", "Write", map[string]any{"file_path": "spec/c.md", "content": "C.\n"}, []Mutation{{Path: "spec/c.md", Text: "C.\n"}}},
		{"multi", "multi_replace_string_in_file", map[string]any{"replacements": []any{
			map[string]any{"filePath": "spec/a.md", "oldString": "reads", "newString": "writes"},
			map[string]any{"filePath": "spec/a.md", "oldString": "door", "newString": "gate"},
		}}, []Mutation{{Path: "spec/a.md", Text: "The gate writes.\n"}}},
	}
	for _, one := range cases {
		got, err := Mutations(one.tool, one.args, read)
		if err != nil || !reflect.DeepEqual(got, one.want) {
			t.Errorf("%s decodes %+v, %v, and wants %+v", one.name, got, err, one.want)
		}
	}
	if got, err := Mutations("read_file", map[string]any{"filePath": "a.md"}, read); err != nil || len(got) != 0 {
		t.Errorf("a read decodes %+v, %v, and wants no change", got, err)
	}
	if _, err := Mutations("edit_file", map[string]any{}, read); err == nil || !strings.Contains(err.Error(), "exact") {
		t.Errorf("an unsupported edit answers %v, and wants a refusal naming the exact tools", err)
	}
	if _, err := Mutations("edit", map[string]any{"path": "x", "old_str": "x", "new_str": "y"}, readsFrom(map[string]string{"x": "xx"})); err == nil || !strings.Contains(err.Error(), "unique") {
		t.Errorf("an ambiguous edit answers %v, and wants a refusal asking unique context", err)
	}
	if _, err := Mutations("edit", map[string]any{"path": "x", "old_str": "aa", "new_str": "b"}, readsFrom(map[string]string{"x": "aaa"})); err == nil || !strings.Contains(err.Error(), "unique") {
		t.Errorf("an overlapping match answers %v, and wants a refusal asking unique context", err)
	}
}

func TestAPatchDecodesAddUpdateAndDelete(t *testing.T) {
	t.Parallel()
	read := readsFrom(map[string]string{"a.md": "same\nold\n", "c.md": "gone\n"})
	patch := "*** Begin Patch\n*** Update File: a.md\n@@\n same\n-old\n+new\n*** Add File: b.md\n+text\n*** Delete File: c.md\n*** End Patch"
	want := []Mutation{{Path: "a.md", Text: "same\nnew\n"}, {Path: "b.md", Text: "text\n"}, {Path: "c.md", Gone: true}}
	if got, err := PatchChanges(patch, read); err != nil || !reflect.DeepEqual(got, want) {
		t.Errorf("the patch decodes %+v, %v, and wants %+v", got, err, want)
	}
	removes := "*** Begin Patch\n*** Update File: a.md\n@@\n-old\n*** End Patch"
	if got, err := PatchChanges(removes, readsFrom(map[string]string{"a.md": "old\nnext\n"})); err != nil || !reflect.DeepEqual(got, []Mutation{{Path: "a.md", Text: "next\n"}}) {
		t.Errorf("a removal decodes %+v, %v, and wants the line and its newline gone", got, err)
	}
	if _, err := PatchChanges(removes, readsFrom(map[string]string{"a.md": "an old\n"})); err == nil || !strings.Contains(err.Error(), "matching lines") {
		t.Errorf("a partial line answers %v, and wants a refusal asking matching lines", err)
	}
	if _, err := PatchChanges("not a patch", read); err == nil || !strings.Contains(err.Error(), "envelope") {
		t.Errorf("a bare text answers %v, and wants a refusal naming the envelope", err)
	}
	if got, err := Mutations("apply_patch", map[string]any{"input": patch}, read); err != nil || !reflect.DeepEqual(got, want) {
		t.Errorf("apply_patch decodes %+v, %v, and wants %+v", got, err, want)
	}
}
