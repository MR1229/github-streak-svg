# GitHub Streak SVG

A lightweight, self-hosted GitHub contribution streak card — built after the popular streak-stats services kept going down from shared rate limits.

<p align="center">
  <img src="https://github-streak-svg.vercel.app/api/streak?username=MR1229&theme=dark" alt="Example streak card" />
</p>

## Why this exists

Most streak widgets run on one free server shared by tens of thousands of profiles, so they hit rate limits constantly and the card on your README randomly breaks with no warning. This project is a small serverless function you deploy under your own account — nothing shared, nothing that goes down because someone else's profile got popular.

## Use it right now — no setup required

Drop this into your README, swapping in your own GitHub username:

```markdown
<img src="https://github-streak-svg.vercel.app/api/streak?username=YOUR_USERNAME&theme=dark" alt="GitHub Streak Stats" />
```

**Try it with any username right now:**
<br>
https://github-streak-svg.vercel.app/api/streak?username=torvalds&theme=dark
<br>
This runs off my hosted instance — no fork, no token, no deployment needed on your end. If you'd rather run your own copy, see below.

**Available themes:** `dark`, `light`

## Deploy your own instance

1. **Fork this repo**
2. **Import it on [Vercel](https://vercel.com)**
3. Add one environment variable:
   - `GH_TOKEN` — a [personal access token](https://github.com/settings/tokens/new) with the `read:user` scope (public data only)
4. **Deploy**
5. Use your own deployed domain the same way:
```markdown
   <img src="https://your-project.vercel.app/api/streak?username=YOUR_USERNAME&theme=dark" alt="GitHub Streak Stats" />
```

## How it works

- Queries GitHub's GraphQL API for your public contribution calendar
- Calculates current streak, longest streak, and total contributions server-side
- Renders a themed SVG on the fly — no database, no build step, no stored state
- Ring and flame color shift with streak length — a small motivating touch for longer streaks

## Parameters

| Parameter | Options | Default | Description |
|---|---|---|---|
| `username` | any GitHub username | — | required |
| `theme` | `dark`, `light` | `dark` | card color scheme |

## Tech

Node.js serverless function on Vercel. No external dependencies.

## Contributing

PRs welcome — more themes, additional stat types, or general improvements are all fair game.

## License

MIT — fork it, modify it, deploy your own copy, or point straight at the hosted version above.
