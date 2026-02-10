import React from 'react';

interface PushCard {
    app: string;
    category: string;
    icon?: string;
    type: 'notification' | 'phone' | 'card';
}

interface PushFeedColumnProps {
    speed: 'slow' | 'fast';
    delay?: string;
}

const sampleCards: PushCard[] = [
    { app: '쿠팡', category: '🔥 오늘만 특가', type: 'notification' },
    { app: '배달의민족', category: '점심 특가 시작', type: 'phone' },
    { app: '토스', category: '이체 완료', type: 'notification' },
    { app: '무신사', category: '신상 입고', type: 'card' },
    { app: '카카오톡', category: '새 메시지', type: 'notification' },
    { app: '마켓컬리', category: '샛별배송 출발', type: 'phone' },
];

const NotificationCard: React.FC<{ card: PushCard }> = ({ card }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EDEDF0] p-5">
        <div className="flex items-center gap-3 mb-4">
            <div className="size-8 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {card.app[0]}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {card.app}
                </span>
                <span className="text-[9px] text-[#6E6E73]">{card.category}</span>
            </div>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 rounded-full mb-2"></div>
        <div className="h-1.5 w-2/3 bg-zinc-50 rounded-full"></div>
    </div>
);

const PhoneCard: React.FC<{ card: PushCard }> = ({ card }) => (
    <div className="bg-white rounded-3xl shadow-md border border-[#EDEDF0] aspect-[9/16] overflow-hidden">
        <div className="h-full w-full bg-zinc-50 p-5 flex flex-col">
            <div className="w-full aspect-square bg-zinc-200 rounded-2xl mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 w-full bg-zinc-300/50 rounded-lg"></div>
                <div className="h-4 w-3/4 bg-zinc-300/50 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const CardPreview: React.FC<{ card: PushCard }> = ({ card }) => (
    <div className="bg-white rounded-3xl shadow-md border border-[#EDEDF0] aspect-[3/4] overflow-hidden">
        <div className="h-full w-full bg-zinc-100 p-6 flex flex-col justify-end">
            <div className="size-10 bg-white rounded-xl shadow-sm mb-4"></div>
            <div className="h-3 w-full bg-zinc-300 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-zinc-300 rounded"></div>
        </div>
    </div>
);

export const PushFeedColumn: React.FC<PushFeedColumnProps> = ({
    speed,
    delay = '0s',
}) => {
    const animationClass = speed === 'slow' ? 'animate-roll-slow' : 'animate-roll-fast';

    return (
        <div className="flex-1 flex flex-col gap-4" style={{ animationDelay: delay }}>
            <div className={`flex flex-col gap-4 ${animationClass}`}>
                {/* 첫 번째 세트 */}
                <div className="flex flex-col gap-4">
                    {sampleCards.map((card, index) => (
                        <React.Fragment key={`first-${index}`}>
                            {card.type === 'notification' && <NotificationCard card={card} />}
                            {card.type === 'phone' && <PhoneCard card={card} />}
                            {card.type === 'card' && <CardPreview card={card} />}
                        </React.Fragment>
                    ))}
                </div>
                {/* 두 번째 세트 (무한 루프용) */}
                <div className="flex flex-col gap-4">
                    {sampleCards.map((card, index) => (
                        <React.Fragment key={`second-${index}`}>
                            {card.type === 'notification' && <NotificationCard card={card} />}
                            {card.type === 'phone' && <PhoneCard card={card} />}
                            {card.type === 'card' && <CardPreview card={card} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};
