import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { AppCategory } from '../utils/appCategories';

export interface AppInfo {
    name: string;
    packageName: string | null;
    count: number;
    category: AppCategory;
    iconUrl: string | null;
    isActive: boolean;
}

interface AppRow {
    app_name: string;
    package_name: string | null;
    category: string;
    icon_url: string | null;
    is_active: boolean;
}

export const useAvailableApps = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                setIsLoading(true);

                // apps 테이블에서 앱 목록 조회
                const { data: appsData, error: appsError } = await supabase
                    .from('apps')
                    .select('app_name, package_name, category, icon_url, is_active')
                    .eq('is_active', true)
                    .order('app_name');

                if (appsError) throw appsError;

                // push_messages에서 앱별 카운트 조회
                const { data: countData, error: countError } = await supabase
                    .from('push_messages')
                    .select('app_name')
                    .not('app_name', 'is', null);

                if (countError) throw countError;

                // 카운트 맵 생성
                const countMap: Record<string, number> = {};
                (countData as { app_name: string | null }[] | null)?.forEach(item => {
                    if (item.app_name) {
                        countMap[item.app_name] = (countMap[item.app_name] || 0) + 1;
                    }
                });

                // AppInfo 배열로 변환
                const appList: AppInfo[] = (appsData as AppRow[] || []).map(app => ({
                    name: app.app_name,
                    packageName: app.package_name,
                    count: countMap[app.app_name] || 0,
                    category: app.category as AppCategory,
                    iconUrl: app.icon_url,
                    isActive: app.is_active,
                })).sort((a, b) => b.count - a.count);

                setApps(appList);
            } catch (err) {
                console.error('Error fetching apps:', err);
                setError(err instanceof Error ? err.message : '앱 목록을 불러오는데 실패했습니다');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApps();
    }, []);

    // 카테고리별 그룹핑
    const appsByCategory = apps.reduce((acc, app) => {
        if (!acc[app.category]) {
            acc[app.category] = [];
        }
        acc[app.category].push(app);
        return acc;
    }, {} as Record<AppCategory, AppInfo[]>);

    return { apps, appsByCategory, isLoading, error };
};
