import React, { useEffect, useMemo, useState } from 'react';
import { calculateEmojiFrequency } from '../../utils/keywordExtractor';

interface EmojiSuggestionsProps {
    category: string;
    keywords: string[];
    onSelect: (emoji: string) => void;
    referenceMessages?: Array<{ title: string | null; body: string | null }>;
}

const CATEGORY_EMOJIS: Record<string, string[]> = {
    fashion: ['👗', '👚', '👖', '👠', '👡', '👢', '🧥', '🧣', '🧤', '👜', '🎒', '👛', '💄', '💋', '🧴', '🧼', '🪞', '🕶️', '⌚', '💍', '📿', '🧢', '👒', '🎀', '🧵', '🪡', '✨', '💎', '🩷', '🖤', '🤍', '🩶', '🌸', '🛍️', '🪄', '🧿'],
    ecommerce: ['🛒', '🛍️', '📦', '🎁', '🏷️', '💸', '💳', '🧾', '🚚', '📬', '🧰', '🧺', '🪑', '🛏️', '🧴', '🧻', '🪥', '🧹', '🧽', '🔌', '💡', '🕯️', '🧯', '🪴', '🍽️', '☕', '🥤', '🍪', '🧃', '📱', '💻', '⌚', '📺', '🎧', '🧸', '🪙'],
    food: ['🍔', '🍟', '🍕', '🌮', '🌯', '🍜', '🍣', '🍱', '🍛', '🍚', '🍙', '🍤', '🥗', '🥙', '🥪', '🌭', '🍗', '🥩', '🥟', '🍲', '🍝', '🍰', '🧁', '🍩', '🍪', '🍫', '🍦', '🍨', '🥤', '🧋', '☕', '🍵', '🥛', '🍺', '🍷', '🥂'],
    travel: ['✈️', '🛫', '🛬', '🧳', '🏨', '🗺️', '📍', '🧭', '🏝️', '🏖️', '🏔️', '🏞️', '🌆', '🌃', '🌅', '🌉', '🚆', '🚄', '🚅', '🚇', '🚊', '🚌', '🚍', '🚢', '⛴️', '🚤', '🛳️', '🚁', '🚲', '🏕️', '🎒', '📸', '🎫', '🪪', '💺', '🛂'],
    mobility: ['🚕', '🚗', '🚙', '🛻', '🚐', '🚚', '🚛', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚎', '🚌', '🚇', '🚆', '🚉', '🚦', '🛣️', '🅿️', '⛽', '🔋', '🧭', '📍', '🗺️', '⌚', '📱', '🎫', '🪪', '🚏', '🔧', '🧰', '🧯', '🧼', '🌧️', '☀️'],
    finance: ['💰', '💸', '💳', '🏦', '📈', '📉', '🧾', '🪙', '💵', '💴', '💶', '💷', '🤑', '🧮', '📊', '📋', '🧠', '🔐', '🔒', '✅', '⚠️', '📌', '📎', '💡', '⏰', '📅', '🗂️', '🧷', '🏧', '💹', '🛡️', '🔎', '🧭', '🤝', '📨', '📝'],
    others: ['📱', '🔔', '📣', '📝', '📌', '✅', '⚡', '🔥', '✨', '🎯', '💡', '🧩', '🧠', '🔍', '📊', '📈', '📉', '🗓️', '⏰', '⌛', '🚀', '🎉', '🎊', '🥳', '🤝', '🙌', '👏', '👍', '👀', '💬', '📎', '🧷', '🛠️', '🧪', '🧭', '🪄'],
};

const CATEGORY_POPULAR_FALLBACK: Record<string, string[]> = {
    fashion: ['✨', '💎', '👗', '🛍️', '💄', '🎀', '🖤', '🤍', '🌸', '👠', '👜', '⌚'],
    ecommerce: ['🛒', '📦', '🎁', '💸', '🏷️', '🚚', '✨', '🔥', '💳', '🛍️', '⏰', '🎉'],
    food: ['🍔', '🍕', '🍣', '🍜', '☕', '🧋', '🥤', '🍰', '🍪', '🔥', '✨', '🥂'],
    travel: ['✈️', '🧳', '🗺️', '📍', '🏝️', '📸', '🚆', '🏨', '🌅', '🎫', '⏰', '✨'],
    mobility: ['🚕', '🚗', '🛵', '🚇', '📍', '🧭', '⏰', '⚡', '🔋', '🚦', '☀️', '🌧️'],
    finance: ['💰', '💸', '💳', '📈', '📊', '🏦', '✅', '🔐', '⏰', '💡', '🧠', '🛡️'],
    others: ['🔥', '✨', '⚡', '🎯', '💡', '🚀', '🎉', '✅', '📌', '🔔', '👀', '💬'],
};

// Keep Review category coverage aligned with Generate categories.
CATEGORY_EMOJIS.content = [...(CATEGORY_EMOJIS.content || CATEGORY_EMOJIS.ecommerce || CATEGORY_EMOJIS.others)];
CATEGORY_EMOJIS.game = [...(CATEGORY_EMOJIS.game || CATEGORY_EMOJIS.others || CATEGORY_EMOJIS.ecommerce)];
CATEGORY_EMOJIS.education = [...(CATEGORY_EMOJIS.education || CATEGORY_EMOJIS.others || CATEGORY_EMOJIS.ecommerce)];
CATEGORY_EMOJIS.health = [...(CATEGORY_EMOJIS.health || CATEGORY_EMOJIS.others || CATEGORY_EMOJIS.ecommerce)];

CATEGORY_POPULAR_FALLBACK.content = [...(CATEGORY_POPULAR_FALLBACK.content || CATEGORY_POPULAR_FALLBACK.others)];
CATEGORY_POPULAR_FALLBACK.game = [...(CATEGORY_POPULAR_FALLBACK.game || CATEGORY_POPULAR_FALLBACK.others)];
CATEGORY_POPULAR_FALLBACK.education = [...(CATEGORY_POPULAR_FALLBACK.education || CATEGORY_POPULAR_FALLBACK.others)];
CATEGORY_POPULAR_FALLBACK.health = [...(CATEGORY_POPULAR_FALLBACK.health || CATEGORY_POPULAR_FALLBACK.others)];

const KEYWORD_EMOJIS: Record<string, string[]> = {
    할인: ['💸', '🏷️', '🔥', '🛒'],
    특가: ['💥', '⚡', '💸', '🎯'],
    쿠폰: ['🎟️', '💳', '💸', '🎁'],
    무료: ['🆓', '🎁', '💝', '✨'],
    적립: ['🪙', '💰', '📈', '💳'],
    혜택: ['🎁', '💝', '✨', '💎'],
    마감: ['⏰', '🚨', '⚠️', '🔥'],
    오늘: ['📅', '⏰', '☀️', '✨'],
    지금: ['⚡', '⏱️', '🔥', '👉'],
    신규: ['🆕', '✨', '🎉', '🚀'],
    오픈: ['🎊', '🚀', '✨', '📣'],
    출시: ['🆕', '🎉', '✨', '📦'],
    예약: ['🗓️', '📌', '✅', '⏰'],
    배송: ['🚚', '📦', '📬', '✅'],
    인기: ['🔥', '👀', '👏', '💯'],
    베스트: ['🏆', '🥇', '🔥', '⭐'],
    추천: ['👍', '💡', '🎯', '✨'],
    단독: ['🔒', '💎', '✨', '🎁'],
    한정: ['🔐', '⏳', '💥', '🔥'],
    마지막: ['🚨', '⏰', '⚠️', '🔥'],
    리마인드: ['🔔', '💬', '📌', '⏰'],
    장바구니: ['🛒', '📦', '💳', '👀'],
    복귀: ['🔁', '🙌', '🎉', '💝'],
    결제: ['💳', '✅', '🧾', '🔐'],
    출발: ['🚀', '✈️', '🧳', '📍'],
    여행: ['✈️', '🏝️', '📸', '🧳'],
    식사: ['🍽️', '🍔', '🥗', '☕'],
    주문: ['🛒', '📦', '✅', '🚚'],
    금융: ['💰', '📈', '💳', '🏦'],
    투자: ['📈', '📊', '💹', '🧠'],
    출석: ['📅', '✅', '🏁', '🎯'],
    미션: ['🎯', '🚀', '🏆', '🔥'],
    이벤트: ['🎉', '🎊', '🎁', '✨'],
};

function unique(items: string[]): string[] {
    const seen = new Set<string>();
    const output: string[] = [];
    for (const item of items) {
        if (!item || seen.has(item)) continue;
        seen.add(item);
        output.push(item);
    }
    return output;
}

export const EmojiSuggestions: React.FC<EmojiSuggestionsProps> = ({
    category,
    keywords,
    onSelect,
    referenceMessages = [],
}) => {
    const [showAllCategoryEmojis, setShowAllCategoryEmojis] = useState(false);

    useEffect(() => {
        setShowAllCategoryEmojis(false);
    }, [category]);

    const keywordEmojiArray = useMemo(() => {
        const matched: string[] = [];
        const loweredKeywords = keywords.map((k) => k.toLowerCase());

        for (const keyword of loweredKeywords) {
            for (const [token, emojis] of Object.entries(KEYWORD_EMOJIS)) {
                const loweredToken = token.toLowerCase();
                if (keyword.includes(loweredToken) || loweredToken.includes(keyword)) {
                    matched.push(...emojis);
                }
            }
        }

        return unique(matched).slice(0, 12);
    }, [keywords]);

    const categoryEmojiArray = useMemo(() => {
        const base = CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.ecommerce;
        const keywordSet = new Set(keywordEmojiArray);
        return base.filter((emoji) => !keywordSet.has(emoji));
    }, [category, keywordEmojiArray]);

    const popularEmojiArray = useMemo(() => {
        const texts = referenceMessages.map((message) => ({
            title: message.title,
            body: message.body,
        }));

        const fromData = [...calculateEmojiFrequency(texts).entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([emoji]) => emoji);

        const fallback = CATEGORY_POPULAR_FALLBACK[category] || CATEGORY_POPULAR_FALLBACK.others;
        return unique([...fromData, ...fallback]).slice(0, 12);
    }, [category, referenceMessages]);

    const visibleCategoryEmojis = showAllCategoryEmojis
        ? categoryEmojiArray.slice(0, 36)
        : categoryEmojiArray.slice(0, 18);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">추천 이모지</h3>

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

            <div>
                <p className="text-xs text-gray-500 mb-2">카테고리 기반</p>
                <div className="flex flex-wrap gap-2">
                    {visibleCategoryEmojis.map((emoji, idx) => (
                        <button
                            key={`cat-${idx}`}
                            onClick={() => onSelect(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-xl bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                {categoryEmojiArray.length > 18 && (
                    <button
                        onClick={() => setShowAllCategoryEmojis((prev) => !prev)}
                        className="mt-3 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {showAllCategoryEmojis ? '접기' : `더 보기 (+${Math.min(18, categoryEmojiArray.length - 18)})`}
                    </button>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">자주 쓰는 이모지</p>
                    <span className="text-[11px] text-gray-400">실데이터 기반</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {popularEmojiArray.map((emoji, idx) => (
                        <button
                            key={`pop-${idx}`}
                            onClick={() => onSelect(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-xl bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
