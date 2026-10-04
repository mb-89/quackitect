// What a retro's collect copies from outside the tree: the transcripts and the
// memory the harness keeps under home, and the scratchpads under temp.
// [[spec/guidance/retro/collect]]
package main

// The harness names a folder off a path by turning every mark past a letter or a digit into a dash. [[spec/guidance/retro/collect]]
func retroSlugOf(root string) string { return "" }

// A folder belongs to this tree where it carries the tree's own name, a folder inside it, or a scratch folder named off it. [[spec/guidance/retro/collect]]
func retroBelongs(name, slug string, inside []string) bool { return false }
