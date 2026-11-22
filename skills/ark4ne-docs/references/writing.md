# Writing

## Designing a navigation

Start from the reader, not from the source tree. List what someone comes to do with the library, then group:

1. **Getting started** (required, same everywhere): `introduction`, `installation`, usually a `quick-start`
   that reaches a first visible result in a few minutes.
2. **The library's own sections**: one per area of use, named the way users name the task. Examples:
   - laravel-json-api: *Resources*, *Relationships*, *Requests* (includes, fields, filters), *Integrations*;
   - openapi-writer: *Building a document*, *Schemas*, *Components & references*, *Output*;
   - laravel-openapi-generator: *Generating*, *Requests*, *Responses*, *Customisation* (extractors, rule
     mappers, passes), *Integrations*.
3. **Reference** (when the library has one): configuration keys, attributes, commands, every option with
   `::field`.
4. **Releases** is added by the portal; do not create it.

Two levels of depth at most. Seven or fewer entries per group. A section with one page is a page.

## Page types

Do not mix them on one page.

| Type | Answers | Shape |
|---|---|---|
| Quick start | "Show me it works." | Steps, one happy path, a visible result. |
| Guide | "How do I …?" | A task from start to end, with `::example`, then variations. |
| Concept | "How does it think?" | Explanation, a Mermaid diagram or a table, links to guides. |
| Reference | "What exactly does X accept?" | Exhaustive, terse, `::field-group`, no narrative. |
| Integration | "How does it work with Y?" | Lives in the library that does the integrating; links to Y. |

## Style

- English, second person, present tense, active voice: "Add the attribute to the controller."
- Lead with the outcome; the first paragraph says what the page lets the reader do.
- Short paragraphs. One idea per section. Headings are noun phrases or imperatives, not questions.
- Every claim about behaviour must match the code; every code sample must run. Prefer code lifted from
  tests and fixtures (`tests/Feature/**`, `tests/Fixtures/**`); adapt names, never the behaviour.
- Show the output: what the user writes **and** what they get (`::example`); for a call to the API, the request and its response (`::http-call`).
- No marketing words ("simply", "just", "powerful", "seamless"). No emoji.
- Internals (architecture, layers, design decisions) stay in `docs/architecture.md`; the site documents
  extension points only from the user's side.
- Do not duplicate: the changelog and upgrade guide are rendered from the root files; another library's
  feature is linked, not re-explained.

## Migrating existing documentation

Old pages (a README section, a previous docs site) are a source, not a template: re-sort their content into
the navigation designed above, rewrite to the style, and drop what the code no longer does. Keep the README
short and link to the portal.
