// The Go binaries the install builds, each under the package it builds from.
// go-stamp.sh stamps each binary off its source, and spells these packages
// again because a shell script imports nothing.
// [[spec/design_output/lsp#the-build-beside-the-index]]

export const BUILDS = {
  "se-index": "src/quack",
  "se-front": "src/front/cmd",
};
