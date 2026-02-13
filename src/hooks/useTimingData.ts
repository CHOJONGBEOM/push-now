import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/supabase';

export interface HeatmapCell {
  dayOfWeek: number; // 0=월 ... 6=일
  hour: number; // 0-23
  count: number;
  density: 'low' | 'medium' | 'high' | 'peak';
}

export interface GoldenHour {
  dayOfWeek: number;
  dayName: string;
  hour: number;
  hourRange: string;
  count: number;
  // 추천 슬롯: 평균 대비 낮은 정도, 회피 슬롯: 평균 대비 높은 정도
  percentageBelowAvg: number;
  appLiftPercent?: number;
  marketCount?: number;
  marketLiftPercent?: number;
  pressureScore?: number;
  reason?: string;
}

export interface TimingData {
  heatmapData: HeatmapCell[];
  dayOfWeekData: { dayOfWeek: number; dayName: string; count: number }[];
  goldenHours: GoldenHour[];
  avoidTimes: GoldenHour[];
  avoidTime: GoldenHour | null; // backward compatibility
  totalCount: number;
  avgPerSlot: number;
  isLoading: boolean;
  error: string | null;
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];
// DB day: 0=일..6=토 -> UI day: 0=월..6=일
const DAY_INDEX_MAP: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

const START_HOUR = 6;
const END_HOUR = 24; // exclusive

const HOUR_RANGES = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
  const hour = START_HOUR + i;
  return {
    start: hour,
    end: hour + 1,
    label: `${hour}시`,
  };
});

export interface TimingDataOptions {
  days?: number;
  appNames?: string[];
  startDate?: Date;
  endDate?: Date;
}

const getPercentile = (sortedAsc: number[], p: number) => {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];

  const index = (p / 100) * (sortedAsc.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sortedAsc[lower];

  const ratio = index - lower;
  return sortedAsc[lower] + (sortedAsc[upper] - sortedAsc[lower]) * ratio;
};

const toKstDayHour = (isoDate: string) => {
  const utc = new Date(isoDate);
  const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  return { dayOfWeek: kst.getUTCDay(), hour: kst.getUTCHours() };
};

