# Inazira Research

Source for research.inazira.com — a static Jekyll site hosted on GitHub Pages.

## Publish this site

1. Create a new GitHub repository (any name works, e.g. `inazira-research`).
2. Push the contents of this folder to the repository's `main` branch.
3. In the repo, go to **Settings → Pages**.
   - Under **Build and deployment**, set **Source** to "Deploy from a branch".
   - Set **Branch** to `main` and folder to `/ (root)`.
4. Under **Settings → Pages → Custom domain**, enter `research.inazira.com` and save.
   (The `CNAME` file in this repo already contains that domain, so GitHub Pages should pick it up automatically.)
5. In Porkbun's DNS settings for `inazira.com`, add a **CNAME record**:
   - Host: `research`
   - Answer: `<your-github-username>.github.io`
   - TTL: default is fine
6. Wait for DNS to propagate (usually minutes, occasionally longer), then check the "Enforce HTTPS" box on the GitHub Pages settings page once it becomes available.

## Add a new article

Add a Markdown file to `_posts/` named `YYYY-MM-DD-title.md` with front matter:

```
---
title: "Your title"
date: 2026-09-02
tags: [tag-one]
---

Article content here, in Markdown.
```

It will appear on the homepage automatically, newest first.

## Run locally (optional)

```
gem install bundler jekyll
bundle init
bundle add jekyll
bundle exec jekyll serve
```

Then visit `http://localhost:4000`.
