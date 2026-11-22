---
title: Example Library
description: Example Library turns something you already have into something you need, without writing it twice.
---

<!--
  Optional: the home page of the library, at /<slug>. Delete this file and /<slug> opens the introduction.
  The portal draws the hero from lib.yml (name, tagline, icon, version, install command, Get started and GitHub)
  and ends with the libraries of `related`: this page only writes the sections in between.
-->

## Why Example Library

The problem in the reader's words, and the promise of the library, in two sentences.

::card-group
:::card{title="First feature" icon="i-lucide-zap" to="/example/getting-started/quick-start"}
One line on what it brings, linked to the page that shows it.
:::
:::card{title="Second feature" icon="i-lucide-shield-check" to="/example/guides/a-use-case"}
One line on what it brings, linked to the page that shows it.
:::
:::card{title="Third feature" icon="i-lucide-gauge" to="/example/reference/configuration"}
One line on what it brings, linked to the page that shows it.
:::
:::card{title="Fourth feature" icon="i-lucide-puzzle" to="/example/getting-started/installation"}
One line on what it brings, linked to the page that shows it.
:::
::

## In one example

What you write, and what you get.

::example{input="app/Http/Resources/UserResource.php" output="GET /users/1"}
#input
```php
final class UserResource extends JsonApiResource
{
    protected function toAttributes(Request $request): iterable
    {
        return ['name' => $this->name];
    }
}
```
#output
```json
{
  "data": {
    "type": "user",
    "id": "1",
    "attributes": { "name": "Ada" }
  }
}
```
::

## Compatibility

::compatibility
::
