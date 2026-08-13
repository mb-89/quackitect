---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: uc-find-the-right-lane-tool
type: "[[use-case]]"
statement: Find the lane tool or guidance page that fits a task, from a plain-words description, and leave a trail when none exists.
actor: stk-agent
trigger: an agent needs a capability and does not already know which lane tool or guidance page provides it
precondition: the lane is booted
guarantee: the agent gets a ranked list of matching tools and guidance, or an honest miss that is logged for the next retro to read
refines:
  - sty-ask-the-lane-what-it-can-do
priority: must
---

## Main scenario

1. The agent asks se_help with a plain-words description of what it needs.
2. se_help searches tool names, tool descriptions and guidance page statements for matching keywords.
3. It returns the matches, ranked, each with enough of its description to judge fit.
4. The agent picks the tool or guidance page named in the result.

## Extensions

- 2a. Nothing matches. se_help says so plainly and logs the query as a miss, with its timestamp.
- 3a. Several tools plausibly fit. All are returned, ranked; the agent judges, not se_help.
- 4a. A later retro reads the ranked miss log instead of hand-mining the shell command history for what agents kept reaching for by hand.
