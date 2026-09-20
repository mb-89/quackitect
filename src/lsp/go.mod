// THE SERVER HOLDS WHAT VALE AND BIOME CANNOT, AND NEVER A SECOND TRUTH.
// The files are the truth; every check here reads them and answers findings.
// The module takes no dependency, so it builds in seconds with no cgo and no
// network, on every box the tree reaches.
module quackitect/lsp

go 1.24

require (
	quackitect/config v0.0.0
	quackitect/swap v0.0.0
	quackitect/yaml v0.0.0
)

replace quackitect/config => ../config

replace quackitect/swap => ../engine/swap

replace quackitect/yaml => ../yaml
