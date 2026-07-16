---
id: req-reader-tables
ears: exempt - historical pre-EARS statement, retire-or-retrofit recorded (adr-grandfathers-historical)
type: requirement
statement: Every reader-facing query shall render as a compact, in-place filterable, expandable table. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Every reader-facing query shall render as a table with a clear header row and separated cells, even with zero rows, under a heading that fits its chapter. *(was req-table-render)*
2. A reader-facing table shall filter and sort in place, and an enum column shall filter by its allowed values. *(was req-table-interact)*
3. The book shall render every reader-facing table row collapsed to the item name, expand a clicked row to the item's full content, offer expand-all and collapse-all controls, and page a need-scoped table by need with at most twenty rows per page. *(was req-table-expand)*
4. The book shall filter a reader-facing table by combinable pill facets above it, always including a need facet for trace items and a facet for each meaningful category, and shall not render a pill for every item. *(was req-table-facets)*
5. The book shall not color zero counts and shall not render bucket rows for empty facet values. *(was req-table-noise)*
6. A reader-facing table shall show the item name and statement and shall not show filename, weight, or source-internal columns. *(was req-reader-columns)*
7. The glossary shall render as an in-place filterable and sortable table. *(was req-glossary-table)*
