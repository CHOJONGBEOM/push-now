import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAvailableApps } from '../../hooks/useAvailableApps';
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
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setActiveCategory('all');
        }
    }, [isOpen]);

    const toggleApp = (appName: string) => {
        if (compareMode) {
            if (selectedApps.includes(appName)) {
                onSelectionChange(selectedApps.filter((a) => a !== appName));
            } else if (selectedApps.length < 2) {
                onSelectionChange([...selectedApps, appName]);
            }
            return;
        }

        if (selectedApps.includes(appName)) {
            onSelectionChange(selectedApps.filter((a) => a !== appName));
        } else {
            onSelectionChange([...selectedApps, appName]);
        }
    };

    const selectAll = () => {
        onSelectionChange([]);
    };

    const selectCategory = (category: AppCategory) => {
        const categoryApps = appsByCategory[category]?.map((a) => a.name) || [];
        const uniqueCategoryApps = Array.from(new Set(categoryApps));
        if (uniqueCategoryApps.length === 0) return;

        const categorySet = new Set(uniqueCategoryApps);
        const selectedSet = new Set(selectedApps);
        const isCategoryFullySelected = uniqueCategoryApps.every((appName) => selectedSet.has(appName));

        if (isCategoryFullySelected) {
            // Toggle off only this category, keep other selected categories/apps.
            onSelectionChange(selectedApps.filter((appName) => !categorySet.has(appName)));
            return;
        }

        // Toggle on this category without clearing existing selections.
        const nextSelection = [...selectedApps];
        for (const appName of uniqueCategoryApps) {
            if (!selectedSet.has(appName)) nextSelection.push(appName);
        }
        onSelectionChange(nextSelection);
    };

    const filteredApps = useMemo(() => {
        const byCategory = activeCategory === 'all'
            ? apps
            : apps.filter((app) => app.category === activeCategory);

        const q = searchTerm.trim().toLowerCase();
        if (!q) return byCategory;
        return byCategory.filter((app) => app.name.toLowerCase().includes(q));
    }, [activeCategory, apps, searchTerm]);

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
            <button
                onClick={() => setIsOpen((prev) => !prev)}
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
                        {selectedApps.map((appName) => (
                            <img
                                key={appName}
                                src={getAppIcon(appName)}
                                alt={appName}
                                className="w-5 h-5 rounded-full border-2 border-white"
                            />
                        ))}
                    </div>
                )}
                <span className="max-w-[180px] truncate">{getButtonLabel()}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-[min(96vw,30rem)] sm:w-[28rem] lg:w-[30rem] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">앱 선택</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{selectedApps.length}개 선택</span>
                                {selectedApps.length > 0 && (
                                    <button
                                        onClick={selectAll}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        초기화
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="relative mb-3">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="앱 이름 검색"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                            <svg
                                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                            </svg>
                        </div>

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
                                {compareMode && <span className="text-xs text-gray-400">(2개 선택)</span>}
                            </label>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100">
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
                        {APP_CATEGORIES.filter((cat) => appsByCategory[cat.id]?.length > 0).map((cat) => (
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

                    <div className="max-h-[55vh] sm:max-h-80 overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">검색 결과가 없습니다</div>
                        ) : (
                            <div className="space-y-1">
                                {filteredApps.map((app) => {
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
                                                src={getAppIcon(app.name)}
                                                alt={app.name}
                                                className="w-8 h-8 rounded-lg"
                                            />
                                            <div className="flex-1 text-left min-w-0">
                                                <div
                                                    title={app.name}
                                                    className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}
                                                >
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
