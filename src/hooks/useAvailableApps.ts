import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { normalizeAppCategory, type AppCategory } from '../utils/appCategories';

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
  category: string | null;
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

        const { data: appsData, error: appsError } = await supabase
          .from('apps')
          .select('app_name, package_name, category, icon_url, is_active')
          .eq('is_active', true)
          .order('app_name');

        if (appsError) throw appsError;

        // Count only visible messages so hidden rows do not pollute category stats.
        const { data: countData, error: countError } = await supabase
          .from('push_messages')
          .select('app_name')
          .or('is_hidden.is.null,is_hidden.eq.false')
          .not('app_name', 'is', null);

        if (countError) throw countError;

        const countMap: Record<string, number> = {};
        (countData as { app_name: string | null }[] | null)?.forEach((item) => {
          if (!item.app_name) return;
          countMap[item.app_name] = (countMap[item.app_name] || 0) + 1;
        });

        const appList: AppInfo[] = ((appsData as AppRow[]) || [])
          .map((app) => ({
            name: app.app_name,
            packageName: app.package_name,
            count: countMap[app.app_name] || 0,
            category: normalizeAppCategory(app.category, app.app_name),
            iconUrl: app.icon_url,
            isActive: app.is_active,
          }))
          .filter((app) => app.count > 0)
          .sort((a, b) => b.count - a.count);

        setApps(appList);
      } catch (err) {
        console.error('Error fetching apps:', err);
        setError(err instanceof Error ? err.message : '앱 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  const appsByCategory = apps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<AppCategory, AppInfo[]>);

  return { apps, appsByCategory, isLoading, error };
};

