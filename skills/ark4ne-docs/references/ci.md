# CI

Two workflows in the library, using the portal's reusable workflow.

## Check pull requests

`.github/workflows/docs.yml` in the library:

```yaml
name: Docs

on:
  pull_request:
    paths: ['docs/site/**', 'CHANGELOG.md', 'UPGRADE.md']
  push:
    branches: [master]          # the library's default branch
    paths: ['docs/site/**', 'CHANGELOG.md', 'UPGRADE.md']

jobs:
  check:
    uses: Ark4ne/docs/.github/workflows/check-lib.yml@main
    with:
      slug: laravel-openapi-generator   # the library's slug

  publish:
    # Rebuilds the portal when the documentation changes on the default branch.
    if: github.event_name == 'push'
    needs: check
    runs-on: ubuntu-latest
    steps:
      - run: gh api repos/Ark4ne/docs/dispatches -f event_type=lib-docs-updated -f "client_payload[slug]=${{ github.event.repository.name }}"
        env:
          GH_TOKEN: ${{ secrets.DOCS_DISPATCH_TOKEN }}
```

`check` runs the contract check, then builds the library's pages with the real theme: a broken component, a
dead link or a page that fails to render fails the pull request.

## Secret

`DOCS_DISPATCH_TOKEN`: a fine-grained personal access token limited to the `Ark4ne/docs` repository with the
*Contents: read and write* permission (required by repository dispatches). Store it as an organisation
secret shared with the libraries, or as a secret of each library. Creating it is the maintainer's job.

## Registering a library

A new library is added once to `libs.config.ts` in the portal (slug, repository, branch, `docs/site`,
local folder name). Until it has a `docs/site/lib.yml` on its default branch, it is not shown.
