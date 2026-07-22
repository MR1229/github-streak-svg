# github-streak-svg

A lightweight, self-hosted GitHub streak stats card. No forked dependencies, no shared public server — deploy your own copy on Vercel in a few minutes.

## Why

Public streak-stat services get rate-limited and go down since thousands of profiles share one free server. This is a minimal implementation you deploy yourself, so it only ever serves your own traffic.

## Deploy your own

1. Fork this repo
2. Import it on [Vercel](https://vercel.com)
3. Add an environment variable:
   - `GH_TOKEN` — a GitHub personal access token ([create one here](https://github.com/settings/tokens/new), no scopes needed for public data)
4. Deploy

## Usage

Once deployed, use it in your README:

\`\`\`markdown
<img src="https://your-project.vercel.app/api/streak?username=YOUR_USERNAME&theme=dark" alt="GitHub Streak Stats" />
\`\`\`

### Parameters

| Param | Options | Default |
|---|---|---|
| `username` | any GitHub username | required |
| `theme` | `dark`, `light` | `dark` |

## License

MIT — use it, fork it, modify it.
