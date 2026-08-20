---
id: bases-syntax
statement: The Obsidian Bases format we implement against — schema, expression language, and the full function list.
---

# The Bases format — reference

## Provenance

The owner pasted this on 2026-08-01, from Obsidian's help pages for Bases
syntax, formulas and functions.

It is copied into the repo because it CANNOT BE FETCHED. `obsidian.md/help`
is a client-rendered application. A fetch returns HTTP 200 and twenty-five
characters, which is the page title and nothing else. A build that needs the
function list needs this file.

This is somebody else's specification. We implement against it. Where we
extend it, the extension is marked in section 10 and nowhere else.

## 1. The file

A base is a `.base` file. It is YAML. One file holds MANY views of the same
data.

```yaml
filters:
  or:
    - file.hasTag("tag")
    - and:
        - file.hasTag("book")
        - file.hasLink("Textbook")
    - not:
        - file.hasTag("book")
        - file.inFolder("Required Reading")
formulas:
  formatted_price: 'if(price, price.toFixed(2) + " dollars")'
  ppu: "(price / age).toFixed(2)"
properties:
  status:
    displayName: Status
  formula.formatted_price:
    displayName: "Price"
  file.ext:
    displayName: Extension
summaries:
  customAverage: 'values.mean().round(3)'
views:
  - type: table
    name: "My table"
    limit: 10
    groupBy:
      property: note.age
      direction: DESC
    filters:
      and:
        - 'status != "done"'
        - or:
            - "formula.ppu > 5"
            - "price > 2.1"
    order:
      - file.name
      - file.ext
      - note.age
      - formula.ppu
      - formula.formatted_price
    summaries:
      formula.ppu: Average
```

Five top-level sections: `filters`, `formulas`, `properties`, `summaries`,
`views`.

## 2. Filters

A base includes EVERY FILE IN THE VAULT by default. There is no `from` and no
source clause. Filters narrow it.

Filters apply at two levels:

- Global — the top-level `filters`, applying to every view in the file.
- Per view — a view's own `filters`.

The two are concatenated with AND when a view is evaluated.

A filter is either a single statement as a string, or a recursive object
carrying one of `and`, `or`, `not`. Each of those holds a heterogeneous list
of further filter objects or statement strings.

A statement is any expression evaluating truthy or falsy against a note. It
is a comparison, or a function call. Filters and formulas share one syntax
and one function set.

## 3. Formulas

`formulas` defines calculated properties available to every view.

```yaml
formulas:
  formatted_price: 'if(price, price.toFixed(2) + " dollars")'
  ppu: "(price / age).toFixed(2)"
```

- A formula is always a STRING in the YAML. Its output type comes from the
  data and the functions used.
- Text literals inside it need nested quotes.
- A formula may reference another formula as `formula.<name>`.
- Circular references are illegal.

Obsidian's own editor autocompletes function and property names and shows a
green check when the expression parses.

## 4. Properties

Three kinds, and the prefix is what tells them apart.

- NOTE properties live in the note's frontmatter. `note.price`, or
  `note["price"]`, or bare `price`. Bare is the default namespace.
- FILE properties describe the file and exist for every file type, including
  attachments. `file.size`, `file.ext`.
- FORMULA properties are defined in the `.base` file. `formula.ppu`.

The `properties` section carries per-property configuration. `displayName`
becomes the column heading. Display names are never used in filters or
formulas.

### File properties, complete

| Property | Type | Description |
| --- | --- | --- |
| `file.backlinks` | List | Backlink files. PERFORMANCE HEAVY — reverse the lookup and use `file.links` where possible. Does not auto-refresh on vault change. |
| `file.ctime` | Date | Created time |
| `file.embeds` | List | Every embed in the note |
| `file.ext` | String | File extension |
| `file.file` | File | The file object; only usable in specific functions |
| `file.folder` | String | Path of the parent folder |
| `file.links` | List | Every internal link in the note, frontmatter included |
| `file.mtime` | Date | Modified time |
| `file.name` | String | File name |
| `file.path` | String | Path of the file |
| `file.properties` | Object | All properties on the file. Does not auto-refresh on vault change. |
| `file.size` | Number | File size |
| `file.tags` | List | Every tag in content and frontmatter |

