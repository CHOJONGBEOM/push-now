import React, { useState } from 'react';

interface PushPreviewProps {
    appName: string;
    title: string;
    body: string;
}

type ScreenSize = 'compact' | 'standard' | 'large';

interface ScreenConfig {
    id: ScreenSize;
    name: string;
    width: number; // px
    description: string;
    examples: string;
}

const SCREEN_CONFIGS: ScreenConfig[] = [
    {
        id: 'compact',
        name: 'Compact',
        width: 320,
        description: '6.1" 이하',
        examples: 'iPhone 15, Galaxy S25',
    },
    {
        id: 'standard',
        name: 'Standard',
        width: 360,
        description: '6.2"~6.7"',
        examples: 'iPhone 15 Plus, Galaxy S25+',
    },
    {
        id: 'large',
        name: 'Large',
        width: 400,
        description: '6.8" 이상',
        examples: 'iPhone 15 Pro Max, Galaxy S25 Ultra',
    },
];

export const PushPreview: React.FC<PushPreviewProps> = ({ appName, title, body }) => {
    const [activeSize, setActiveSize] = useState<ScreenSize>('standard');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

    const activeConfig = SCREEN_CONFIGS.find(c => c.id === activeSize)!;

    // 화면 너비에 따른 글자수 추정 (대략적)
    // 폰트 크기와 패딩을 고려한 경험적 수치
    const getTitleLimit = (width: number) => Math.floor(width / 10);
    const getBodyLimit = (width: number) => Math.floor(width / 4);

    const titleLimit = getTitleLimit(activeConfig.width);
    const bodyLimit = getBodyLimit(activeConfig.width);

    // 가장 작은 화면 기준 경고
    const compactTitleLimit = getTitleLimit(320);
    const compactBodyLimit = getBodyLimit(320);
    const willTruncateOnCompact = title.length > compactTitleLimit || body.length > compactBodyLimit;

    const truncate = (text: string, limit: number) => {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + '...';
    };

    return (
        <div className="space-y-4">
            {/* 크기 선택 탭 */}
            <div className="flex gap-2">
                {SCREEN_CONFIGS.map((config) => (
                    <button
                        key={config.id}
                        onClick={() => setActiveSize(config.id)}
                        className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeSize === config.id
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <div>{config.name}</div>
                        <div className={`text-xs ${activeSize === config.id ? 'text-gray-300' : 'text-gray-400'}`}>
                            {config.description}
                        </div>
                    </button>
                ))}
            </div>

            {/* 대표 기기 */}
            <p className="text-xs text-gray-500 text-center">
                {activeConfig.examples}
            </p>

            {/* Compact 경고 */}
            {willTruncateOnCompact && activeSize !== 'compact' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs text-amber-700">작은 화면(Compact)에서는 잘릴 수 있어요</span>
                </div>
            )}

            {/* 미리보기 */}
            <div className="flex justify-center">
                <div
                    className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-[2.5rem] p-3 shadow-2xl transition-all duration-300"
                    style={{ width: activeConfig.width + 24 }} // padding 포함
                >
                    {/* 노치/다이나믹 아일랜드 */}
                    <div className="flex justify-center mb-2">
                        <div className="w-24 h-6 bg-black rounded-full" />
                    </div>

                    {/* 알림 카드 */}
                    <div
                        className="bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-lg"
                        style={{ width: activeConfig.width }}
                    >
                        <div className="flex items-start gap-3">
                            {/* 앱 아이콘 */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white border border-gray-200">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <circle cx="12" cy="12" r="9" stroke="#111827" strokeWidth="2" fill="none" />
                                    <path d="M8 12L12 8L16 12M12 8V16" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            {/* 내용 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                                        {appName || '앱 이름'}
                                    </span>
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeStr}</span>
                                </div>
                                <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                                    {truncate(title || '제목을 입력하세요', titleLimit)}
                                </p>
                                <p className="text-gray-600 text-sm leading-snug">
                                    {truncate(body || '본문 내용을 입력하세요', bodyLimit)}
                                </p>
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button className="flex-1 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
                                닫기
                            </button>
                            <button className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
                                열기
                            </button>
                        </div>
                    </div>

                    {/* 홈 인디케이터 */}
                    <div className="flex justify-center mt-3">
                        <div className="w-32 h-1 bg-white/30 rounded-full" />
                    </div>
                </div>
            </div>

            {/* 글자수 정보 */}
            <div className="flex justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span>제목</span>
                    <span className={`font-mono px-2 py-0.5 rounded ${
                        title.length > titleLimit ? 'bg-red-100 text-red-600' : 'bg-gray-100'
                    }`}>
                        {title.length} / {titleLimit}자
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span>본문</span>
                    <span className={`font-mono px-2 py-0.5 rounded ${
                        body.length > bodyLimit ? 'bg-red-100 text-red-600' : 'bg-gray-100'
                    }`}>
                        {body.length} / {bodyLimit}자
                    </span>
                </div>
            </div>

            {/* 안전 가이드 */}
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">모든 기기에서 안전한 글자수</p>
                <div className="flex gap-4 text-xs text-gray-500">
                    <span>제목: <strong className="text-gray-700">{compactTitleLimit}자</strong> 이하</span>
                    <span>본문: <strong className="text-gray-700">{compactBodyLimit}자</strong> 이하</span>
                </div>
            </div>
        </div>
    );
};
