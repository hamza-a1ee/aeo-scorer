/**
 * Returns a patched robots.txt that lets the blocked AI bots in.
 * Root "Disallow: /" lines in groups that only target blocked bots become
 * "Allow: /"; bots blocked through "User-agent: *" get their own group.
 */
export function buildRobotsPatch(robotsTxt: string | null, blocked: string[]): string {
  const blockedSet = new Set(blocked.map(b => b.toLowerCase()));
  const lines = (robotsTxt ?? '').split(/\r?\n/);
  const out: string[] = [];
  const handled = new Set<string>();
  let agents: string[] = [];
  let inRules = false;

  for (const raw of lines) {
    const line = raw.trim();
    const ua = /^user-agent\s*:\s*(.+)$/i.exec(line);
    if (ua) {
      if (inRules) {
        agents = [];
        inRules = false;
      }
      agents.push(ua[1].trim().toLowerCase());
      out.push(raw);
      continue;
    }
    if (/^(dis)?allow\s*:/i.test(line)) inRules = true;
    const onlyBlocked = agents.length > 0 && agents.every(a => blockedSet.has(a));
    if (onlyBlocked && /^disallow\s*:\s*\/\s*(#.*)?$/i.test(line)) {
      agents.forEach(a => handled.add(a));
      out.push(`# ${line}  (removed: lets AI answer engines read the site)`);
      out.push('Allow: /');
      continue;
    }
    out.push(raw);
  }

  const rest = blocked.filter(b => !handled.has(b.toLowerCase()));
  const header = rest.length
    ? ['# Let AI answer engines read the site', ...rest.map(b => `User-agent: ${b}`), 'Allow: /', '']
    : [];
  return [...header, ...out].join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
