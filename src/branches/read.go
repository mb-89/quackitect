// What the listing reads of a work ref off the git door: its branch, its tip,
// the second its tip was made, and whether trunk carries its group closed.
// [[spec/design_output/work#the-listing-reads-git-once]]
package branches

// A ref as the listing reads it. [[spec/design_output/work#the-listing-reads-git-once]]
type ref struct {
	Branch string
	Tip    string
	When   int64
	Merged bool
}
