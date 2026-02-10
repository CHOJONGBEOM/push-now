import React, { useState, useMemo } from 'react';
import { useMarketingHooks, HOOK_TYPE_INFO, TRIGGER_INFO, type HookType, type TriggerType } from '../hooks/useMarketingHooks';
import { AppFilter } from '../components/timing/AppFilter';
import { getAppIcon } from '../utils/appIcons';
import { Navbar } from '../components/Navbar';

const PERIOD_OPTIONS = [
    { value: 7, label: '7일' },
    { value: 14, label: '14일' },
    { value: 30, label: '30일' },
];

export const Trends: React.FC = () => {
    const [days, setDays] = useState(30);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<HookType | null>(null);
    const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);
    const [messageAppFilter, setMessageAppFilter] = useState<string | null>(null);

    const {
        isLoading,
        error,
        totalAnalyzed,
        hookDistribution,
        triggerDistribution,
        appStrategies,
        messages,
    } = useMarketingHooks({
        days,
        appNames: selectedApps,
    });

    // 앱별 메시지 필터링
    const filteredMessages = useMemo(() => {
        if (!messageAppFilter) {
            return messages.slice(0, 15);
        }
        return messages.filter(m => m.app_name === messageAppFilter).slice(0, 15);
    }, [messages, messageAppFilter]);

    // 메시지 섹션에서 사용할 앱 목록
    const availableApps = useMemo(() => {
        const appCounts = new Map<string, number>();
        for (const msg of messages) {
            if (msg.app_name) {
                appCounts.set(msg.app_name, (appCounts.get(msg.app_name) || 0) + 1);
            }
        }
        return [...appCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);
    }, [messages]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span>🎯</span>
                                마케팅 전략 분석
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                AI가 분석한 푸시 메시지의 핵심 마케팅 훅과 심리 트리거
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                {PERIOD_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setDays(option.value)}
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                                            ${days === option.value
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }
                                        `}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <AppFilter
                                selectedApps={selectedApps}
                                onSelectionChange={setSelectedApps}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
                {/* 요약 */}
                <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                        AI 분석 완료: <strong className="text-gray-900">{totalAnalyzed}건</strong>
                    </span>
                    <span>•</span>
                    <span>
                        기간: 최근 <strong className="text-gray-900">{days}일</strong>
                    </span>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* 2열 분포: 전략 유형 + 심리 트리거 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 전략 유형 분포 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">📊 마케팅 전략 분포</h2>
                            <p className="text-xs text-gray-400">What: 어떤 메시지를 보내는가</p>
                        </div>

                        {isLoading ? (
                            <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />
                        ) : (
                            <>
                                {/* 스택 바 */}
                                <div className="h-8 rounded-xl overflow-hidden flex mb-4">
                                    {hookDistribution.map(d => {
                                        const info = HOOK_TYPE_INFO[d.type];
                                        return (
                                            <button
                                                key={d.type}
                                                onClick={() => setSelectedStrategy(selectedStrategy === d.type ? null : d.type)}
                                                className={`${info.color.split(' ')[0]} relative group transition-all hover:opacity-80`}
                                                style={{ width: `${d.percentage}%` }}
                                                title={`${info.name}: ${d.percentage}%`}
                                            >
                                                {d.percentage >= 12 && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-sm">
                                                        {info.emoji}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 범례 */}
                                <div className="grid grid-cols-2 gap-2">
                                    {hookDistribution.slice(0, 6).map(d => {
                                        const info = HOOK_TYPE_INFO[d.type];
                                        const isSelected = selectedStrategy === d.type;
                                        return (
                                            <button
                                                key={d.type}
                                                onClick={() => setSelectedStrategy(isSelected ? null : d.type)}
                                                className={`
                                                    p-2 rounded-lg text-left transition-all text-sm
                                                    ${info.color} ${isSelected ? 'ring-2 ring-offset-2' : 'hover:opacity-80'}
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>{info.emoji}</span>
                                                        <span className={isSelected ? "font-bold" : ""}>{info.name}</span>
                                                    </span>
                                                    <span className="font-bold">{d.percentage}%</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 선택된 전략 설명 */}
                                {selectedStrategy && (
                                    <div className={`mt-3 p-3 rounded-lg ${HOOK_TYPE_INFO[selectedStrategy].color}`}>
                                        <p className="text-sm">
                                            {HOOK_TYPE_INFO[selectedStrategy].description}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* 심리 트리거 분포 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">🧠 심리 트리거 분포</h2>
                            <p className="text-xs text-gray-400">Why: 왜 클릭하게 만드는가</p>
                        </div>

                        {isLoading ? (
                            <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />
                        ) : (
                            <>
                                {/* 스택 바 */}
                                <div className="h-8 rounded-xl overflow-hidden flex mb-4 bg-gray-100">
                                    {triggerDistribution.filter(d => d.trigger !== 'none').map(d => {
                                        const info = TRIGGER_INFO[d.trigger];
                                        const colors: Record<string, string> = {
                                            greed: 'bg-emerald-400',
                                            scarcity: 'bg-amber-400',
                                            personalization: 'bg-violet-400',
                                            curiosity: 'bg-cyan-400',
                                            social_proof: 'bg-rose-400',
                                            novelty: 'bg-indigo-400',
                                        };
                                        return (
                                            <button
                                                key={d.trigger}
                                                onClick={() => setSelectedTrigger(selectedTrigger === d.trigger ? null : d.trigger)}
                                                className={`${colors[d.trigger] || 'bg-gray-300'} relative transition-all hover:opacity-80`}
                                                style={{ width: `${d.percentage}%` }}
                                                title={`${info.name}: ${d.percentage}%`}
                                            >
                                                {d.percentage >= 12 && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-sm">
                                                        {info.emoji}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 범례 */}
                                <div className="grid grid-cols-2 gap-2">
                                    {triggerDistribution.filter(d => d.trigger !== 'none').slice(0, 6).map(d => {
                                        const info = TRIGGER_INFO[d.trigger];
                                        const isSelected = selectedTrigger === d.trigger;
                                        const colors: Record<string, string> = {
                                            greed: 'bg-emerald-400',
                                            scarcity: 'bg-amber-400',
                                            personalization: 'bg-violet-400',
                                            curiosity: 'bg-cyan-400',
                                            social_proof: 'bg-rose-400',
                                            novelty: 'bg-indigo-400',
                                        };
                                        const colorClass = colors[d.trigger] || 'bg-gray-300';
                                        return (
                                            <button
                                                key={d.trigger}
                                                onClick={() => setSelectedTrigger(isSelected ? null : d.trigger)}
                                                className={`
                                                    p-2 rounded-lg text-left transition-all text-sm
                                                    ${colorClass} ${isSelected ? 'ring-2 ring-offset-2' : 'hover:opacity-80'}
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>{info.emoji}</span>
                                                        <span className={isSelected ? "font-bold text-gray-900" : "text-gray-900"}>{info.name}</span>
                                                    </span>
                                                    <span className="font-bold text-gray-900">{d.percentage}%</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 선택된 트리거 설명 */}
                                {selectedTrigger && (
                                    <div className="mt-3 p-3 rounded-lg bg-gray-100">
                                        <p className="text-sm text-gray-700">
                                            <strong>{TRIGGER_INFO[selectedTrigger].name}:</strong>{' '}
                                            {TRIGGER_INFO[selectedTrigger].description}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 2열 그리드: 앱별 전략 + 인기 훅 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 앱별 전략 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">🏢 앱별 주력 전략</h2>

                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {appStrategies.slice(0, 8).map(app => {
                                    const primaryInfo = HOOK_TYPE_INFO[app.primaryStrategy];
                                    const secondaryInfo = app.strategies[1] ? HOOK_TYPE_INFO[app.strategies[1].type] : null;
                                    return (
                                        <div
                                            key={app.appName}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <img
                                                src={getAppIcon(app.appName)}
                                                alt={app.appName}
                                                className="w-10 h-10 rounded-xl"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">{app.appName}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${primaryInfo.color}`}>
                                                        {primaryInfo.emoji} {primaryInfo.name}
                                                    </span>
                                                    {secondaryInfo && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${secondaryInfo.color} opacity-70`}>
                                                            {secondaryInfo.emoji} {secondaryInfo.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 mt-1">
                                                    {app.strategies.slice(0, 4).map(s => {
                                                        const info = HOOK_TYPE_INFO[s.type];
                                                        return (
                                                            <div
                                                                key={s.type}
                                                                className={`h-1.5 rounded-full ${info.color.split(' ')[0]}`}
                                                                style={{ width: `${s.percentage}%`, minWidth: '4px' }}
                                                                title={`${info.name}: ${s.percentage}%`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-400">{app.totalMessages}건</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 앱별 최근 메시지 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">📱 앱별 최근 메시지</h2>
                            <p className="text-xs text-gray-400">전략과 트리거 분석 포함</p>
                        </div>

                        {/* 앱 선택 필터 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => setMessageAppFilter(null)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${messageAppFilter === null
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                전체
                            </button>
                            {availableApps.slice(0, 6).map(appName => (
                                <button
                                    key={appName}
                                    onClick={() => setMessageAppFilter(messageAppFilter === appName ? null : appName)}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                        ${messageAppFilter === appName
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    <img
                                        src={getAppIcon(appName)}
                                        alt={appName}
                                        className="w-4 h-4 rounded"
                                    />
                                    {appName}
                                </button>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />
                                ))}
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                메시지가 없습니다
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                {filteredMessages.map((msg) => {
                                    const hookInfo = msg.hook_type ? HOOK_TYPE_INFO[msg.hook_type] : null;
                                    const triggerInfo = msg.hook_trigger ? TRIGGER_INFO[msg.hook_trigger] : null;
                                    return (
                                        <div
                                            key={msg.id}
                                            className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            {/* 앱 정보 & 날짜 */}
                                            <div className="flex items-center gap-2 mb-2">
                                                {msg.app_name && (
                                                    <>
                                                        <img
                                                            src={getAppIcon(msg.app_name)}
                                                            alt={msg.app_name}
                                                            className="w-5 h-5 rounded"
                                                        />
                                                        <span className="text-xs font-medium text-gray-600">{msg.app_name}</span>
                                                    </>
                                                )}
                                                <span className="text-xs text-gray-400 ml-auto">
                                                    {msg.posted_at && new Date(msg.posted_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* 메시지 내용 */}
                                            <div className="mb-2">
                                                {msg.title && (
                                                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{msg.title}</p>
                                                )}
                                                {msg.body && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">{msg.body}</p>
                                                )}
                                            </div>

                                            {/* 마케팅 훅 & 태그 */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {hookInfo && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hookInfo.color}`}>
                                                        {hookInfo.emoji} {hookInfo.name}
                                                    </span>
                                                )}
                                                {triggerInfo && triggerInfo.emoji !== '➖' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                                        {triggerInfo.emoji} {triggerInfo.name}
                                                    </span>
                                                )}
                                                {msg.marketing_hook && (
                                                    <span className="text-xs text-gray-400 italic ml-1">
                                                        "{msg.marketing_hook}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 인사이트 카드 */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>💡</span> 분석 인사이트
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/60 text-sm mb-1">가장 많이 사용되는 전략</p>
                            <p className="text-xl font-bold">
                                {hookDistribution[0] && (
                                    <>
                                        {HOOK_TYPE_INFO[hookDistribution[0].type].emoji}{' '}
                                        {HOOK_TYPE_INFO[hookDistribution[0].type].name}
                                    </>
                                )}
                            </p>
                            <p className="text-white/60 text-sm mt-1">
                                전체의 {hookDistribution[0]?.percentage || 0}% 차지
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/60 text-sm mb-1">주요 심리 트리거</p>
                            <p className="text-xl font-bold">
                                {triggerDistribution[0] && triggerDistribution[0].trigger !== 'none' && (
                                    <>
                                        {TRIGGER_INFO[triggerDistribution[0].trigger].emoji}{' '}
                                        {TRIGGER_INFO[triggerDistribution[0].trigger].name}
                                    </>
                                )}
                            </p>
                            <p className="text-white/60 text-sm mt-1">
                                {triggerDistribution[0]?.percentage || 0}%의 메시지가 활용
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/60 text-sm mb-1">가장 활발한 앱</p>
                            <p className="text-xl font-bold truncate">
                                {appStrategies[0]?.appName || '-'}
                            </p>
                            <p className="text-white/60 text-sm mt-1">
                                {appStrategies[0]?.totalMessages || 0}건 메시지 발송
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
