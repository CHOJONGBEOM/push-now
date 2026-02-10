import React, { useState } from 'react';
import { AlgorithmInfoModal } from './AlgorithmInfoModal';
import type { KeywordItem, TfIdfKeyword } from '../../hooks/useKeywordTrends';

interface BaseCardProps {
    title: string;
    emoji: string;
    algorithmKey: 'bursting' | 'tfidf' | 'top';
    isLoading?: boolean;
    children: React.ReactNode;
}

const BaseCard: React.FC<BaseCardProps> = ({
    title,
    emoji,
    algorithmKey,
    isLoading,
    children,
}) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        title="알고리즘 설명 보기"
                    >
                        <span className="text-xs font-bold">?</span>
                    </button>
                </div>

                {/* 콘텐츠 */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="animate-pulse flex items-center gap-3">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="flex-1 h-3 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    children
                )}
            </div>

            <AlgorithmInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                algorithmKey={algorithmKey}
            />
        </>
    );
};

// 급상승 키워드 카드
interface BurstingKeywordsCardProps {
    keywords: KeywordItem[];
    isLoading?: boolean;
}

export const BurstingKeywordsCard: React.FC<BurstingKeywordsCardProps> = ({
    keywords,
    isLoading,
}) => {
    return (
        <BaseCard
            title="급상승 키워드"
            emoji="🔥"
            algorithmKey="bursting"
            isLoading={isLoading}
        >
            {keywords.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                    급상승 키워드가 없습니다
                </p>
            ) : (
                <div className="space-y-2">
                    {keywords.slice(0, 5).map((item, index) => (
                        <div key={item.keyword} className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 w-5">
                                {index + 1}
                            </span>
                            <span className="font-medium text-gray-900 flex-1 truncate">
                                {item.keyword}
                            </span>
                            <span className={`
                                text-xs font-bold px-2 py-0.5 rounded-full
                                ${item.changePercent && item.changePercent >= 100
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-orange-100 text-orange-600'
                                }
                            `}>
                                +{item.changePercent}%
                            </span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                                    style={{
                                        width: `${Math.min(100, (item.changePercent || 0) / 3)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </BaseCard>
    );
};

// 차별화 키워드 카드 (TF-IDF)
interface DistinctiveKeywordsCardProps {
    keywords: TfIdfKeyword[];
    isLoading?: boolean;
}

export const DistinctiveKeywordsCard: React.FC<DistinctiveKeywordsCardProps> = ({
    keywords,
    isLoading,
}) => {
    // 앱별로 그룹핑
    const byApp = keywords.reduce((acc, k) => {
        if (!acc[k.appName]) acc[k.appName] = [];
        acc[k.appName].push(k);
        return acc;
    }, {} as Record<string, TfIdfKeyword[]>);

    return (
        <BaseCard
            title="차별화 키워드"
            emoji="💎"
            algorithmKey="tfidf"
            isLoading={isLoading}
        >
            {Object.keys(byApp).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                    차별화 키워드가 없습니다
                </p>
            ) : (
                <div className="space-y-3">
                    {Object.entries(byApp).slice(0, 4).map(([appName, kws]) => (
                        <div key={appName}>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                {appName}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {kws.slice(0, 3).map(k => (
                                    <span
                                        key={k.keyword}
                                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
                                    >
                                        {k.keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </BaseCard>
    );
};

// TOP 키워드 카드
interface TopKeywordsCardProps {
    keywords: KeywordItem[];
    isLoading?: boolean;
}

export const TopKeywordsCard: React.FC<TopKeywordsCardProps> = ({
    keywords,
    isLoading,
}) => {
    const maxCount = keywords[0]?.count || 1;

    return (
        <BaseCard
            title="TOP 10 키워드"
            emoji="📊"
            algorithmKey="top"
            isLoading={isLoading}
        >
            {keywords.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                    키워드가 없습니다
                </p>
            ) : (
                <div className="space-y-2">
                    {keywords.slice(0, 10).map((item, index) => (
                        <div key={item.keyword} className="flex items-center gap-3">
                            <span className={`
                                text-sm font-bold w-5
                                ${index < 3 ? 'text-gray-900' : 'text-gray-400'}
                            `}>
                                {index + 1}
                            </span>
                            <span className={`
                                font-medium flex-1 truncate
                                ${index < 3 ? 'text-gray-900' : 'text-gray-600'}
                            `}>
                                {item.keyword}
                            </span>
                            <span className="text-xs text-gray-400 w-10 text-right">
                                {item.count}회
                            </span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        index < 3
                                            ? 'bg-gray-900'
                                            : 'bg-gray-400'
                                    }`}
                                    style={{
                                        width: `${(item.count / maxCount) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </BaseCard>
    );
};
