import React, { useState } from 'react';
import { AlgorithmInfoModal } from './AlgorithmInfoModal';
import type { KeywordTypeDistribution, EmojiItem } from '../../hooks/useKeywordTrends';
import { KEYWORD_TYPES } from '../../utils/keywordExtractor';

// 키워드 유형 분포 차트
interface KeywordTypeChartProps {
    distribution: KeywordTypeDistribution[];
    isLoading?: boolean;
}

export const KeywordTypeChart: React.FC<KeywordTypeChartProps> = ({
    distribution,
    isLoading,
}) => {
    const [showInfo, setShowInfo] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const total = distribution.reduce((sum, d) => sum + d.count, 0);

    return (
        <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏷️</span>
                        <h3 className="font-semibold text-gray-900">키워드 유형 분포</h3>
                    </div>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        title="알고리즘 설명 보기"
                    >
                        <span className="text-xs font-bold">?</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-gray-100 rounded"></div>
                            ))}
                        </div>
                    </div>
                ) : total === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">
                        분석할 데이터가 없습니다
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* 스택 바 차트 */}
                        <div className="h-6 rounded-full overflow-hidden flex bg-gray-100">
                            {distribution.filter(d => d.count > 0).map(d => (
                                <div
                                    key={d.type}
                                    className={`${d.color.split(' ')[0]} cursor-pointer hover:opacity-80 transition-opacity relative group`}
                                    style={{ width: `${d.percentage}%` }}
                                    onClick={() => setSelectedType(selectedType === d.type ? null : d.type)}
                                >
                                    {d.percentage >= 15 && (
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                            {d.emoji}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 범례 및 상세 */}
                        <div className="space-y-2">
                            {distribution.filter(d => d.count > 0).map(d => {
                                const typeInfo = KEYWORD_TYPES[d.type];
                                const isSelected = selectedType === d.type;

                                return (
                                    <div
                                        key={d.type}
                                        className={`
                                            rounded-xl p-3 cursor-pointer transition-all
                                            ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}
                                        `}
                                        onClick={() => setSelectedType(isSelected ? null : d.type)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${d.color.split(' ')[0]}`} />
                                                <span className="text-sm">{d.emoji}</span>
                                                <span className="font-medium text-gray-900">{d.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">{d.count}회</span>
                                                <span className="text-sm font-bold text-gray-900">{d.percentage}%</span>
                                            </div>
                                        </div>

                                        {/* 상세 설명 (선택 시) */}
                                        {isSelected && typeInfo && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    <strong>설명:</strong> {typeInfo.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {typeInfo.keywords.slice(0, 6).map(kw => (
                                                        <span
                                                            key={kw}
                                                            className="px-2 py-0.5 bg-white text-gray-600 rounded text-xs border"
                                                        >
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <AlgorithmInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                algorithmKey="keywordType"
            />
        </>
    );
};

// 이모지 분포 차트
interface EmojiChartProps {
    emojis: EmojiItem[];
    isLoading?: boolean;
}

export const EmojiChart: React.FC<EmojiChartProps> = ({
    emojis,
    isLoading,
}) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">😀</span>
                        <h3 className="font-semibold text-gray-900">인기 이모지</h3>
                    </div>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        title="알고리즘 설명 보기"
                    >
                        <span className="text-xs font-bold">?</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="animate-pulse flex gap-3 justify-center py-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                ) : emojis.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">
                        이모지가 없습니다
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* 상위 이모지 큰 아이콘 */}
                        <div className="flex justify-center gap-3 py-2">
                            {emojis.slice(0, 5).map((item, index) => (
                                <div
                                    key={item.emoji}
                                    className="text-center group cursor-default"
                                >
                                    <div
                                        className={`
                                            rounded-xl flex items-center justify-center
                                            transition-transform hover:scale-110
                                            ${index === 0 ? 'w-14 h-14 bg-amber-100' :
                                                index === 1 ? 'w-12 h-12 bg-gray-100' :
                                                    index === 2 ? 'w-11 h-11 bg-orange-50' :
                                                        'w-10 h-10 bg-gray-50'
                                            }
                                        `}
                                    >
                                        <span className={`
                                            ${index === 0 ? 'text-3xl' :
                                                index === 1 ? 'text-2xl' :
                                                    index === 2 ? 'text-xl' :
                                                        'text-lg'
                                            }
                                        `}>
                                            {item.emoji}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        {item.percentage}%
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 나머지 이모지 리스트 */}
                        {emojis.length > 5 && (
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {emojis.slice(5, 10).map(item => (
                                        <div
                                            key={item.emoji}
                                            className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg"
                                        >
                                            <span>{item.emoji}</span>
                                            <span className="text-xs text-gray-400">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AlgorithmInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                algorithmKey="emoji"
            />
        </>
    );
};
