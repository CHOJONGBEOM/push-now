/**
 * App icon utilities
 * - icon directory: public/icons/apps
 * - icon filename: {normalizedAppName}.png
 */

const ICON_ALIASES: Record<string, string> = {
  'N+스토어': 'N스토어',
  'N 스토어': 'N스토어',
};

const normalizeIconFileName = (appName: string): string => {
  let name = String(appName || '').trim().normalize('NFC');

  // If incoming value is already URL-encoded (e.g. N%2B스토어), decode once.
  try {
    if (/%[0-9A-Fa-f]{2}/.test(name)) {
      name = decodeURIComponent(name);
    }
  } catch {
    // Keep raw value when malformed.
  }

  // Treat '+' as disallowed for filename stability across environments.
  name = name.replace(/\+/g, '');
  name = name.replace(/\s+/g, ' ').trim();

  name = ICON_ALIASES[name] || name;

  // Remove invalid file path characters for Windows-safe filenames.
  return name.replace(/[\/\\:*?"<>|]/g, '');
};

const getLocalIconPath = (appName: string): string => {
  const safeName = normalizeIconFileName(appName);
  // Encode path segment for CDN compatibility.
  return `/icons/apps/${encodeURIComponent(safeName)}.png`;
};

export const getAppIconUrl = (appName: string): string | null => {
  return getLocalIconPath(appName);
};

export const getAppIcon = (appName: string): string => {
  const iconUrl = getAppIconUrl(appName);
  if (iconUrl) return iconUrl;

  const initial = appName ? appName.charAt(0).toUpperCase() : '?';
  const colors = ['6366f1', '8b5cf6', 'ec4899', 'f59e0b', '10b981', '3b82f6', 'ef4444', '14b8a6'];
  const hash = appName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const bgColor = colors[Math.abs(hash) % colors.length];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${bgColor}&color=fff&bold=true&size=96`;
};

export const getAppColorGradient = (appName: string): string => {
  const colors = [
    'from-blue-400 to-indigo-600',
    'from-green-400 to-teal-600',
    'from-purple-400 to-pink-600',
    'from-yellow-400 to-orange-600',
    'from-red-400 to-rose-600',
    'from-cyan-400 to-blue-600',
    'from-emerald-400 to-green-600',
    'from-violet-400 to-purple-600',
  ];

  const hash = appName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export const getAppInitial = (appName: string): string => {
  return appName ? appName.charAt(0).toUpperCase() : '?';
};