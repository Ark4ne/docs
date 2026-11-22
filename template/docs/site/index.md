---
title: Example Library
description: Example Library turns something you already have into something you need, without writing it twice.
---

<!--
  Optional: the home page of the library, at /<slug>. Delete this file and /<slug> opens the introduction.
  The portal draws the hero from lib.yml (name, tagline, icon, version, install command, Get started and GitHub)
  and ends with a call to action and the libraries of `related`: this page only writes what is in between.
  The demo before the first ## goes into the hero, beside the name.
-->

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

## Compatibility

::compatibility
::
