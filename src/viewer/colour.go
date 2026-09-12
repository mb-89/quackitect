// The colour each kind wears. A prompt wears bold yellow across its whole row,
// and a reply wears bold green, so a turn reads at a glance. A tool row wears
// the colour of the tool it names.
// [[spec/design_output/viewer#colours]]

package main

import (
	"hash/fnv"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

var (
	dimStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("243"))
	barStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("111")).Bold(true)
	ruleStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("238"))
	headStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("252")).Bold(true)
	promptStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("220")).Bold(true)
	replyStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("114")).Bold(true)
)

var kindColours = map[string]string{
	"level0":   "141",
	"config":   "180",
	"sidebar":  "213",
	"project":  "109",
	"bash":     "173",
	"stop":     "146",
	"agent":    "176",
	"review":   "79",
	"answer":   "121",
	"gate":     "168",
	"bug":      "197",
	"write":    "222",
	"vale":     "150",
	"judge":    "183",
	"work":     "117",
	"unparsed": "208",
}

var toolColours = map[string]string{
	"Read":       "75",
	"Grep":       "81",
	"Glob":       "110",
	"Edit":       "215",
	"Write":      "209",
	"Bash":       "179",
	"PowerShell": "137",
	"Agent":      "170",
	"WebFetch":   "115",
	"WebSearch":  "122",
}

var spare = []string{"67", "103", "139", "144", "151", "181", "187", "152"}

func kindStyle(kind string) lipgloss.Style {
	switch kind {
	case "prompt":
		return promptStyle
	case "reply":
		return replyStyle
	}
	if colour, found := kindColours[kind]; found {
		return lipgloss.NewStyle().Foreground(lipgloss.Color(colour))
	}
	if colour, found := toolColours[kind]; found {
		return lipgloss.NewStyle().Foreground(lipgloss.Color(colour))
	}
	sum := fnv.New32a()
	sum.Write([]byte(kind))
	return lipgloss.NewStyle().Foreground(lipgloss.Color(spare[sum.Sum32()%uint32(len(spare))]))
}

func levelStyle(level string) lipgloss.Style {
	switch strings.ToLower(level) {
	case "warn":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("214")).Bold(true)
	case "error":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("203")).Bold(true)
	}
	return dimStyle
}

func saidStyle(r Record) lipgloss.Style {
	switch strings.ToLower(r.Level) {
	case "warn", "error":
		return levelStyle(r.Level).Bold(false)
	}
	switch r.Kind {
	case "prompt":
		return promptStyle
	case "reply":
		return replyStyle.Bold(false)
	case "answer":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("121"))
	}
	return lipgloss.NewStyle()
}
