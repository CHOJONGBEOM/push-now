import React from 'react';
import { Bell, ShoppingBag, MessageCircle, CreditCard, Package, Heart, Zap, Gift, TrendingUp, Music } from 'lucide-react';

interface Notification {
    app: string;
    icon: React.ReactNode;
    title: string;
    message: string;
    time: string;
    color: string;
}

interface PushFeedColumnProps {
    speed: 'slow' | 'fast';
    delay?: string;
}

// Diverse notification dataset
const notifications: Notification[] = [
    {
        app: '배달의민족',
        icon: <ShoppingBag className="w-5 h-5 text-white" />,
        title: '🍗 치킨 50% 할인',
        message: '오늘 밤 10시까지 전메뉴 반값!',
        time: '방금 전',
        color: '#2AC1BC'
    },
    {
        app: '쿠팡',
        icon: <Package className="w-5 h-5 text-white" />,
        title: '로켓배송 특가',
        message: '생수 1+1 무료배송 오늘만!',
        time: '1분 전',
        color: '#FF4458'
    },
    {
        app: '카카오톡',
        icon: <MessageCircle className="w-5 h-5 text-white" />,
        title: '김철수',
        message: '야 지금 어디야?',
        time: '2분 전',
        color: '#FEE500'
    },
    {
        app: '토스',
        icon: <CreditCard className="w-5 h-5 text-white" />,
        title: '100만원 입금',
        message: '김OO님으로부터 입금되었습니다',
        time: '3분 전',
        color: '#0064FF'
    },
    {
        app: 'Netflix',
        icon: <Music className="w-5 h-5 text-white" />,
        title: '새로운 시즌 공개',
        message: '오징어 게임 시즌2가 공개되었습니다',
        time: '5분 전',
        color: '#E50914'
    },
    {
        app: '무신사',
        icon: <Heart className="w-5 h-5 text-white" />,
        title: '찜한 상품 할인',
        message: '나이키 에어포스 15% 할인 중',
        time: '7분 전',
        color: '#000000'
    },
    {
        app: '네이버',
        icon: <Bell className="w-5 h-5 text-white" />,
        title: '긴급 뉴스',
        message: '서울 강남구에 폭우 특보',
        time: '10분 전',
        color: '#03C75A'
    },
    {
        app: '11번가',
        icon: <Gift className="w-5 h-5 text-white" />,
        title: '타임세일 시작',
        message: '에어팟 프로 30% 할인',
        time: '12분 전',
        color: '#FF0000'
    },
    {
        app: '당근마켓',
        icon: <Package className="w-5 h-5 text-white" />,
        title: '근처에 새 글',
        message: '맥북 프로 M3 급판매 300만원',
        time: '15분 전',
        color: '#FF6F0F'
    },
    {
        app: '요기요',
        icon: <ShoppingBag className="w-5 h-5 text-white" />,
        title: '첫 주문 50% 할인',
        message: '지금 주문하면 무료배달',
        time: '18분 전',
        color: '#FA0050'
    },
    {
        app: '인스타그램',
        icon: <Heart className="w-5 h-5 text-white" />,
        title: '이영희님이 좋아요',
        message: '회원님의 게시물을 좋아합니다',
        time: '20분 전',
        color: '#E4405F'
    },
    {
        app: '유튜브',
        icon: <Music className="w-5 h-5 text-white" />,
        title: '구독 채널 업로드',
        message: '침착맨: 새로운 영상이 올라왔습니다',
        time: '25분 전',
        color: '#FF0000'
    },
    {
        app: '배민1',
        icon: <ShoppingBag className="w-5 h-5 text-white" />,
        title: '족발 30% 할인',
        message: '오늘만 특가! 원할머니족발',
        time: '30분 전',
        color: '#2AC1BC'
    },
    {
        app: 'G마켓',
        icon: <TrendingUp className="w-5 h-5 text-white" />,
        title: '스마일배송 특가',
        message: 'AirPods 최저가 갱신!',
        time: '35분 전',
        color: '#00AB33'
    },
    {
        app: '직방',
        icon: <Bell className="w-5 h-5 text-white" />,
        title: '새로운 매물',
        message: '강남역 도보 5분 원룸',
        time: '40분 전',
        color: '#FF6B00'
    },
    {
        app: '번개장터',
        icon: <Zap className="w-5 h-5 text-white" />,
        title: '관심상품 가격인하',
        message: '아이폰 15 Pro 50만원 인하',
        time: '45분 전',
        color: '#FFB800'
    },
    {
        app: '배민2',
        icon: <ShoppingBag className="w-5 h-5 text-white" />,
        title: '피자 1+1',
        message: '도미노피자 전메뉴 1+1',
        time: '50분 전',
        color: '#2AC1BC'
    },
    {
        app: '쿠팡2',
        icon: <Package className="w-5 h-5 text-white" />,
        title: '로켓프레시 특가',
        message: '국내산 한우 30% 할인',
        time: '55분 전',
        color: '#FF4458'
    },
    {
        app: '카카오2',
        icon: <MessageCircle className="w-5 h-5 text-white" />,
        title: '박영희',
        message: '내일 몇시에 만날까?',
        time: '1시간 전',
        color: '#FEE500'
    },
    {
        app: '네이버페이',
        icon: <CreditCard className="w-5 h-5 text-white" />,
        title: '포인트 적립',
        message: '5,000 포인트가 적립되었습니다',
        time: '1시간 전',
        color: '#03C75A'
    }
];

