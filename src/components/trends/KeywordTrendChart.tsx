import React, { useMemo } from 'react';

interface KeywordTrendChartProps {
    data: Array<{ date: string; [keyword: string]: string | number }>;
    isLoading?: boolean;
}

// 라인 색상
const LINE_COLORS = [
    '#6366f1', // indigo
    '#ec4899', // pink
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
];

export const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({
    data,
    isLoading,
}) => {
    // 키워드 목록 추출
    const keywords = useMemo(() => {
        if (data.length === 0) return [];
        return Object.keys(data[0]).filter(k => k !== 'date');
    }, [data]);

    // 차트 데이터 계산
    const chartData = useMemo(() => {
        if (data.length === 0 || keywords.length === 0) return null;

        const maxValue = Math.max(
            ...data.flatMap(d => keywords.map(k => Number(d[k]) || 0))
        );

        const height = 200;
        const width = 600;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // X축 스케일
        const xStep = chartWidth / (data.length - 1 || 1);

        // 각 키워드별 path 생성
        const paths = keywords.map((keyword, keyIdx) => {
            const points = data.map((d, i) => ({
                x: padding.left + i * xStep,
                y: padding.top + chartHeight - (Number(d[keyword]) || 0) / (maxValue || 1) * chartHeight,
            }));

            const pathD = points.reduce((acc, p, i) => {
                if (i === 0) return `M ${p.x} ${p.y}`;
                return `${acc} L ${p.x} ${p.y}`;
            }, '');

            return {
                keyword,
                color: LINE_COLORS[keyIdx % LINE_COLORS.length],
                path: pathD,
                points,
            };
        });

        // X축 레이블 (날짜)
        const xLabels = data.map((d, i) => ({
            x: padding.left + i * xStep,
            label: d.date.slice(5), // MM-DD 형식
        }));

        // Y축 레이블
        const yLabels = [0, Math.ceil(maxValue / 2), maxValue].map((v, i) => ({
            y: padding.top + chartHeight - (v / (maxValue || 1)) * chartHeight,
            label: v.toString(),
        }));

        return {
            width,
            height,
            padding,
            chartWidth,
            chartHeight,
            paths,
            xLabels,
            yLabels,
            maxValue,
        };
    }, [data, keywords]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="h-52 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    if (!chartData || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📈</span>
                    <h3 className="font-semibold text-gray-900">키워드 추이</h3>
                </div>
                <div className="h-52 flex items-center justify-center text-gray-400">
                    추이 데이터가 없습니다
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    <h3 className="font-semibold text-gray-900">키워드 추이</h3>
                </div>

                {/* 범례 */}
                <div className="flex flex-wrap gap-3">
                    {chartData.paths.map(p => (
                        <div key={p.keyword} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: p.color }}
                            />
                            <span className="text-xs text-gray-600">{p.keyword}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 차트 */}
            <div className="overflow-x-auto">
                <svg
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                    className="w-full min-w-[500px]"
                    style={{ height: chartData.height }}
                >
                    {/* 배경 그리드 */}
                    <g className="text-gray-100">
                        {chartData.yLabels.map((label, i) => (
                            <line
                                key={i}
                                x1={chartData.padding.left}
                                y1={label.y}
                                x2={chartData.padding.left + chartData.chartWidth}
                                y2={label.y}
                                stroke="currentColor"
                                strokeDasharray="4 4"
                            />
                        ))}
                    </g>

                    {/* Y축 레이블 */}
                    {chartData.yLabels.map((label, i) => (
                        <text
                            key={i}
                            x={chartData.padding.left - 8}
                            y={label.y + 4}
                            textAnchor="end"
                            className="text-xs fill-gray-400"
                        >
                            {label.label}
                        </text>
                    ))}

                    {/* X축 레이블 */}
                    {chartData.xLabels
                        .filter((_, i) => i % Math.ceil(chartData.xLabels.length / 7) === 0)
                        .map((label, i) => (
                            <text
                                key={i}
                                x={label.x}
                                y={chartData.height - 10}
                                textAnchor="middle"
                                className="text-xs fill-gray-400"
                            >
                                {label.label}
                            </text>
                        ))}

                    {/* 라인들 */}
                    {chartData.paths.map(p => (
                        <g key={p.keyword}>
                            {/* 라인 */}
                            <path
                                d={p.path}
                                fill="none"
                                stroke={p.color}
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* 포인트 */}
                            {p.points.map((point, i) => (
                                <circle
                                    key={i}
                                    cx={point.x}
                                    cy={point.y}
                                    r={4}
                                    fill="white"
                                    stroke={p.color}
                                    strokeWidth={2}
                                    className="transition-all duration-200 hover:r-6"
                                />
                            ))}
                        </g>
                    ))}
                </svg>
            </div>

            {/* 설명 */}
            <p className="mt-3 text-xs text-gray-400 text-center">
                TOP 5 키워드의 일별 출현 빈도 추이
            </p>
        </div>
    );
};
