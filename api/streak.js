export default async function handler(req, res) {
  const { username = 'MR1229', theme = 'dark' } = req.query;

  const themes = {
    dark:  { bg: '#0D1117', border: '#30363D', ring: '#58A6FF', text: '#FFFFFF', label: '#8B949E', fire: '#FFA657' },
    light: { bg: '#FFFFFF', border: '#E4E2E2', ring: '#F79616', text: '#000000', label: '#666666', fire: '#F79616' }
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

    const flameColor = currentStreak >= 30 ? '#FF4500' : currentStreak >= 7 ? t.fire : currentStreak > 0 ? '#FFC966' : '#484F58';
    const currentRangeText = currentStreak > 0 ? `${fmt(currentStart)} - present` : 'Start your streak today';

    const svg = `
<svg width="495" height="230" viewBox="0 0 495 230" xmlns="http://www.w3.org/2000/svg">
  <style>
    .num { font: 700 28px 'Segoe UI', sans-serif; fill: ${t.text}; }
    .label { font: 700 13px 'Segoe UI', sans-serif; fill: ${t.label}; letter-spacing: 0.5px; }
    .range { font: 400 12px 'Segoe UI', sans-serif; fill: ${t.label}; }
    .fire { font-size: 22px; }
  </style>
  <rect x="0.5" y="0.5" width="494" height="229" rx="12" fill="${t.bg}" stroke="${t.border}"/>

  <!-- Total Contributions -->
  <g transform="translate(85,0)">
    <text x="0" y="112" text-anchor="middle" class="num">${total.toLocaleString()}</text>
    <text x="0" y="178" text-anchor="middle" class="label">TOTAL CONTRIBUTIONS</text>
    <text x="0" y="200" text-anchor="middle" class="range">${fmt(days[0]?.date)} - present</text>
  </g>

  <line x1="167" y1="40" x2="167" y2="195" stroke="${t.border}"/>

  <!-- Current Streak -->
  <g transform="translate(247,0)">
    <text x="0" y="38" text-anchor="middle" class="fire">🔥</text>
    <circle cx="0" cy="104" r="48" fill="none" stroke="${flameColor}" stroke-width="5"/>
    <text x="0" y="112" text-anchor="middle" class="num">${currentStreak}</text>
    <text x="0" y="178" text-anchor="middle" class="label" fill="${flameColor}">CURRENT STREAK</text>
    <text x="0" y="200" text-anchor="middle" class="range">${currentRangeText}</text>
  </g>

  <line x1="329" y1="40" x2="329" y2="195" stroke="${t.border}"/>

  <!-- Longest Streak -->
  <g transform="translate(410,0)">
    <text x="0" y="112" text-anchor="middle" class="num">${longest}</text>
    <text x="0" y="178" text-anchor="middle" class="label">LONGEST STREAK</text>
    <text x="0" y="200" text-anchor="middle" class="range">${longest > 0 ? fmt(longestStart) + ' - ' + fmt(longestEnd) : '-'}</text>
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
