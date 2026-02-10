import React from 'react';

interface AlgorithmInfo {
    title: string;
    emoji: string;
    algorithm: {
        name: string;
        formula?: string;
        description: string;
    };
    marketingInsight: string;
    useCase: string;
    example?: string;
}

const ALGORITHM_INFO: Record<string, AlgorithmInfo> = {
    bursting: {
        title: '급상승 키워드',
        emoji: '🔥',
        algorithm: {
            name: 'Burst Detection (급상승 감지)',
            formula: '증가율 = (최근N일 - 이전N일) / 이전N일 × 100',
            description: '최근 기간과 이전 기간의 키워드 출현 빈도를 비교하여 급격히 증가한 키워드를 탐지합니다. 시계열 데이터에서 이상치를 찾는 기법으로, 트위터 트렌드 등에서 널리 사용됩니다.',
        },
        marketingInsight: '시즌, 이벤트, 트렌드를 경쟁사보다 먼저 파악하여 마케팅 타이밍을 선점할 수 있습니다.',
        useCase: '발렌타인데이 1주일 전부터 "초콜릿", "선물" 키워드가 급상승하면, 관련 프로모션을 미리 준비할 수 있습니다.',
        example: '"발렌타인" +340%는 지난주 대비 3.4배 더 많이 사용되었음을 의미',
    },
    tfidf: {
        title: '차별화 키워드',
        emoji: '💎',
        algorithm: {
            name: 'TF-IDF (Term Frequency-Inverse Document Frequency)',
            formula: 'TF-IDF = TF(빈도) × log(전체앱수 / 해당키워드사용앱수)',
            description: '특정 앱에서 자주 사용되지만 다른 앱에서는 잘 사용되지 않는 "차별화된" 키워드를 찾습니다. 검색엔진, 문서 분류 등에서 핵심 알고리즘으로 사용됩니다.',
        },
        marketingInsight: '경쟁사만의 고유한 마케팅 전략과 타겟층을 파악할 수 있습니다.',
        useCase: '무신사가 "스트릿", 29CM이 "큐레이션"을 자주 사용한다면, 각 브랜드의 포지셔닝 전략을 알 수 있습니다.',
        example: 'Score가 높을수록 해당 앱만의 고유한 키워드',
    },
    top: {
        title: 'TOP 키워드',
        emoji: '📊',
        algorithm: {
            name: 'Term Frequency (단어 빈도)',
            description: '전체 메시지에서 가장 많이 등장한 키워드를 집계합니다. 가장 기본적이지만 전체 트렌드를 파악하는 데 효과적입니다.',
        },
        marketingInsight: '업계 전반에서 가장 많이 사용되는 마케팅 키워드를 파악하여 기본 전략을 수립할 수 있습니다.',
        useCase: '"할인", "무료배송"이 상위권이라면 가격 경쟁이 치열한 시장임을 알 수 있습니다.',
    },
    cooccurrence: {
        title: '연관 키워드',
        emoji: '🔗',
        algorithm: {
            name: 'Co-occurrence Analysis (동시 출현 분석)',
            description: '하나의 메시지에서 함께 등장하는 키워드 쌍을 분석합니다. 자연어 처리에서 단어 간 의미적 관계를 파악하는 기본 기법입니다.',
        },
        marketingInsight: '효과적인 키워드 조합과 메시지 구성 패턴을 발견할 수 있습니다.',
        useCase: '"할인"과 "무료배송"이 자주 함께 나타나면, 두 혜택을 결합한 프로모션이 효과적일 수 있습니다.',
    },
    keywordType: {
        title: '키워드 유형 분포',
        emoji: '🏷️',
        algorithm: {
            name: 'Keyword Classification (키워드 분류)',
            description: '마케팅 목적에 따라 키워드를 긴급성, 혜택, 행동유도, 신규/트렌드, 개인화로 분류합니다.',
        },
        marketingInsight: '경쟁사들이 어떤 마케팅 전략(FOMO, 가격, CTA 등)을 주로 사용하는지 파악할 수 있습니다.',
        useCase: '긴급성 키워드가 많다면 FOMO 전략이 주류, 혜택 키워드가 많다면 가격 경쟁 중심',
    },
    emoji: {
        title: '인기 이모지',
        emoji: '😀',
        algorithm: {
            name: 'Emoji Frequency Analysis',
            description: '푸시 메시지에서 사용된 이모지의 빈도를 분석합니다.',
        },
        marketingInsight: '시각적 어필에 효과적인 이모지 패턴을 파악하여 메시지 개선에 활용할 수 있습니다.',
        useCase: '🔥, ✨가 자주 사용된다면 트렌드/신상품 강조가 효과적일 수 있습니다.',
    },
};

interface AlgorithmInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    algorithmKey: keyof typeof ALGORITHM_INFO;
}

export const AlgorithmInfoModal: React.FC<AlgorithmInfoModalProps> = ({
    isOpen,
    onClose,
    algorithmKey,
}) => {
    if (!isOpen) return null;

    const info = ALGORITHM_INFO[algorithmKey];
    if (!info) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 백드롭 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 모달 */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* 헤더 */}
                <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{info.emoji}</span>
                            <h2 className="text-xl font-bold text-white">{info.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 콘텐츠 */}
                <div className="p-6 space-y-5">
                    {/* 알고리즘 */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📊</span>
                            <h3 className="font-semibold text-gray-900">사용 알고리즘</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="font-medium text-gray-800 mb-1">{info.algorithm.name}</p>
                            {info.algorithm.formula && (
                                <code className="block bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm mb-2 font-mono">
                                    {info.algorithm.formula}
                                </code>
                            )}
                            <p className="text-sm text-gray-600">{info.algorithm.description}</p>
                        </div>
                    </div>

                    {/* 마케팅 인사이트 */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🎯</span>
                            <h3 className="font-semibold text-gray-900">마케팅 활용</h3>
                        </div>
                        <p className="text-gray-600 bg-blue-50 rounded-xl p-4">
                            {info.marketingInsight}
                        </p>
                    </div>

                    {/* 실제 사례 */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">💡</span>
                            <h3 className="font-semibold text-gray-900">실제 사례</h3>
                        </div>
                        <p className="text-gray-600 bg-green-50 rounded-xl p-4">
                            {info.useCase}
                        </p>
                    </div>

                    {/* 예시 */}
                    {info.example && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <p className="text-sm text-amber-800">
                                <span className="font-medium">TIP:</span> {info.example}
                            </p>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export { ALGORITHM_INFO };
