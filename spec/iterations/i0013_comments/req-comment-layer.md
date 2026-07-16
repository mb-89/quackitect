---
id: req-comment-layer
type: requirement
statement: The book's comment layer shall capture anchored, threaded reader feedback in an embedded annotation island. It shall save it back safely. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The comment layer shall offer a changeable name field in the sidebar and stamp its value on new comments and replies. *(was req-comment-author)*
2. When a reader closes a thread, the comment layer shall keep the thread in the island, hide its highlight from the page, and offer a reopen control. *(was req-comment-close)*
3. The comment layer shall leave the rendered book content unchanged outside its own island, root element, and highlight registrations. *(was req-comment-dom-static)*
4. The comment layer shall render stored comment text as text, never as markup. *(was req-comment-escape)*
5. If a marked figure element has no id, then the comment layer shall anchor the comment to the figure's unit anchor. *(was req-comment-figure-fallback)*
6. When a reader marks an element inside a figure, the comment layer shall anchor the comment to that element's id. *(was req-comment-figure-target)*
7. The book shall store every comment in one embedded JSON island that follows the W3C Web Annotation Data Model vocabulary. *(was req-comment-island)*
8. When a reader selects prose in a book copy, the comment layer shall anchor the new comment to the enclosing unit anchor with quote and position selectors. *(was req-comment-mark-prose)*
9. The island schema shall accept targets that name a unit anchor directly, without a reader selection. *(was req-comment-premark-open)*
10. When a reader saves in a browser that grants file access, the comment layer shall write the commented copy back to its own file. *(was req-comment-save)*
11. If in-place saving is unavailable, then the comment layer shall offer the commented copy as a download. *(was req-comment-save-fallback)*
12. While a book copy holds open comments, the comment layer shall list them in a minimizable right sidebar in document order. *(was req-comment-sidebar)*
13. Where a comment proposes replacement text, the island shall carry the original quote and the proposed wording as a suggested edit. *(was req-comment-suggest)*
14. When a reader replies to a comment, the comment layer shall append the reply to the comment's thread with an agree, reject, or neutral mark. *(was req-comment-threads)*
