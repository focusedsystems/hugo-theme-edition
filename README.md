# Edition for Hugo

A Hugo port of Ghost's [Edition](https://github.com/TryGhost/Edition) theme. It is the shared theme for
[blog.focused.systems](https://blog.focused.systems) and [rod.focused.systems](https://rod.focused.systems), so
both sites read as one.

Add it as a git submodule under `themes/edition` and set `theme: "edition"` in the site config:

```
git submodule add https://github.com/focusedsystems/hugo-theme-edition themes/edition
```

Site settings live under `params` in the site's own config: `accent_color`, `logo`, `favicon`, `nav_layout`,
`social`, `analytics` and the rest that the partials read. Two switches suit a site that sits beside the blog rather than being one:

- `search: false` drops the search button and its Pagefind panel.
- `subscribe_popover: false` makes Subscribe a plain link to `subscribe_url`, for a site that cannot post to the
  blog's own subscribe endpoint.

MIT licensed, as the original Edition theme is.
