/**
 * App Icons Utility
 *
 * 📁 이미지 폴더 규칙:
 * - 경로: public/icons/apps/
 * - 파일명: 앱이름.png (예: 배달의민족.png, 쿠팡.png)
 * - 권장 크기: 96x96px 또는 128x128px
 * - 지원 형식: PNG, JPG, WEBP
 *
 * 로컬 이미지가 있으면 우선 사용하고, 없으면 플레이스홀더를 표시합니다.
 */

// 로컬 아이콘 경로 생성
const getLocalIconPath = (appName: string): string => {
    // 파일명에 사용할 수 없는 문자 처리
    const safeName = appName.replace(/[\/\\:*?"<>|]/g, '');
    // URL 인코딩 (한국어, +, 공백 등 특수문자 처리 - Vercel CDN 호환)
    return `/icons/apps/${encodeURIComponent(safeName)}.png`;
};

// App icon mapping - returns icon URL based on app name
export const getAppIconUrl = (appName: string): string | null => {
    // 로컬 이미지 경로 반환 (이미지 존재 여부는 onError에서 처리)
    return getLocalIconPath(appName);
};

// Get app icon with fallback to placeholder
export const getAppIcon = (appName: string): string => {
    const iconUrl = getAppIconUrl(appName);
    if (iconUrl) return iconUrl;

    // Return placeholder using UI Avatars service
    const initial = appName ? appName.charAt(0).toUpperCase() : '?';
    const colors = ['6366f1', '8b5cf6', 'ec4899', 'f59e0b', '10b981', '3b82f6', 'ef4444', '14b8a6'];
    const hash = appName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const bgColor = colors[Math.abs(hash) % colors.length];

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${bgColor}&color=fff&bold=true&size=96`;
};

// Generate a colored gradient background based on app name (for placeholder)
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

    // Generate hash from app name
    const hash = appName.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
};

// Get first character or emoji for placeholder
export const getAppInitial = (appName: string): string => {
    return appName ? appName.charAt(0).toUpperCase() : '?';
};
