import React from 'react';

interface DayData {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

interface DayOfWeekChartProps {
  data: DayData[];
  isLoading?: boolean;
}

const formatSignedPercent = (value: number) => `${value > 0 ? '+' : ''}${value}%`;

const getDeviationPercent = (count: number, avg: number) => {
  if (avg <= 0) return 0;
  return Math.round(((count - avg) / avg) * 100);
};

const getDeviationMeta = (deviationPercent: number) => {
  if (deviationPercent >= 30) {
    return {
      barClass: 'from-rose-500 to-red-600',
      chipClass: 'border-rose-200 bg-rose-50 text-rose-700',
      label: '과밀',
    };
  }

  if (deviationPercent >= 10) {
    return {
      barClass: 'from-orange-400 to-amber-500',
      chipClass: 'border-orange-200 bg-orange-50 text-orange-700',
      label: '혼잡',
    };
  }

  if (deviationPercent <= -30) {
    return {
      barClass: 'from-indigo-500 to-blue-600',
      chipClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      label: '매우 한산',
    };
  }

  if (deviationPercent <= -10) {
    return {
      barClass: 'from-sky-400 to-blue-500',
      chipClass: 'border-sky-200 bg-sky-50 text-sky-700',
      label: '한산',
    };
  }

  return {
    barClass: 'from-emerald-400 to-teal-500',
    chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    label: '평균권',
  };
};

interface InfoTooltipProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ trigger, children, triggerClassName, panelClassName }) => {
  return (
    <div className={`group/tooltip relative ${triggerClassName || ''}`}>
      {trigger}
      <div
        className={`
          pointer-events-none absolute left-1/2 top-full z-[90] mt-2 w-[26rem] max-w-[calc(100vw-2rem)]
          -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150
          group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100
          ${panelClassName || ''}
        `}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ data, isLoading = false }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const avgCount = data.length > 0 ? totalCount / data.length : 0;
  const peakDay = data.length > 0 ? data.reduce((max, d) => (d.count > max.count ? d : max), data[0]) : null;

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-6 h-6 w-48 rounded bg-gray-200" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-8 rounded bg-gray-100" />
                <div className="h-8 flex-1 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm overflow-visible">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-black">
            <span className="text-2xl">📊</span>
            요일별 발송량
          </h2>
          <p className="mt-1 text-xs text-gray-500">색상은 요일 성격이 아니라 평균 대비 과밀/한산 편차를 의미합니다.</p>
        </div>

        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
          총 <span className="font-bold text-gray-900">{totalCount}</span>건
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-indigo-700">파랑: 평균 대비 낮음</span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">초록: 평균권</span>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-orange-700">주황/빨강: 평균 대비 높음</span>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const deviationPercent = getDeviationPercent(item.count, avgCount);
          const deviationMeta = getDeviationMeta(deviationPercent);
          const isPeak = peakDay?.dayOfWeek === item.dayOfWeek && item.count > 0;
          const sharePercent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

          return (
            <div key={item.dayOfWeek} className="flex items-center gap-4">
              <div className="w-10 text-sm font-semibold text-gray-700">{item.dayName}</div>

              <InfoTooltip
                triggerClassName="flex-1"
                trigger={(
                  <div className="relative h-10 overflow-hidden rounded-full bg-gray-100 cursor-help">
                    <div
                      className={`
                        flex h-full items-center justify-between rounded-full bg-gradient-to-r px-3 text-white transition-all duration-500 ease-out
                        ${deviationMeta.barClass}
                        ${isPeak ? 'shadow-md' : ''}
                      `}
                      style={{ width: `${Math.max(widthPercent, item.count > 0 ? 14 : 0)}%` }}
                    >
                      <span className="text-xs font-bold">{item.count}</span>
                      <span className="text-[11px] font-semibold opacity-95">{formatSignedPercent(deviationPercent)}</span>
                    </div>

                    {isPeak && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        피크
                      </div>
                    )}
                  </div>
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900">{item.dayName}요일 해석</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${deviationMeta.chipClass}`}>
                      {deviationMeta.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-[12px] leading-relaxed text-slate-700">
                    <p>1) 해당 요일 발송량: <span className="font-semibold">{item.count}건</span></p>
                    <p>2) 주간 평균(7일): <span className="font-semibold">{Math.round(avgCount)}건</span></p>
                    <p>3) 평균 대비 편차: <span className="font-semibold">{formatSignedPercent(deviationPercent)}</span></p>
                    <p>4) 전체 중 비중: <span className="font-semibold">{sharePercent}%</span></p>
                  </div>
                </div>
              </InfoTooltip>
            </div>
          );
        })}
      </div>

      {peakDay && peakDay.count > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <span className="text-lg">💡</span>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{peakDay.dayName}요일</span> 발송량이 가장 높습니다.
              이 요일은 노출은 많지만 동시간대 경쟁도 커질 수 있어, 타이밍 테스트를 병행하는 것이 좋습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