// Simple notification card component
const NotificationCard: React.FC<{ notification: Notification; delay: number; burial: number }> = ({
    notification,
    delay,
    burial
}) => {
    // Calculate burial effects based on position
    const opacity = Math.max(0.15, 1 - burial * 0.15);
    const scale = Math.max(0.85, 1 - burial * 0.03);
    const blur = burial * 0.8;
    const translateY = burial * 8;

    return (
        <div
            className="notification-card relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-700"
            style={{
                animationDelay: `${delay}s`,
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                filter: `blur(${blur}px)`,
                marginBottom: burial > 0 ? '-40px' : '0'
            }}
        >
            {/* Card content */}
            <div className="flex items-start gap-3 p-4">
                {/* App icon */}
                <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: notification.color }}
                >
                    {notification.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                            {notification.app}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {notification.time}
                        </span>
                    </div>
                    <div className="font-bold text-gray-900 text-base mb-0.5 line-clamp-1">
                        {notification.title}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PushFeedColumn: React.FC<PushFeedColumnProps> = ({ speed, delay: columnDelay = '0s' }) => {
    // Create burst patterns for irregular timing
    // "파---파파팡--팡팡--" effect
    const createBurstPattern = (columnIndex: number) => {
        const patterns = [
            // Column 1: slow → burst(3) → pause → burst(5) → slow
            [0, 3, 3.3, 3.6, 7, 7.2, 7.4, 7.6, 7.8, 12],
            // Column 2: burst(2) → pause → slow → burst(4) → slow
            [0, 0.2, 4, 7, 10, 10.2, 10.4, 10.6, 15],
            // Column 3: pause → burst(4) → slow → slow → burst(3)
            [2, 4, 4.2, 4.4, 4.6, 8, 12, 15, 15.2, 15.4]
        ];

        return patterns[columnIndex % 3] || patterns[0];
    };

    const burstPattern = createBurstPattern(speed === 'slow' ? 0 : 1);

    // Shuffle notifications for variety
    const shuffledNotifications = [...notifications].sort(() => Math.random() - 0.5);

    // Map notifications to burst pattern delays
    const delayedNotifications = shuffledNotifications.slice(0, 10).map((notif, index) => ({
        ...notif,
        delay: burstPattern[index] || index * 2
    }));

    return (
        <div className="flex-1 relative" style={{ animationDelay: columnDelay }}>
            {/* Stacking container */}
            <div className="flex flex-col gap-0">
                {delayedNotifications.map((notif, index) => (
                    <NotificationCard
                        key={`${notif.app}-${index}`}
                        notification={notif}
                        delay={notif.delay}
                        burial={index} // Each subsequent notification buries previous ones
                    />
                ))}
            </div>
        </div>
    );
};
