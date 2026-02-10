import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { PushPreview } from '../components/review/PushPreview';
import { EmojiSuggestions } from '../components/review/EmojiSuggestions';
import { SimilarMessages } from '../components/review/SimilarMessages';
import { TimingHint } from '../components/review/TimingHint';
import { useSimilarMessages, extractKeywords } from '../hooks/useSimilarMessages';
import { MESSAGE_CATEGORIES } from '../types/push-message';

type TabType = 'single' | 'compare';
type FocusedField = 'title' | 'body' | 'titleB' | 'bodyB';

export const Review: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('single');

    // 단일 메시지 입력
    const [appName, setAppName] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('promo');

    // A/B 비교용 두 번째 메시지
    const [titleB, setTitleB] = useState('');
    const [bodyB, setBodyB] = useState('');

    // 현재 포커스된 필드 추적
    const [focusedField, setFocusedField] = useState<FocusedField>('title');

    // 유사 메시지 검색
    const { messages: similarMessages, loading: searchLoading, search } = useSimilarMessages();

    // 키워드 추출
    const keywords = extractKeywords(`${title} ${body}`);

    // 디바운스된 검색
    useEffect(() => {
        const timer = setTimeout(() => {
            const searchQuery = `${title} ${body}`.trim();
            if (searchQuery.length >= 2) {
                search(searchQuery, category);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [title, body, category, search]);

    // 이모지 선택 핸들러 - 현재 포커스된 필드에 추가
    const handleEmojiSelect = useCallback((emoji: string) => {
        switch (focusedField) {
            case 'title':
                setTitle(prev => prev + emoji);
                break;
            case 'body':
                setBody(prev => prev + emoji);
                break;
            case 'titleB':
                setTitleB(prev => prev + emoji);
                break;
            case 'bodyB':
                setBodyB(prev => prev + emoji);
                break;
        }
    }, [focusedField]);

    // 입력 초기화
    const handleClear = () => {
        setAppName('');
        setTitle('');
        setBody('');
        setTitleB('');
        setBodyB('');
    };

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-24 pb-24">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">메시지 검토</h1>
                    <p className="text-gray-600">작성한 푸시 메시지를 미리보고, 비슷한 사례를 참고하세요</p>
                </div>

                {/* 탭 */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'single'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        단일 메시지
                    </button>
                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'compare'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        A/B 비교
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽: 입력 영역 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 기본 정보 */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {activeTab === 'single' ? '메시지 입력' : 'A 버전'}
                                </h2>
                                <button
                                    onClick={handleClear}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    초기화
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* 앱 이름 & 카테고리 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            앱 이름
                                        </label>
                                        <input
                                            type="text"
                                            value={appName}
                                            onChange={(e) => setAppName(e.target.value)}
                                            placeholder="예: 쿠팡"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            카테고리
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        >
                                            {MESSAGE_CATEGORIES.filter(c => !['transaction', 'empty'].includes(c.id)).map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.emoji} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 제목 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        제목
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onFocus={() => setFocusedField('title')}
                                        placeholder="푸시 알림 제목을 입력하세요"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>

                                {/* 본문 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        본문
                                    </label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        onFocus={() => setFocusedField('body')}
                                        placeholder="푸시 알림 본문을 입력하세요"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* A/B 비교 - B 버전 */}
                        {activeTab === 'compare' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">B 버전</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            제목
                                        </label>
                                        <input
                                            type="text"
                                            value={titleB}
                                            onChange={(e) => setTitleB(e.target.value)}
                                            onFocus={() => setFocusedField('titleB')}
                                            placeholder="B 버전 제목"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            본문
                                        </label>
                                        <textarea
                                            value={bodyB}
                                            onChange={(e) => setBodyB(e.target.value)}
                                            onFocus={() => setFocusedField('bodyB')}
                                            placeholder="B 버전 본문"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 미리보기 */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                {activeTab === 'compare' ? 'A 버전 미리보기' : '푸시 미리보기'}
                            </h2>
                            <PushPreview appName={appName} title={title} body={body} />
                        </div>

                        {/* A/B 비교 미리보기 */}
                        {activeTab === 'compare' && (titleB || bodyB) && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">B 버전 미리보기</h2>
                                <PushPreview appName={appName} title={titleB} body={bodyB} />
                            </div>
                        )}

                        {/* A/B 비교 분석 */}
                        {activeTab === 'compare' && title && titleB && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">비교 분석</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">A 버전</h3>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>제목 길이: {title.length}자</li>
                                            <li>본문 길이: {body.length}자</li>
                                            <li>이모지: {(title + body).match(/[\u{1F600}-\u{1F6FF}]/gu)?.length || 0}개</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">B 버전</h3>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>제목 길이: {titleB.length}자</li>
                                            <li>본문 길이: {bodyB.length}자</li>
                                            <li>이모지: {(titleB + bodyB).match(/[\u{1F600}-\u{1F6FF}]/gu)?.length || 0}개</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 사이드바 */}
                    <div className="space-y-6">
                        {/* 이모지 추천 */}
                        <EmojiSuggestions
                            category={category}
                            keywords={keywords}
                            onSelect={handleEmojiSelect}
                        />

                        {/* 발송 시간 힌트 */}
                        <TimingHint category={category} />

                        {/* 유사 메시지 */}
                        <SimilarMessages
                            messages={similarMessages}
                            loading={searchLoading}
                            searchQuery={`${title} ${body}`.trim()}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};
