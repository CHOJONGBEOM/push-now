import React from 'react';

interface EmojiSuggestionsProps {
    category: string;
    keywords: string[];
    onSelect: (emoji: string) => void;
}

// 카테고리별 추천 이모지
const CATEGORY_EMOJIS: Record<string, string[]> = {
    promo: ['🔥', '💥', '🎉', '✨', '💰', '🏷️', '🎁', '💸', '⚡', '🌟'],
    product: ['✨', '🆕', '💎', '👑', '🌸', '💫', '🎀', '💝', '🌈', '⭐'],
    retention: ['💝', '👋', '🛒', '💭', '🔔', '⏰', '💕', '🎯', '📢', '💌'],
    fnb: ['🍔', '🍕', '🍜', '🍣', '🍱', '☕', '🧋', '🍰', '🍗', '🥗'],
    fashion: ['👗', '👠', '👜', '💄', '🧥', '👔', '👟', '🎽', '👒', '💍'],
    ecommerce: ['🛒', '📦', '🛍️', '💳', '🏪', '🎁', '💰', '✅', '🚀', '📱'],
    travel: ['✈️', '🏨', '🌴', '🗺️', '🧳', '🏖️', '⛱️', '🌍', '🚗', '🎫'],
};

// 키워드별 추천 이모지
const KEYWORD_EMOJIS: Record<string, string[]> = {
    '할인': ['💰', '🏷️', '💸', '🔥'],
    '무료': ['🆓', '🎁', '✨', '💝'],
    '한정': ['⏰', '⚡', '🔥', '⏳'],
    '신상': ['🆕', '✨', '💫', '🌟'],
    '베스트': ['👑', '🏆', '⭐', '💯'],
    '추천': ['👍', '💡', '✅', '🎯'],
    '마감': ['⏰', '🔔', '⚠️', '⏳'],
    '특가': ['💥', '🔥', '💰', '⚡'],
    '선착순': ['🏃', '⚡', '🎯', '⏰'],
    '쿠폰': ['🎟️', '🏷️', '💳', '🎁'],
    '포인트': ['💎', '⭐', '🎯', '💰'],
    '배송': ['📦', '🚚', '✈️', '🏃'],
    '오늘': ['📅', '⏰', '🌅', '✨'],
    '지금': ['⚡', '🔥', '⏰', '🚀'],
};

export const EmojiSuggestions: React.FC<EmojiSuggestionsProps> = ({
    category,
    keywords,
    onSelect
}) => {
    // 카테고리 기반 이모지
    const categoryEmojis = CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS['ecommerce'];

    // 키워드 기반 이모지 수집
    const keywordEmojis = new Set<string>();
    keywords.forEach(keyword => {
        const matchedKeyword = Object.keys(KEYWORD_EMOJIS).find(k =>
            keyword.includes(k) || k.includes(keyword)
        );
        if (matchedKeyword) {
            KEYWORD_EMOJIS[matchedKeyword].forEach(e => keywordEmojis.add(e));
        }
    });

    const keywordEmojiArray = Array.from(keywordEmojis).slice(0, 8);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">추천 이모지</h3>

            {/* 키워드 기반 추천 */}
            {keywordEmojiArray.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">키워드 기반</p>
                    <div className="flex flex-wrap gap-2">
                        {keywordEmojiArray.map((emoji, idx) => (
                            <button
                                key={`kw-${idx}`}
                                onClick={() => onSelect(emoji)}
                                className="w-10 h-10 flex items-center justify-center text-xl bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 카테고리 기반 추천 */}
            <div>
                <p className="text-xs text-gray-500 mb-2">카테고리 기반</p>
                <div className="flex flex-wrap gap-2">
                    {categoryEmojis.map((emoji, idx) => (
                        <button
                            key={`cat-${idx}`}
                            onClick={() => onSelect(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-xl bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* 자주 쓰는 이모지 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">자주 쓰는 이모지</p>
                <div className="flex flex-wrap gap-2">
                    {['🔥', '✨', '💰', '🎁', '⚡', '💥', '👍', '❤️'].map((emoji, idx) => (
                        <button
                            key={`pop-${idx}`}
                            onClick={() => onSelect(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-xl bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
