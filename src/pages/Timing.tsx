import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { useTimingData } from '../hooks/useTimingData';
import { GoldenHoursCard } from '../components/timing/GoldenHoursCard';
import { TimingHeatmap } from '../components/timing/TimingHeatmap';
import { DayOfWeekChart } from '../components/timing/DayOfWeekChart';
import { AppFilter } from '../components/timing/AppFilter';
import { EventTimeline } from '../components/timing/EventTimeline';
import { getAppIcon } from '../utils/appIcons';

const PERIOD_OPTIONS = [
    { value: 7, label: '7일' },
    { value: 14, label: '14일' },
    { value: 30, label: '30일' },
    { value: 90, label: '90일' },
];

// 기간 비교 프리셋
const PERIOD_COMPARE_PRESETS = [
    { id: 'week', label: '이번주 vs 지난주', period1Label: '이번주', period2Label: '지난주' },
    { id: 'month', label: '이번달 vs 지난달', period1Label: '이번달', period2Label: '지난달' },
    { id: 'custom', label: '직접 선택', period1Label: '기간 1', period2Label: '기간 2' },
];

export const Timing: React.FC = () => {
    const [days, setDays] = useState(30);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [compareMode, setCompareMode] = useState(false);
    const [periodCompareMode, setPeriodCompareMode] = useState(false);
    const [periodPreset, setPeriodPreset] = useState<string>('week');

    // 기간 비교용 날짜 계산
    const periodDates = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (periodPreset === 'week') {
            // 이번주: 일요일~오늘, 지난주: 지난주 일요일~토요일
            const dayOfWeek = today.getDay();
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - dayOfWeek);

            const lastWeekStart = new Date(thisWeekStart);
            lastWeekStart.setDate(thisWeekStart.getDate() - 7);
            const lastWeekEnd = new Date(thisWeekStart);
            lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

            return {
                period1: { start: thisWeekStart, end: today, label: '이번주' },
                period2: { start: lastWeekStart, end: lastWeekEnd, label: '지난주' },
            };
        } else if (periodPreset === 'month') {
            // 이번달: 1일~오늘, 지난달: 지난달 1일~말일
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

            return {
                period1: { start: thisMonthStart, end: today, label: '이번달' },
                period2: { start: lastMonthStart, end: lastMonthEnd, label: '지난달' },
            };
        }

        // 기본값
        return {
            period1: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: today, label: '최근 7일' },
            period2: { start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), label: '그 전 7일' },
        };
    }, [periodPreset]);

    // 메인 데이터 (선택된 앱 또는 전체)
    const mainData = useTimingData({
        days: periodCompareMode ? undefined : days,
        startDate: periodCompareMode ? periodDates.period1.start : undefined,
        endDate: periodCompareMode ? periodDates.period1.end : undefined,
        appNames: compareMode ? (selectedApps[0] ? [selectedApps[0]] : []) : selectedApps,
    });

    // 비교 데이터 (앱 비교 모드 또는 기간 비교 모드)
    const compareData = useTimingData({
        days: periodCompareMode ? undefined : days,
        startDate: periodCompareMode ? periodDates.period2.start : undefined,
        endDate: periodCompareMode ? periodDates.period2.end : undefined,
        appNames: compareMode && selectedApps[1] ? [selectedApps[1]] : (periodCompareMode ? selectedApps : []),
    });

    // 비교 모드에서 표시할 앱 이름
    const app1Name = compareMode && selectedApps[0] ? selectedApps[0] : null;
    const app2Name = compareMode && selectedApps[1] ? selectedApps[1] : null;

    // 현재 보고 있는 대상 레이블
    const targetLabel = useMemo(() => {
        if (compareMode) {
            if (app1Name && app2Name) return `${app1Name} vs ${app2Name}`;
            if (app1Name) return app1Name;
            return '앱을 선택하세요';
        }
        if (selectedApps.length === 0) return '전체 앱';
        if (selectedApps.length === 1) return selectedApps[0];
        return `${selectedApps.length}개 앱`;
    }, [compareMode, selectedApps, app1Name, app2Name]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-24 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
                {/* 페이지 헤더 */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                발송 타이밍 분석
                            </h1>
                            <p className="text-gray-500">
                                경쟁사 푸시 발송 패턴을 분석하여 최적의 발송 시간을 찾아보세요
                            </p>
                        </div>

                        {/* 필터 컨트롤 */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* 앱 필터 */}
                            <AppFilter
                                selectedApps={selectedApps}
                                onSelectionChange={setSelectedApps}
                                compareMode={compareMode}
                                onCompareModeChange={(mode) => {
                                    setCompareMode(mode);
                                    if (mode) setPeriodCompareMode(false);
                                }}
                            />

                            {/* 구분선 */}
                            <div className="h-8 w-px bg-gray-200" />

                            {/* 기간 비교 토글 */}
                            <button
                                onClick={() => {
                                    setPeriodCompareMode(!periodCompareMode);
                                    if (!periodCompareMode) setCompareMode(false);
                                }}
                                className={`
                                    px-3 py-1.5 rounded-xl text-sm font-medium transition-all border
                                    ${periodCompareMode
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                📊 기간 비교
                            </button>

                            {/* 기간 비교 프리셋 */}
                            {periodCompareMode && (
                                <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                                    {PERIOD_COMPARE_PRESETS.filter(p => p.id !== 'custom').map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setPeriodPreset(preset.id)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                                ${periodPreset === preset.id
                                                    ? 'bg-purple-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 구분선 */}
                            {!periodCompareMode && <div className="h-8 w-px bg-gray-200" />}

                            {/* 기간 선택 (기간 비교 모드가 아닐 때만) */}
                            {!periodCompareMode && (
                                <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                                    {PERIOD_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setDays(option.value)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                                ${days === option.value
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 요약 통계 */}
                    <div className="flex flex-wrap items-center gap-4 mt-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100">
                            <span className="text-sm text-gray-500">분석 대상</span>
                            <span className="text-sm font-bold text-gray-900">{targetLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100">
                            <span className="text-sm text-gray-500">총</span>
                            <span className="text-sm font-bold text-gray-900">{mainData.totalCount}건</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100">
                            <span className="text-sm text-gray-500">슬롯당 평균</span>
                            <span className="text-sm font-bold text-gray-900">{mainData.avgPerSlot.toFixed(1)}건</span>
                        </div>
                        {periodCompareMode && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100">
                                <span className="text-sm text-purple-600">📊</span>
                                <span className="text-sm font-bold text-purple-700">
                                    {periodDates.period1.label} vs {periodDates.period2.label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 이벤트 타임라인 */}
                {!periodCompareMode && !compareMode && (
                    <div className="mb-6">
                        <EventTimeline days={days} />
                    </div>
                )}

                {/* 에러 표시 */}
                {mainData.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                        {mainData.error}
                    </div>
                )}

                {/* 기간 비교 모드 */}
                {periodCompareMode ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* 기간 1 */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-4 py-3 bg-purple-600 rounded-2xl">
                                    <span className="text-2xl">📅</span>
                                    <div>
                                        <p className="text-white font-bold">{periodDates.period1.label}</p>
                                        <p className="text-purple-200 text-sm">
                                            {periodDates.period1.start.toLocaleDateString('ko-KR')} ~ {periodDates.period1.end.toLocaleDateString('ko-KR')}
                                            {' · '}{mainData.totalCount}건
                                        </p>
                                    </div>
                                </div>
                                <TimingHeatmap
                                    data={mainData.heatmapData}
                                    isLoading={mainData.isLoading}
                                    days={days}
                                    appNames={selectedApps}
                                />
                                <GoldenHoursCard
                                    goldenHours={mainData.goldenHours}
                                    avoidTime={mainData.avoidTime}
                                    isLoading={mainData.isLoading}
                                />
                            </div>

                            {/* 기간 2 */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-2xl">
                                    <span className="text-2xl">📅</span>
                                    <div>
                                        <p className="text-gray-900 font-bold">{periodDates.period2.label}</p>
                                        <p className="text-gray-500 text-sm">
                                            {periodDates.period2.start.toLocaleDateString('ko-KR')} ~ {periodDates.period2.end.toLocaleDateString('ko-KR')}
                                            {' · '}{compareData.totalCount}건
                                        </p>
                                    </div>
                                </div>
                                <TimingHeatmap
                                    data={compareData.heatmapData}
                                    isLoading={compareData.isLoading}
                                    days={days}
                                    appNames={selectedApps}
                                />
                                <GoldenHoursCard
                                    goldenHours={compareData.goldenHours}
                                    avoidTime={compareData.avoidTime}
                                    isLoading={compareData.isLoading}
                                />
                            </div>
                        </div>

                        {/* 기간 비교 인사이트 */}
                        {mainData.goldenHours[0] && compareData.goldenHours[0] && (
                            <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl text-white">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>💡</span> 기간 비교 인사이트
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <p className="text-purple-200 text-sm mb-1">발송량 변화</p>
                                        <p className="font-medium text-lg">
                                            {mainData.totalCount > compareData.totalCount
                                                ? `+${mainData.totalCount - compareData.totalCount}건 증가`
                                                : mainData.totalCount < compareData.totalCount
                                                    ? `${mainData.totalCount - compareData.totalCount}건 감소`
                                                    : '변동 없음'
                                            }
                                            {compareData.totalCount > 0 && (
                                                <span className="text-sm ml-2 opacity-80">
                                                    ({mainData.totalCount > compareData.totalCount ? '+' : ''}
                                                    {Math.round((mainData.totalCount - compareData.totalCount) / compareData.totalCount * 100)}%)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <p className="text-purple-200 text-sm mb-1">{periodDates.period1.label} 골든아워</p>
                                        <p className="font-medium">
                                            {mainData.goldenHours[0]?.dayName}요일 {mainData.goldenHours[0]?.hourRange}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <p className="text-purple-200 text-sm mb-1">{periodDates.period2.label} 골든아워</p>
                                        <p className="font-medium">
                                            {compareData.goldenHours[0]?.dayName}요일 {compareData.goldenHours[0]?.hourRange}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : compareMode ? (
                    <div className="space-y-6">
                        {/* 비교 모드 안내 */}
                        {(!app1Name || !app2Name) && (
                            <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                <p className="text-gray-500">
                                    {!app1Name
                                        ? '비교할 첫 번째 앱을 선택하세요'
                                        : '비교할 두 번째 앱을 선택하세요'}
                                </p>
                            </div>
                        )}

                        {/* 비교 뷰 */}
                        {app1Name && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* 앱 1 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 rounded-2xl">
                                        <img
                                            src={getAppIcon(app1Name)}
                                            alt={app1Name}
                                            className="w-10 h-10 rounded-xl"
                                        />
                                        <div>
                                            <p className="text-white font-bold">{app1Name}</p>
                                            <p className="text-gray-400 text-sm">{mainData.totalCount}건 발송</p>
                                        </div>
                                    </div>
                                    <TimingHeatmap
                                        data={mainData.heatmapData}
                                        isLoading={mainData.isLoading}
                                        days={days}
                                        appNames={selectedApps[0] ? [selectedApps[0]] : []}
                                    />
                                    <GoldenHoursCard
                                        goldenHours={mainData.goldenHours}
                                        avoidTime={mainData.avoidTime}
                                        isLoading={mainData.isLoading}
                                    />
                                </div>

                                {/* 앱 2 */}
                                {app2Name ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-2xl">
                                            <img
                                                src={getAppIcon(app2Name)}
                                                alt={app2Name}
                                                className="w-10 h-10 rounded-xl"
                                            />
                                            <div>
                                                <p className="text-gray-900 font-bold">{app2Name}</p>
                                                <p className="text-gray-500 text-sm">{compareData.totalCount}건 발송</p>
                                            </div>
                                        </div>
                                        <TimingHeatmap
                                            data={compareData.heatmapData}
                                            isLoading={compareData.isLoading}
                                            days={days}
                                            appNames={selectedApps[1] ? [selectedApps[1]] : []}
                                        />
                                        <GoldenHoursCard
                                            goldenHours={compareData.goldenHours}
                                            avoidTime={compareData.avoidTime}
                                            isLoading={compareData.isLoading}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center p-8 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-400">두 번째 앱을 선택하세요</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 비교 인사이트 */}
                        {app1Name && app2Name && mainData.goldenHours[0] && compareData.goldenHours[0] && (
                            <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>💡</span> 비교 인사이트
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <p className="text-gray-300 text-sm mb-1">발송 전략 차이</p>
                                        <p className="font-medium">
                                            {app1Name}은 <strong>{mainData.goldenHours[0]?.dayName}요일 {mainData.goldenHours[0]?.hourRange}</strong>가 한산,{' '}
                                            {app2Name}은 <strong>{compareData.goldenHours[0]?.dayName}요일 {compareData.goldenHours[0]?.hourRange}</strong>가 한산
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <p className="text-gray-300 text-sm mb-1">발송량 비교</p>
                                        <p className="font-medium">
                                            {mainData.totalCount > compareData.totalCount
                                                ? `${app1Name}이 ${mainData.totalCount - compareData.totalCount}건 더 많이 발송`
                                                : mainData.totalCount < compareData.totalCount
                                                    ? `${app2Name}이 ${compareData.totalCount - mainData.totalCount}건 더 많이 발송`
                                                    : '발송량이 동일합니다'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 일반 모드 */
                    <div className="space-y-6">
                        {/* 골든아워 카드 */}
                        <GoldenHoursCard
                            goldenHours={mainData.goldenHours}
                            avoidTime={mainData.avoidTime}
                            isLoading={mainData.isLoading}
                        />

                        {/* 히트맵 (전체 너비) */}
                        <TimingHeatmap
                            data={mainData.heatmapData}
                            isLoading={mainData.isLoading}
                            days={days}
                            appNames={selectedApps}
                        />

                        {/* 요일별 차트 (전체 너비, 하단) */}
                        <DayOfWeekChart
                            data={mainData.dayOfWeekData}
                            isLoading={mainData.isLoading}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};
