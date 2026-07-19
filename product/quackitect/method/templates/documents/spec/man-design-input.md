---
id: man-design-input
type: manifest
mode: chapter
order: 30
statement: Design input - context, stakeholders, and every checkable claim on the system.
---
<!-- design: method-ch3-mech  implements: req-chapters-canned.2, req-ch3-needs-intro :: ch3 is mechanized, with canned units and pooled views for the context: a neighbours table, then the star, and the design input register. That register is ONE faceted table over every input type: use cases and functions included, folded in by owner ruling (req-design-input-register). Qualities and constraints are filterable TYPE values there, never own sections. A quality row's expand carries its six scenario fields. The stakeholder tensions sit at the chapter bottom. The chapter OPENS with IFU prose, never a technical needs list (owner ruling, req-ch3-needs-intro). The authored residue is the context prose and the deferred functions unit. What the system must do. -->
## What the system must do
<!-- tailor: shipped text - the chapter's anatomy is the same in every project.
  The opening is IFU prose (owner ruling, req-ch3-needs-intro): the IFUs show what
  users can do, each tells a user story, the stories compose into needs; the flat
  index is the register, referenced, never repeated here.
-->
<!-- ai:3 -->
The IFUs show what users can do with the system. Every IFU tells a user story. Those stories compose the idea into needs, and the needs refine into every checkable claim below. The one flat index over all of them is the design input register later in this chapter.

<!-- ai:3 -->
This chapter is the binding input:

<!-- ai:3 -->
- the context and its boundary
- the intended use, and what falls outside it
- the design input register, qualities and constraints included
- the stakeholder tensions

<!-- ai:3 -->
Everything below either binds the design or names who it binds for.
---
## Context and scope
<!-- fill [mandatory]
Contents: the working context - the boundary prose, then two subsections:
  "Intended use" (what the system is FOR, one honest paragraph) and "Excluded
  from intended use" (the explicit does-NOT-do list, the scope-creep guard).
  The neighbours themselves are nbr- notes - the table and the star below
  derive from them; never hand-author the interface list into prose.
Motivation: ch0's star orients; this one BINDS. Most specs forget to say what
  the system is for - and what it is NOT for.
Form: boundary prose, then the two subsections as ### headings. Mention
  analysis methods (the 9-window among them) in the prose as links - the full
  methods live in the appendix. Design-relevant ASSUMPTIONS live in the raid
  register - record them there, never inline.
Sources: context views @[[ref-sya-architecting]]; the methods notes.
-->
<!-- ai:3 -->
{{context-and-scope}}
---
![[neighbours.base]]
---
fig: context-model
---
## The design input register
<!-- tailor: shipped text - the register derives: ONE table folding every use
  case, function (a first-class node), constraint, quality, and requirement,
  with a type facet beside the board facets; the need is a facet, never a
  body column. The former use-cases-and-functions section is folded in here
  (owner ruling, req-design-input-register); its rows keep their expand.
  Qualities and constraints are register TYPES, never own sections: filter
  the type facet to see either set; a quality row's expand carries its six
  scenario fields (the response measure is its pass line - a quality without
  a measure is a mood); a constraint row links the norm that binds it.
  Initial requirements
  suffice to START concepting, detail requirements gate the RELEASE; the set
  criteria bind: complete, consistent, affordable, bounded. The board doubles
  as the register's filter row (the recorded
  exemption from the pills rule) - click values to filter, several combine.
Sources: Cockburn use-case fields @[[ref-sya-re]]; functional decomposition
  @[[ref-pahl-beitz]]; four core areas, Hauptmerkmalliste, staging
  @[[ref-pahl-beitz]]; row schema @[[ref-methodische-entwicklung]]; attribute
  discipline @[[ref-modellbasierte-pe]]; set criteria @[[ref-iso-29148]];
  six-part scenarios @[[ref-sya-nfr]]; the elicitation tree @[[ref-iso-25010]].
-->
<!-- ai:3 -->
How the rows interconnect lives in one place: the trace, one page per need, in the overview chapter. The register below is the one flat index over every input type - use cases and functions included, each traced to its need. Expand a row to read its definition; the type facet filters to any one kind:

<!-- ai:3 -->
- A use case is one interaction that serves a need, told from the user's side.
- A function is something the system must do for a need - verb plus noun, solution-neutral.
- A quality is a requirement that states how well, measured by a scenario.
- A constraint is a requirement imposed from outside, bound by a cited norm.

<!-- ai:3 -->
Needs are the user level; requirements are the system level; deeper tiers hang off refines. Statements are EARS-shaped and carry their tolerances; no TBD survives the detail gate. The register's filter columns carry the facet coverage - a zero-count value is the completeness check, live. Click values to filter; several combine.
---
fig: input-register
---
## Stakeholder tensions
<!-- tailor: shipped machinery - the stakeholder table lives in ch0 (one table,
  not two); every requirement's source traces to one of its rows. Conflicts
  are conflicts-with connection notes - the tensions table surfaces them here,
  the full why one click away.
Sources: the four-step pipeline @[[ref-generic-se]].
-->
<!-- ai:3 -->
Where two stakeholders pull against each other, the tension renders below - the reasoning is one click away. Every requirement's source traces to a stakeholder row in the orientation chapter.

![[tensions.base]]

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
<!-- enddesign -->