### `this`

`this` reaches the file properties of a context that depends on WHERE the
base is displayed.

- Main content area — `this` is the base file itself. `this.file.folder` is
  where the base lives.
- Embedded in another file — `this` is the EMBEDDING file.
- In a sidebar — `this` is the ACTIVE file in the main area. This is what
  makes `file.hasLink(this.file)` reproduce a backlinks pane.

## 5. Summaries

`summaries` defines named aggregate formulas. Inside one, `values` is a list
of that property's value across every note in the result set. It returns a
single value.

```yaml
summaries:
  customAverage: 'values.mean().round(3)'
```

This is separate from a VIEW's `summaries`, which maps a property to a named
summary.

### The default summaries

| Name | Input | Description |
| --- | --- | --- |
| Average | Number | Mathematical mean |
| Min | Number | Smallest |
| Max | Number | Largest |
| Sum | Number | Sum of all |
| Range | Number | Max minus Min |
| Median | Number | Mathematical median |
| Stddev | Number | Standard deviation |
| Earliest | Date | Earliest date |
| Latest | Date | Latest date |
| Range | Date | Latest minus Earliest |
| Checked | Boolean | Count of `true` |
| Unchecked | Boolean | Count of `false` |
| Empty | Any | Count of empty values |
| Filled | Any | Count of non-empty values |
| Unique | Any | Count of distinct values |

## 6. Views

`views` is a list. Each entry renders the same data a different way.

- `type` — picks a built-in or plugin-added view type.
- `name` — the display name, also how a default view is named.
- `filters` — as section 2, scoped to this view.
- `limit` — cap the rows.
- `groupBy` — `{property, direction}`. Rows group by that property's value.
- `order` — the property sequence, which in a table is the column order.
- `summaries` — maps a property to a named summary.

A view MAY CARRY ANY EXTRA KEYS it needs for its own state and rendering.
Obsidian's guidance to plugin authors is only to avoid keys the core plugin
already uses. A table stores its row limit and sort column this way; a map
would store which property is latitude.

This is the extension point. A new view type declares its own keys.

Obsidian ships table, cards, list and map. It groups by exactly one property.

## 7. Operators

### Arithmetic

`+` plus · `-` minus · `*` multiply · `/` divide · `%` modulo · `( )`
parenthesis.

### Comparison

`==` equals · `!=` not equal · `>` greater · `<` less · `>=` greater or
equal · `<=` less or equal.

Equality works on any value. Ordering works on numbers and dates.

### Boolean

`!` not · `&&` and · `||` or.

### Date arithmetic

Add or subtract a DURATION STRING to shift a date. `date + "1M"` adds a
month. `date - "2h"` subtracts two hours.

| Unit | Duration |
| --- | --- |
| `y`, `year`, `years` | year |
| `M`, `month`, `months` | month |
| `d`, `day`, `days` | day |
| `w`, `week`, `weeks` | week |
| `h`, `hour`, `hours` | hour |
| `m`, `minute`, `minutes` | minute |
| `s`, `second`, `seconds` | second |

Subtracting two dates gives the difference in MILLISECONDS.

Explicit `duration()` parsing is only needed for arithmetic ON durations, and
there the duration goes on the LEFT: `duration('5h') * 2`, never `2 *
duration('5h')`.

## 8. Types

- STRINGS — single or double quotes.
- NUMBERS — digits, optionally parenthesised for clarity: `1`, `(2.5)`.
- BOOLEANS — bare `true` and `false`.
- DATES — built by `date()`, `today()`, `now()`, or by a property's declared
  type.
- DURATIONS — see the table above.
- LISTS — `[1, 2, 3]`. Index with `property[0]`, zero-based.
- OBJECTS — `{"name": "value"}`. Reach members with `property.subprop` or
  `property["subprop"]`.
