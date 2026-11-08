# pubs.fndt.xyz
a repository of writing: plain html articles that speed up technical tasks, ready to be linked, copied or embedded (iframe) into any website.

# run locally

```bash
./start.sh
xdg-open http://localhost:8020
```

# layout

- `index.html`, `all-pages.html`, `about.html`, `page-00-technical-aspects.html`: the site pages.
- `navbar.html`, `footer.html`, `rght-clmn.html`: shared parts every page loads. `global.css`: the whole look.
- `contents/`, `posts/`: the articles, one html file each. New article: copy `contents/page-00-00-example.html`, then add it to `all-pages.html`.
- breadcrumbs: top one is `pubs > all-pages > page` (no categories yet). Each article ends with a second one, `fndt > category > page`, commented out until it is filled in.
- menu dropdowns are empty for now; add a link inside a `nav-dd-menu` in `navbar.html` and its triangle shows.

# hosting (GitHub Pages)

- `CNAME` holds the custom domain, `.nojekyll` serves the files as they are.
- repo settings > Pages: deploy from branch `main`, folder `/ (root)`, then tick "Enforce HTTPS".
- DNS: a `CNAME` record `pubs` pointing to `fndt-xyz.github.io`.
- the repo is public, and so is every file in it.
