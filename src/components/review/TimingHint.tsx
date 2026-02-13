import React from 'react';
import { Link } from 'react-router-dom';

interface TimingHintProps {
    category: string;
    peakHours?: { hour: number; count: number }[];
}

// 업종 카테고리별 추천 시간대
const CATEGORY_TIMING: Record<string, { peak: string; description: string }> = {
    fashion: { peak: '20-22시', description: '패션은 저녁 여유 시간대에 반응이 좋아요' },
    ecommerce: { peak: '12-13시, 21-22시', description: '이커머스는 점심과 늦은 저녁이 효과적' },
    food: { peak: '11-12시, 17-18시', description: 'F&B는 식사 시간 직전이 최적' },
    travel: { peak: '12-14시, 21-23시', description: '여행은 점심시간과 취침 전 계획 시간대가 좋아요' },
    mobility: { peak: '7-9시, 17-19시', description: '모빌리티는 출퇴근 시간대에 반응이 좋아요' },
    finance: { peak: '9-10시, 18-20시', description: '금융은 출근 직후와 퇴근 후가 효과적' },
    content: { peak: '20-24시', description: '콘텐츠/엔터는 저녁~심야 사용 시간대가 강해요' },
    game: { peak: '18-24시', description: '게임은 퇴근 후 몰입 시간대 반응이 높아요' },
    education: { peak: '7-9시, 20-22시', description: '교육/자기계발은 출근 전과 저녁 학습 시간대가 좋아요' },
    health: { peak: '7-9시, 20-21시', description: '헬스/의료는 아침 루틴과 저녁 정리 시간대가 좋아요' },
    others: { peak: '10-12시, 19-21시', description: '일반적으로 오전과 퇴근 후가 효과적' },
};

export const TimingHint: React.FC<TimingHintProps> = ({ category, peakHours }) => {
    const timing = CATEGORY_TIMING[category] || CATEGORY_TIMING['ecommerce'];

    // peakHours가 있으면 실제 데이터 기반으로 표시
    const topHours = peakHours?.slice(0, 3) || [];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">발송 시간 힌트</h3>
            </div>

            <div className="space-y-3">
                {/* 추천 시간대 */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                        <p className="font-semibold text-gray-900">{timing.peak}</p>
                        <p className="text-xs text-gray-600">{timing.description}</p>
                    </div>
                </div>

                {/* 실제 데이터 기반 시간대 */}
                {topHours.length > 0 && (
                    <div className="pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-500 mb-2">이 카테고리 실제 발송 시간대</p>
                        <div className="flex gap-2">
                            {topHours.map(({ hour, count }) => (
                                <div
                                    key={hour}
                                    className="flex-1 bg-white rounded-lg p-2 text-center"
                                >
                                    <p className="text-sm font-bold text-gray-900">{hour}시</p>
                                    <p className="text-xs text-gray-500">{count}건</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timing 페이지 링크 */}
                <Link
                    to="/timing"
                    className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-blue-100 transition-colors"
                >
                    <span>상세 타이밍 분석 보기</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};