- LINKS — a wikilink in frontmatter is automatically a Link object and
  renders clickable. Build one with `link()`. Compare with `==` and `!=` —
  equal when they resolve to the same file, or when the text matches exactly
  and the file does not exist. A Link compares equal to a File it resolves
  to, so `author == this` works, and `authors.contains(this)` works.

Bases functions follow JavaScript behaviour.

## 9. The functions

### Global — used without a type

| Function | Signature | Behaviour |
| --- | --- | --- |
| `escapeHTML` | `(html: string): string` | Escape special characters for safe HTML inclusion. |
| `date` | `(date: string): date` | Parse `YYYY-MM-DD HH:mm:ss` into a date. |
| `duration` | `(value: string): duration` | Parse a duration string. |
| `file` | `(path: string \| file \| url): file` | The file object for a path or file. |
| `html` | `(html: string): html` | A snippet that renders as HTML. |
| `if` | `(condition, trueResult, falseResult?)` | `falseResult` defaults to null. |
| `image` | `(path: string \| file \| url): image` | Renders the image in the view. |
| `icon` | `(name: string): icon` | Renders a Lucide icon by name. |
| `link` | `(path: string \| file, display?): Link` | A link, with optional display text. |
| `list` | `(element: any): List` | A list unchanged; anything else wrapped in a one-element list. |
| `max` | `(...numbers): number` | Largest. |
| `min` | `(...numbers): number` | Smallest. |
| `now` | `(): date` | The current moment. |
| `number` | `(input: any): number` | Dates become epoch milliseconds. Booleans become 1 or 0. An unparseable string is an error. |
| `today` | `(): date` | The current date at midnight. |
| `random` | `(): number` | Between 0 and 1. Refreshes whenever a view loads. |

### Any

| Function | Signature | Behaviour |
| --- | --- | --- |
| `isTruthy` | `(): boolean` | The value coerced to boolean. |
| `isType` | `(type: string): boolean` | True when the value is of that type. |
| `toString` | `(): string` | The string representation. |

### Date

Fields: `year`, `month` (1-12), `day`, `hour` (0-23), `minute` (0-59),
`second` (0-59), `millisecond` (0-999).

| Function | Signature | Behaviour |
| --- | --- | --- |
| `date` | `(): date` | The date with the time removed. |
| `format` | `(format: string): string` | Formatted by a Moment.js format string. |
| `time` | `(): string` | The time portion as a string. |
| `relative` | `(): string` | Readable comparison to now, such as "3 days ago". |
| `isEmpty` | `(): boolean` | Always false. |

### String

Field: `length`.

| Function | Signature | Behaviour |
| --- | --- | --- |
| `contains` | `(value: string): boolean` | Substring test. |
| `containsAll` | `(...values): boolean` | Contains every one. |
| `containsAny` | `(...values): boolean` | Contains at least one. |
| `endsWith` | `(query: string): boolean` | Ends with. |
| `isEmpty` | `(): boolean` | True when empty or absent. |
| `lower` | `(): string` | Lower case. |
| `replace` | `(pattern: string \| Regexp, replacement: string): string` | A string pattern replaces every occurrence. A Regexp obeys its `g` flag. Capture groups reachable as `$1`, `$2`. |
| `repeat` | `(count: number): string` | Repeat. |
| `reverse` | `(): string` | Reverse. |
| `slice` | `(start: number, end?: number): string` | Start inclusive, end exclusive. |
| `split` | `(separator: string \| Regexp, n?: number): list` | Optional `n` keeps the first n elements. |
| `startsWith` | `(query: string): boolean` | Starts with. |
| `title` | `(): string` | Title case. |
| `trim` | `(): string` | Strip surrounding whitespace. |

### Number

