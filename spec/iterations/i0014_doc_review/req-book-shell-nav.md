---
id: req-book-shell-nav
type: requirement
statement: The book shell shall organize navigation: sidebar order, section paging, deck listing, the title card, and stepped search. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The book sidebar shall order its blocks: search, then the filter expression, then the toc; the views live in the details pane; the toc shall show each chapter's number and shall not list the deck. *(was req-sidebar-order)*
2. When the reader opens the book, the shell shall show no page header, and a click on the book title shall open a detail card carrying the iteration and engine info. *(was req-shell-title-card)*
3. The sidebar views shall list slide decks in a slide-decks subsection. *(was req-deck-views-section)*
4. The book shall render one page per top-level section. *(was req-section-paging)*
5. When the reader searches, the book shall step through the matches with a previous/next counter beside the search box, panning to each match and highlighting it fully yellow. *(was req-search-hitlist)*