const aggregateByDayAndHour = (messages: { posted_at: string | null }[]) => {
  const counts: Record<string, number> = {};

  messages.forEach((msg) => {
    if (!msg.posted_at) return;

    const { dayOfWeek, hour } = toKstDayHour(msg.posted_at);
    if (hour < START_HOUR || hour >= END_HOUR) return;

    const key = `${dayOfWeek}-${hour}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).map(([key, count]) => {
    const [day_of_week, hour] = key.split('-').map(Number);
    return { day_of_week, hour, count };
  });
};

export const useTimingData = (options: TimingDataOptions = {}): TimingData => {
  const { days = 30, appNames = [], startDate, endDate } = options;

  const [rawData, setRawData] = useState<{ day_of_week: number; hour: number; count: number }[]>([]);
  const [marketRawData, setMarketRawData] = useState<{ day_of_week: number; hour: number; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let fromDate: Date;
        let toDate: Date;

        if (startDate && endDate) {
          fromDate = new Date(startDate);
          fromDate.setHours(0, 0, 0, 0);

          toDate = new Date(endDate);
          toDate.setHours(23, 59, 59, 999);
        } else {
          toDate = new Date();
          fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        }

        const { data, error: fetchError } = await supabase
          .from('push_messages')
          .select('posted_at, app_name')
          .or('is_hidden.is.null,is_hidden.eq.false')
          .gte('posted_at', fromDate.toISOString())
          .lte('posted_at', toDate.toISOString());

        if (fetchError) throw fetchError;

        const allMessages = data || [];
        const filteredMessages =
          appNames.length > 0
            ? allMessages.filter((msg) => msg.app_name && appNames.includes(msg.app_name))
            : allMessages;

        setRawData(aggregateByDayAndHour(filteredMessages));
        setMarketRawData(aggregateByDayAndHour(allMessages));
      } catch (err) {
        console.error('Error fetching timing data:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days, appNames.join(','), startDate?.toISOString(), endDate?.toISOString()]);

  const heatmapData = useMemo<HeatmapCell[]>(() => {
    const grouped: Record<string, number> = {};

    for (let day = 0; day < 7; day++) {
      for (const range of HOUR_RANGES) {
        grouped[`${day}-${range.start}`] = 0;
      }
    }

    rawData.forEach((item) => {
      if (item.hour < START_HOUR || item.hour >= END_HOUR) return;
      const displayDay = DAY_INDEX_MAP[item.day_of_week];
      const key = `${displayDay}-${item.hour}`;
      grouped[key] = (grouped[key] || 0) + item.count;
    });

    const allCounts = Object.values(grouped);
    const activeCounts = allCounts.filter((c) => c > 0).sort((a, b) => a - b);

    const p33 = getPercentile(activeCounts, 33);
    const p66 = getPercentile(activeCounts, 66);
    const p90 = getPercentile(activeCounts, 90);

    return Object.entries(grouped).map(([key, count]) => {
      const [day, hour] = key.split('-').map(Number);

      let density: 'low' | 'medium' | 'high' | 'peak' = 'low';
      if (count > 0) {
        if (count >= p90) density = 'peak';
        else if (count >= p66) density = 'high';
        else if (count >= p33) density = 'medium';
      }

      return { dayOfWeek: day, hour, count, density };
    });
  }, [rawData]);

  const dayOfWeekData = useMemo(() => {
    const grouped: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    rawData.forEach((item) => {
      if (item.hour < START_HOUR || item.hour >= END_HOUR) return;
      const displayDay = DAY_INDEX_MAP[item.day_of_week];
      grouped[displayDay] = (grouped[displayDay] || 0) + item.count;
    });

    return Object.entries(grouped).map(([day, count]) => ({
      dayOfWeek: Number(day),
      dayName: DAY_NAMES[Number(day)],
      count,
    }));
  }, [rawData]);

  const { goldenHours, avoidTimes, avoidTime } = useMemo(() => {
    if (heatmapData.length === 0) {
      return { goldenHours: [], avoidTimes: [], avoidTime: null };
    }

    const activeCells = heatmapData.filter((cell) => cell.count > 0);
    if (activeCells.length === 0) {
      return { goldenHours: [], avoidTimes: [], avoidTime: null };
    }

    const counts = activeCells.map((cell) => cell.count).sort((a, b) => a - b);
    const minCount = counts[0];
    const maxCount = counts[counts.length - 1];
    const avgActive = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const p50 = getPercentile(counts, 50);
    const p75 = getPercentile(counts, 75);
    const minReliableCount = Math.max(1, Math.floor(p50 * 0.4));

    const marketMap = new Map<string, number>();
    for (const item of marketRawData) {
      if (item.hour < START_HOUR || item.hour >= END_HOUR) continue;
      const displayDay = DAY_INDEX_MAP[item.day_of_week];
      marketMap.set(`${displayDay}-${item.hour}`, item.count);
    }

    const marketCounts = Array.from(marketMap.values()).filter((count) => count > 0).sort((a, b) => a - b);
    const marketAvg = marketCounts.length > 0
      ? marketCounts.reduce((sum, count) => sum + count, 0) / marketCounts.length
      : 0;

    const slots = heatmapData.map((cell) => {
      const marketCount = marketMap.get(`${cell.dayOfWeek}-${cell.hour}`) || 0;
      const marketLiftPercent = marketAvg > 0
        ? Math.round(((marketCount - marketAvg) / marketAvg) * 100)
        : 0;

      const selectedRatio = avgActive > 0 ? cell.count / avgActive : 0;
      const marketRatio = marketAvg > 0 ? marketCount / marketAvg : 0;
      const combinedPressure = selectedRatio * 0.7 + marketRatio * 0.3;

      const lowCompetitionScore =
        maxCount === minCount ? 0.5 : (maxCount - cell.count) / (maxCount - minCount);
      const reliabilityScore = p75 > 0 ? Math.min(cell.count / p75, 1) : 1;
      const marketBonus = marketRatio < 1 ? (1 - marketRatio) * 0.15 : 0;
      const recommendationScore = lowCompetitionScore * 0.65 + reliabilityScore * 0.25 + marketBonus;

      const belowAvgPercent =
        avgActive > 0 ? Math.max(0, Math.round(((avgActive - cell.count) / avgActive) * 100)) : 0;

      return {
        dayOfWeek: cell.dayOfWeek,
        dayName: DAY_NAMES[cell.dayOfWeek],
        hour: cell.hour,
        hourRange: HOUR_RANGES.find((range) => range.start === cell.hour)?.label || `${cell.hour}시`,
        count: cell.count,
        percentageBelowAvg: belowAvgPercent,
        marketCount,
        marketLiftPercent,
        combinedPressure,
        recommendationScore,
      };
    });

    const activeSlots = slots.filter((slot) => slot.count > 0);

    const scoreSorted = [...activeSlots].sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      return a.count - b.count;
    });

    const reliableSlots = scoreSorted.filter((slot) => slot.count >= minReliableCount);
    const candidates = reliableSlots.length > 0 ? reliableSlots : scoreSorted;

    const selected: typeof candidates = [];

    const isPicked = (slot: (typeof candidates)[number]) =>
      selected.some((picked) => picked.dayOfWeek === slot.dayOfWeek && picked.hour === slot.hour);

    const canPick = (
      slot: (typeof candidates)[number],
      options: { uniqueDay: boolean; avoidAdjacentHourSameDay: boolean },
    ) => {
      if (isPicked(slot)) return false;
      if (options.uniqueDay && selected.some((picked) => picked.dayOfWeek === slot.dayOfWeek)) {
        return false;
      }
      if (
        options.avoidAdjacentHourSameDay &&
        selected.some((picked) => picked.dayOfWeek === slot.dayOfWeek && Math.abs(picked.hour - slot.hour) <= 1)
      ) {
        return false;
      }
      return true;
    };

    for (const slot of candidates) {
      if (selected.length >= 3) break;
      if (canPick(slot, { uniqueDay: true, avoidAdjacentHourSameDay: true })) {
        selected.push(slot);
      }
    }

    if (selected.length < 3) {
      for (const slot of candidates) {
        if (selected.length >= 3) break;
        if (canPick(slot, { uniqueDay: false, avoidAdjacentHourSameDay: true })) {
          selected.push(slot);
        }
      }
    }

    if (selected.length < 3) {
      for (const slot of candidates) {
        if (selected.length >= 3) break;
        if (!isPicked(slot)) {
          selected.push(slot);
        }
      }
    }

    const golden = selected.map(({ recommendationScore, combinedPressure, ...slot }) => slot);

    const sortedAvoid = [...slots].sort((a, b) => {
      if (b.combinedPressure !== a.combinedPressure) {
        return b.combinedPressure - a.combinedPressure;
      }
      if (b.count !== a.count) return b.count - a.count;
      return (b.marketCount || 0) - (a.marketCount || 0);
    });

    const avoidSelected: typeof sortedAvoid = [];
    const topAvoidScore = sortedAvoid[0]?.combinedPressure ?? 0;
    const tieBand = 0.03;

    const isAvoidNearDuplicate = (candidate: (typeof sortedAvoid)[number]) =>
      avoidSelected.some(
        (picked) => picked.dayOfWeek === candidate.dayOfWeek && Math.abs(picked.hour - candidate.hour) <= 1,
      );

    for (const slot of sortedAvoid) {
      const isTieLike = Math.abs(slot.combinedPressure - topAvoidScore) <= tieBand;
      if (!isTieLike) continue;
      if (isAvoidNearDuplicate(slot)) continue;
      avoidSelected.push(slot);
      if (avoidSelected.length >= 3) break;
    }

    if (avoidSelected.length < 3) {
      for (const slot of sortedAvoid) {
        if (avoidSelected.length >= 3) break;
        if (avoidSelected.some((picked) => picked.dayOfWeek === slot.dayOfWeek && picked.hour === slot.hour)) {
          continue;
        }
        if (isAvoidNearDuplicate(slot)) continue;
        avoidSelected.push(slot);
      }
    }

    const avoids: GoldenHour[] = avoidSelected.map((slot) => {
      const aboveAvgPercent =
        avgActive > 0 ? Math.max(0, Math.round(((slot.count - avgActive) / avgActive) * 100)) : 0;

      let reason = '경쟁 밀도가 높은 시간대';
      if ((slot.marketLiftPercent || 0) >= 30 && aboveAvgPercent >= 20) {
        reason = '앱/시장 모두 혼잡한 시간대';
      } else if ((slot.marketLiftPercent || 0) >= 30) {
        reason = '시장 전체 발송 밀도가 높은 시간대';
      } else if (aboveAvgPercent >= 30) {
        reason = '해당 앱 발송이 몰리는 시간대';
      }

      return {
        dayOfWeek: slot.dayOfWeek,
        dayName: slot.dayName,
        hour: slot.hour,
        hourRange: slot.hourRange,
        count: slot.count,
        percentageBelowAvg: aboveAvgPercent,
        appLiftPercent: aboveAvgPercent,
        marketCount: slot.marketCount,
        marketLiftPercent: slot.marketLiftPercent,
        pressureScore: Math.round(slot.combinedPressure * 100),
        reason,
      };
    });

    return {
      goldenHours: golden,
      avoidTimes: avoids,
      avoidTime: avoids[0] || null,
    };
  }, [heatmapData, marketRawData]);

  const totalCount = rawData.reduce((sum, item) => sum + item.count, 0);
  const avgPerSlot = heatmapData.length > 0 ? totalCount / heatmapData.length : 0;

  return {
    heatmapData,
    dayOfWeekData,
    goldenHours,
    avoidTimes,
    avoidTime,
    totalCount,
    avgPerSlot,
    isLoading,
    error,
  };
};
