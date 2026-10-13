# Edition for Hugo

A Hugo port of Ghost's [Edition](https://github.com/TryGhost/Edition) theme. It is the shared theme for
[blog.focused.systems](https://blog.focused.systems) and [rod.focused.systems](https://rod.focused.systems), so
both sites read as one.

Add it as a git submodule under `themes/edition` and set `theme: "edition"` in the site config:

```
git submodule add https://github.com/focusedsystems/hugo-theme-edition themes/edition
```

Site settings live under `params` in the site's own config: `accent_color`, `logo`, `favicon`, `nav_layout`,
`social`, `analytics` and the rest that the partials read. MIT licensed, as the original Edition theme is.
