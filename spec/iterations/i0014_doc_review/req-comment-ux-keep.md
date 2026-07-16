---
id: req-comment-ux-keep
type: requirement
statement: The comment layer shall never lose or dislodge unposted text. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. While a comment textbox holds unposted text, the comment layer shall keep the text when a new item is created and shall post all unposted text on save. *(was req-comment-persist)*
2. While a comment is unsaved, the comment layer shall warn before the book copy closes, shall keep the comment and minimize controls in one place, and shall not shift the comment bar when a comment posts. *(was req-comment-ux)*
