import React from 'react';
import { CATEGORIES } from '../../types/push-message';

interface FilterBarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedApps: string[];
    onAppsChange: (apps: string[]) => void;
    availableApps: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
    selectedCategory,
    onCategoryChange,
    selectedApps,
    onAppsChange,
    availableApps,
}) => {
    const [showAppFilter, setShowAppFilter] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowAppFilter(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleApp = (app: string) => {
        if (selectedApps.includes(app)) {
            onAppsChange(selectedApps.filter(a => a !== app));
        } else {
            onAppsChange([...selectedApps, app]);
        }
        // Don't close dropdown to allow multi-select
    };

    const removeApp = (app: string) => {
        onAppsChange(selectedApps.filter(a => a !== app));
    };

    const clearAllApps = () => {
        onAppsChange([]);
    };

    return (
        <div className="mb-10">
            {/* 카테고리 탭 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-4 scrollbar-hide border-b border-gray-100">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`h-9 px-4 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-purple-300'
                            }`}
                    >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* 앱 필터 - 칩 기반 UI */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">앱 필터</span>
                    {selectedApps.length > 0 && (
                        <button
                            onClick={clearAllApps}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            모두 해제
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* 선택된 앱 태그들 */}
                    {selectedApps.map((app) => (
                        <div
                            key={app}
                            className="group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all"
                        >
                            <span>{app}</span>
                            <button
                                onClick={() => removeApp(app)}
                                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                aria-label={`${app} 제거`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    {/* 앱 추가 버튼 */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowAppFilter(!showAppFilter)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-full text-sm font-medium text-gray-600 hover:text-gray-800 transition-all hover:shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>앱 추가</span>
                        </button>

                        {/* 앱 선택 팝오버 */}
                        {showAppFilter && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 min-w-[240px] max-w-[320px] z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="mb-2 pb-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-600 uppercase">앱 선택</p>
                                </div>
                                <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {/* 전체 옵션 */}
                                    <label
                                        className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2.5 rounded-xl transition-colors group border-b border-gray-100"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedApps.length === 0}
                                            onChange={() => clearAllApps()}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                        />
                                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                                            전체
                                        </span>
                                    </label>

                                    {/* 아직 선택되지 않은 앱들만 표시 */}
                                    {availableApps
                                        .filter(app => !selectedApps.includes(app))
                                        .map((app) => (
                                            <label
                                                key={app}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2.5 rounded-xl transition-colors group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    onChange={() => toggleApp(app)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                                />
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                                    {app}
                                                </span>
                                            </label>
                                        ))}
                                </div>
                                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                                    <button
                                        onClick={() => setShowAppFilter(false)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        닫기
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        {selectedApps.length}개 선택됨
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