| Function | Signature | Behaviour |
| --- | --- | --- |
| `abs` | `(): number` | Absolute value. |
| `ceil` | `(): number` | Round up. |
| `floor` | `(): number` | Round down. |
| `isEmpty` | `(): boolean` | True when the number is absent. |
| `round` | `(digits?: number): number` | Nearest integer, or to that many decimals. |
| `toFixed` | `(precision: number): string` | Fixed-point notation, as a string. |

### List

Field: `length`.

| Function | Signature | Behaviour |
| --- | --- | --- |
| `contains` | `(value: any): boolean` | Membership. |
| `containsAll` | `(...values): boolean` | Contains every one. |
| `containsAny` | `(...values): boolean` | Contains at least one. |
| `filter` | `(expression): list` | Keeps elements where the expression is true. `value` and `index` are bound. |
| `flat` | `(): list` | Flatten one level of nesting. |
| `isEmpty` | `(): boolean` | No elements. |
| `join` | `(separator: string): string` | Join into a string. |
| `map` | `(expression): list` | Transform each element. `value` and `index` are bound. |
| `reduce` | `(expression, acc): any` | `value`, `index` and `acc` are bound; the expression returns the next `acc`. |
| `reverse` | `(): list` | Reverse. |
| `slice` | `(start, end?): list` | Shallow copy of a range. |
| `sort` | `(): list` | Smallest to largest. |
| `unique` | `(): list` | Drop duplicates. |

`filter`, `map` and `reduce` take an EXPRESSION, not a lambda. The iteration
variables are bound names. That is a parser requirement, not a library call.

### Link

| Function | Signature | Behaviour |
| --- | --- | --- |
| `asFile` | `(): file` | The file, when the link resolves locally. |
| `linksTo` | `(file): boolean` | The linked file links to `file`. |

### File

Fields: the table in section 4.

| Function | Signature | Behaviour |
| --- | --- | --- |
| `asLink` | `(display?: string): Link` | A functioning link. |
| `hasLink` | `(otherFile: file \| string): boolean` | This file links to that one. |
| `hasProperty` | `(name: string): boolean` | Carries the property. |
| `hasTag` | `(...values): boolean` | Carries any of the tags. Nested tags count — `#tag1` matches `#tag1/a`. |
| `inFolder` | `(folder: string): boolean` | In that folder OR a sub-folder. |

### Object

| Function | Signature | Behaviour |
| --- | --- | --- |
| `isEmpty` | `(): boolean` | No own properties. |
| `keys` | `(): list` | The keys. |
| `values` | `(): list` | The values. |

### Regular expression

Literal syntax `/abc/`.

| Function | Signature | Behaviour |
| --- | --- | --- |
| `matches` | `(value: string): boolean` | The pattern matches the string. |

## 10. What our engine implements today

Measured 2026-08-01 against `deliverable/engine/tables.ts`.

Implemented:

- Top level `properties` and `views`.
- `displayName` on a property.
- A view's `type`, `name`, `order`, `sort` and `filters`.
- Filters `and`, `or`, `not`, `prop == "value"`, `prop != "value"`, and a
  bare `prop` meaning "carries something".
- Synthesised `file.name`, `file.path`, `file.folder`, `file.ext`.

Not implemented — every one of these refuses by name rather than being
ignored:

- The EXPRESSION LANGUAGE entirely. No arithmetic, no boolean operators, no
  ordering comparisons, no function calls, no date durations.
- Every function in section 9.
- `formulas`, and the `formula.` namespace.
- `summaries`, at either level, and the default summary set.
- `groupBy`.
- `limit`.
- The `note.` and `this.` namespaces.
- The `file.*` properties beyond the four synthesised ones. No `file.tags`,
  no `file.links`, no `file.backlinks`, no `file.ctime`, no `file.mtime`.
- Every view type except `table`.

Ours alone, and deliberate:

- `type: pivot`, with `rows`, `columns`, `aggregate` and `value`. Obsidian
  cannot open it. It is our own view type, which section 6 permits.

Refusing an unknown construct by name is our rule and it is load-bearing. A
query language that ignores a clause it does not understand returns a table
that looks complete and is wrong.
