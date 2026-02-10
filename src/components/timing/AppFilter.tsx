import React, { useState, useRef, useEffect } from 'react';
import { useAvailableApps, type AppInfo } from '../../hooks/useAvailableApps';
import { APP_CATEGORIES, getCategoryInfo, type AppCategory } from '../../utils/appCategories';
import { getAppIcon } from '../../utils/appIcons';

interface AppFilterProps {
    selectedApps: string[];
    onSelectionChange: (apps: string[]) => void;
    compareMode?: boolean;
    onCompareModeChange?: (enabled: boolean) => void;
}

export const AppFilter: React.FC<AppFilterProps> = ({
    selectedApps,
    onSelectionChange,
    compareMode = false,
    onCompareModeChange,
}) => {
    const { apps, appsByCategory, isLoading } = useAvailableApps();
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<AppCategory | 'all'>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 앱 이름으로 아이콘 URL 가져오기 (DB 우선, fallback to placeholder)
    const getIconUrl = (appName: string) => {
        const app = apps.find(a => a.name === appName);
        return app?.iconUrl || getAppIcon(appName);
    };

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleApp = (appName: string) => {
        if (compareMode) {
            // 비교 모드: 최대 2개
            if (selectedApps.includes(appName)) {
                onSelectionChange(selectedApps.filter(a => a !== appName));
            } else if (selectedApps.length < 2) {
                onSelectionChange([...selectedApps, appName]);
            }
        } else {
            // 일반 모드: 다중 선택
            if (selectedApps.includes(appName)) {
                onSelectionChange(selectedApps.filter(a => a !== appName));
            } else {
                onSelectionChange([...selectedApps, appName]);
            }
        }
    };

    const selectAll = () => {
        onSelectionChange([]);
    };

    const selectCategory = (category: AppCategory) => {
        const categoryApps = appsByCategory[category]?.map(a => a.name) || [];
        onSelectionChange(categoryApps);
    };

    const filteredApps = activeCategory === 'all'
        ? apps
        : apps.filter(app => app.category === activeCategory);

    const getButtonLabel = () => {
        if (selectedApps.length === 0) return '전체 앱';
        if (selectedApps.length === 1) return selectedApps[0];
        if (selectedApps.length === 2 && compareMode) {
            return `${selectedApps[0]} vs ${selectedApps[1]}`;
        }
        return `${selectedApps.length}개 앱 선택`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 트리거 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-medium transition-all
                    ${selectedApps.length > 0
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                    }
                `}
            >
                {selectedApps.length > 0 && selectedApps.length <= 2 && (
                    <div className="flex -space-x-1">
                        {selectedApps.map(appName => (
                            <img
                                key={appName}
                                src={getIconUrl(appName)}
                                alt={appName}
                                className="w-5 h-5 rounded-full border-2 border-white"
                            />
                        ))}
                    </div>
                )}
                <span>{getButtonLabel()}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* 드롭다운 */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* 헤더 */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">앱 선택</span>
                            {selectedApps.length > 0 && (
                                <button
                                    onClick={selectAll}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    초기화
                                </button>
                            )}
                        </div>

                        {/* 비교 모드 토글 */}
                        {onCompareModeChange && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div
                                    className={`
                                        relative w-10 h-5 rounded-full transition-colors
                                        ${compareMode ? 'bg-gray-900' : 'bg-gray-200'}
                                    `}
                                    onClick={() => {
                                        onCompareModeChange(!compareMode);
                                        if (!compareMode && selectedApps.length > 2) {
                                            onSelectionChange(selectedApps.slice(0, 2));
                                        }
                                    }}
                                >
                                    <div
                                        className={`
                                            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                                            ${compareMode ? 'translate-x-5' : 'translate-x-0.5'}
                                        `}
                                    />
                                </div>
                                <span className="text-sm text-gray-600">비교 모드</span>
                                {compareMode && (
                                    <span className="text-xs text-gray-400">(2개 선택)</span>
                                )}
                            </label>
                        )}
                    </div>

                    {/* 카테고리 탭 */}
                    <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`
                                px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                                ${activeCategory === 'all'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            전체
                        </button>
                        {APP_CATEGORIES.filter(cat => appsByCategory[cat.id]?.length > 0).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                                    ${activeCategory === cat.id
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {cat.emoji} {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* 앱 목록 */}
                    <div className="max-h-64 overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredApps.map(app => {
                                    const isSelected = selectedApps.includes(app.name);
                                    const isDisabled = compareMode && selectedApps.length >= 2 && !isSelected;
                                    const categoryInfo = getCategoryInfo(app.category);

                                    return (
                                        <button
                                            key={app.name}
                                            onClick={() => !isDisabled && toggleApp(app.name)}
                                            disabled={isDisabled}
                                            className={`
                                                w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                                                ${isSelected
                                                    ? 'bg-gray-900 text-white'
                                                    : isDisabled
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <img
                                                src={app.iconUrl || getAppIcon(app.name)}
                                                alt={app.name}
                                                className="w-8 h-8 rounded-lg"
                                            />
                                            <div className="flex-1 text-left">
                                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                    {app.name}
                                                </div>
                                                <div className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                                    {categoryInfo?.emoji} {categoryInfo?.name} · {app.count}건
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 카테고리 전체 선택 */}
                    {activeCategory !== 'all' && !compareMode && (
                        <div className="p-2 border-t border-gray-100">
                            <button
                                onClick={() => selectCategory(activeCategory)}
                                className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {getCategoryInfo(activeCategory)?.name} 전체 선택
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
