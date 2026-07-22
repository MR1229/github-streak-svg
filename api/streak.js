export default async function handler(req, res) {
  const { username = 'MR1229', theme = 'dark' } = req.query;

  const themes = {
    dark:  { bg: '#0D1117', border: '#30363D', ring: '#58A6FF', text: '#FFFFFF', label: '#8B949E' },
    light: { bg: '#FFFFFF', border: '#E4E2E2', ring: '#F79616', text: '#000000', label: '#666666' }
  };
  const t = themes[theme] || themes.dark;

  try {
    const query = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              weeks { contributionDays { date contributionCount } }
            }
          }
        }
      }`;

    const ghRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables: { login: username } })
    });

    const data = await ghRes.json();
    if (data.errors) throw new Error(data.errors[0].message);

    const days = data.data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap(w => w.contributionDays);

    const total = days.reduce((sum, d) => sum + d.contributionCount, 0);
    const today = new Date().toISOString().split('T')[0];

    // Current streak: walk backwards from most recent day
    let currentStreak = 0, currentStart = null;
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i];
      if (d.date > today) continue;
      if (d.contributionCount > 0) {
        currentStreak++;
        currentStart = d.date;
      } else if (d.date !== today) {
        break;
      }
    }

    // Longest streak: scan forward once
    let longest = 0, tempStreak = 0, tempStart = null, longestStart = null, longestEnd = null;
    for (const d of days) {
      if (d.contributionCount > 0) {
        if (tempStreak === 0) tempStart = d.date;
        tempStreak++;
        if (tempStreak > longest) {
          longest = tempStreak;
          longestStart = tempStart;
          longestEnd = d.date;
        }
      } else {
        tempStreak = 0;
      }
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

    const svg = `
<svg width="495" height="195" viewBox="0 0 495 195" xmlns="http://www.w3.org/2000/svg">
  <style>
    .num { font: 700 28px 'Segoe UI', sans-serif; fill: ${t.text}; }
    .label { font: 600 14px 'Segoe UI', sans-serif; fill: ${t.label}; }
    .range { font: 400 12px 'Segoe UI', sans-serif; fill: ${t.label}; }
  </style>
  <rect x="0.5" y="0.5" width="494" height="194" rx="10" fill="${t.bg}" stroke="${t.border}"/>
  <g transform="translate(82,0)">
    <text x="0" y="70" text-anchor="middle" class="num">${total.toLocaleString()}</text>
    <text x="0" y="95" text-anchor="middle" class="label">Total Contributions</text>
    <text x="0" y="115" text-anchor="middle" class="range">${fmt(days[0]?.date)} - present</text>
  </g>
  <line x1="165" y1="30" x2="165" y2="165" stroke="${t.border}"/>
  <g transform="translate(247,0)">
    <circle cx="0" cy="80" r="45" fill="none" stroke="${t.ring}" stroke-width="5"/>
    <text x="0" y="60" text-anchor="middle" font-size="22">🔥</text>
    <text x="0" y="90" text-anchor="middle" class="num">${currentStreak}</text>
    <text x="0" y="130" text-anchor="middle" class="label" fill="${t.ring}">Current Streak</text>
    <text x="0" y="150" text-anchor="middle" class="range">${currentStreak > 0 ? fmt(currentStart) + ' - present' : '-'}</text>
  </g>
  <line x1="330" y1="30" x2="330" y2="165" stroke="${t.border}"/>
  <g transform="translate(412,0)">
    <text x="0" y="70" text-anchor="middle" class="num">${longest}</text>
    <text x="0" y="95" text-anchor="middle" class="label">Longest Streak</text>
    <text x="0" y="115" text-anchor="middle" class="range">${longest > 0 ? fmt(longestStart) + ' - ' + fmt(longestEnd) : '-'}</text>
  </g>
</svg>`.trim();

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(svg);

  } catch (err) {
    const errorSvg = `<svg width="495" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="495" height="80" fill="${t.bg}" stroke="${t.border}"/>
      <text x="20" y="45" fill="#F85149" font-family="sans-serif" font-size="13">Error: ${err.message}</text>
    </svg>`.trim();
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(errorSvg);
  }
}
