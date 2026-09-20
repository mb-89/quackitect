// The slug turning a heading into the anchor a pointer names. One source holds
// its cases, and each tool chain drives its own function off them.
// [[spec/design_output/vocabulary#the-slug-reads-one-source]]

// The cases this rule answers, which a second tool chain reads the same way. [[spec/design_output/vocabulary#the-slug-reads-one-source]]
export const CASES = "spec/config/slug.yaml";

// A quote goes before the rest dashes, so a heading answers the anchor a reader clicks. [[spec/design_output/vocabulary#the-slug-reads-one-source]]
export function slugOf(said) {
  return String(said ?? "")
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
