import React from 'react';
import type { GoldenHour } from '../../hooks/useTimingData';

interface GoldenHoursCardProps {
  goldenHours: GoldenHour[];
  avoidTime: GoldenHour | null;
  avoidTimes?: GoldenHour[];
  sampleCount?: number;
  isLoading?: boolean;
}

const getReliabilityMeta = (sampleCount: number) => {
  if (sampleCount < 8) {
    return {
      label: '참고용 (표본 적음)',
      className: 'border border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (sampleCount < 20) {
    return {
      label: '보통 신뢰',
      className: 'border border-sky-200 bg-sky-50 text-sky-700',
    };
  }

  return {
    label: '높은 신뢰',
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  };
};

const formatSignedPercent = (value: number) => `${value > 0 ? '+' : ''}${value}%`;

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
          pointer-events-none absolute left-1/2 top-full z-[90] mt-2 w-[30rem] max-w-[calc(100vw-2rem)]
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

export const GoldenHoursCard: React.FC<GoldenHoursCardProps> = ({
  goldenHours,
  avoidTime,
  avoidTimes,
  sampleCount = 0,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-6 h-6 w-48 rounded bg-gray-200" />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 flex-1 rounded-2xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const reliability = getReliabilityMeta(sampleCount);
  const resolvedAvoidTimes = avoidTimes && avoidTimes.length > 0 ? avoidTimes : avoidTime ? [avoidTime] : [];

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600 text-white';
      case 1:
        return 'border-sky-400 bg-gradient-to-br from-sky-400 to-blue-500 text-white';
      case 2:
        return 'border-violet-400 bg-gradient-to-br from-violet-400 to-purple-500 text-white';
      default:
        return 'border-gray-200 bg-white text-black';
    }
  };

  return (
    <div className="overflow-visible rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-black">
            <span className="text-2xl">🕐</span>
            추천 발송 시간
          </h2>
          <p className="text-sm text-gray-500">경쟁 발송량이 낮은 시간대</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${reliability.className}`}>
            {reliability.label}
          </span>
          <span className="text-xs text-gray-500">표본 {sampleCount}건</span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {goldenHours.length > 0 ? (
          goldenHours.map((slot, index) => (
            <div
              key={`${slot.dayOfWeek}-${slot.hour}`}
              className={`relative overflow-visible rounded-xl border p-6 shadow-sm ${getRankStyle(index)}`}
            >
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                {index + 1}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-white/80">{slot.dayName}요일</p>
                <p className="text-2xl font-bold tracking-tight">{slot.hourRange}</p>
              </div>

              <InfoTooltip
                triggerClassName="inline-flex"
                trigger={(
                  <div className="inline-flex cursor-help items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                    <span>📉</span>
                    <span>평균 대비 {slot.percentageBelowAvg}% 낮음</span>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">i</span>
                  </div>
                )}
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">추천 지표 해석 흐름</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                      같은 앱/기간 내에서 해당 슬롯이 평균보다 얼마나 한산한지 측정해 추천합니다.
                    </p>
                  </div>

                  <div className="space-y-2 text-[12px] leading-relaxed text-slate-700">
                    <p>1) 기준 집합: 현재 필터의 06시~23시 전체 슬롯 발송량</p>
                    <p>2) 기준선: 슬롯 평균 발송량 계산</p>
                    <p>
                      3) 계산식:{' '}
                      <span className="font-semibold">(평균 - 현재 슬롯) / 평균 × 100</span>
                    </p>
                    <p>4) 값이 클수록 평균 대비 한산해 동시간대 경쟁이 낮음</p>
                  </div>
                </div>
              </InfoTooltip>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-8 text-center text-gray-400">분석할 데이터가 부족합니다</div>
        )}
      </div>

      {resolvedAvoidTimes.length > 0 && (
        <div className="overflow-visible rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-sm font-semibold text-red-700">피해야 할 시간대</h3>

            <InfoTooltip
              triggerClassName="ml-1"
              panelClassName="left-0 -translate-x-0"
              trigger={(
                <div className="inline-flex cursor-help items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-medium text-red-700">
                  지표 설명
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">i</span>
                </div>
              )}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">시장 슬롯 평균 대비 +X% 의미</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                    같은 기간 전체 앱 기준으로 특정 요일/시간 슬롯이 시장 평균 슬롯보다 얼마나 혼잡한지 나타냅니다.
                  </p>
                </div>

                <div className="space-y-2 text-[12px] leading-relaxed text-slate-700">
                  <p>1) 시장 기준선: 전체 앱의 슬롯 평균 발송량</p>
                  <p>
                    2) 계산식:{' '}
                    <span className="font-semibold">(해당 슬롯 시장 발송량 - 시장 평균) / 시장 평균 × 100</span>
                  </p>
                  <p>3) 예시: +100%는 평균의 2배, +300%는 평균의 4배 혼잡</p>
                  <p>4) 이 값은 혼잡도 지표이며 성과(클릭/전환)를 직접 뜻하지는 않음</p>
                </div>
              </div>
            </InfoTooltip>
          </div>

          <div className="space-y-2">
            {resolvedAvoidTimes.slice(0, 3).map((slot) => (
              <div
                key={`avoid-${slot.dayOfWeek}-${slot.hour}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-100 bg-white/70 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {slot.dayName}요일 {slot.hourRange}
                  </p>

                  <InfoTooltip
                    triggerClassName="inline-flex"
                    trigger={(
                      <div className="inline-flex cursor-help items-center gap-1 text-xs text-red-500">
                        <span>{slot.reason || '경쟁 밀도가 높은 시간대'}</span>
                        <span>· 시장 슬롯 평균 대비 {formatSignedPercent(slot.marketLiftPercent || 0)}</span>
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">i</span>
                      </div>
                    )}
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">이 슬롯이 회피 후보로 선정된 이유</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                          앱 내부 혼잡도와 시장 혼잡도를 함께 반영한 가중 점수로 상위 슬롯을 선정합니다.
                        </p>
                      </div>

                      <div className="space-y-2 text-[12px] leading-relaxed text-slate-700">
                        <p>1) 앱 혼잡도: 앱 평균 대비 <span className="font-semibold">+{slot.appLiftPercent ?? slot.percentageBelowAvg}%</span></p>
                        <p>2) 시장 혼잡도: 시장 슬롯 평균 대비 <span className="font-semibold">{formatSignedPercent(slot.marketLiftPercent || 0)}</span></p>
                        <p>3) 최종 점수: 앱 70% + 시장 30% 가중 결합</p>
                        <p>4) 동점/근접 시간대는 중복을 줄여 최대 3개만 노출</p>
                        {typeof slot.pressureScore === 'number' && (
                          <p>현재 슬롯 혼잡 점수: <span className="font-semibold">{slot.pressureScore}</span></p>
                        )}
                      </div>
                    </div>
                  </InfoTooltip>
                </div>

                <div className="text-right">
                  <p className="text-xs text-red-500">앱 기준 {slot.count}건</p>
                  {typeof slot.marketCount === 'number' && (
                    <p className="text-xs text-red-500">시장 기준 {slot.marketCount}건</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
