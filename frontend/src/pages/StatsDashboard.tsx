import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import SideNav from '../components/SideNav';
import { Skeleton, StatCardsSkeleton } from '../components/Skeleton';
import { reportsApi } from '../api';
import type { ConsumptionTrendsReport, DashboardReport, WasteReport } from '../api';
import { useDialog } from '../contexts/DialogContext';

type Period = 'month' | 'week';

function getRange(period: Period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (period === 'month') {
    start.setDate(1);
    // Lấy ngày cuối cùng của tháng hiện tại
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
  } else {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    // Lấy ngày Chủ Nhật của tuần hiện tại
    end.setDate(start.getDate() + 6);
  }
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default function StatsDashboard() {
  const { showAlert } = useDialog();
  const [period, setPeriod] = useState<Period>('month');
  const [dashboard, setDashboard] = useState<DashboardReport | null>(null);
  const [trends, setTrends] = useState<ConsumptionTrendsReport | null>(null);
  const [waste, setWaste] = useState<WasteReport | null>(null);
  const [loading, setLoading] = useState(true);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const { start, end } = getRange(period);
    Promise.all([
      reportsApi.dashboard(start.toISOString(), end.toISOString()),
      reportsApi.consumptionTrends(start.toISOString(), end.toISOString()),
      reportsApi.waste(start.toISOString(), end.toISOString()),
    ])
      .then(([dashboardData, trendsData, wasteData]) => {
        if (cancelled) return;
        setDashboard(dashboardData);
        setTrends(trendsData);
        setWaste(wasteData);
      })
      .catch((err) => handleError(err, 'Không tải được báo cáo.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, handleError]);

  const shopping = dashboard?.shopping;
  const addedTotal = dashboard?.inventory.byEventType.added?.count ?? 0;
  const wastedTotal = dashboard?.waste.eventCount ?? 0;
  const wasteRatio = addedTotal > 0 ? Math.round((wastedTotal / addedTotal) * 100) : 0;

  // Daily consumed/added events become the bar chart series.
  const { start, end } = getRange(period);
  const dateList: string[] = [];
  const curr = new Date(start);
  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    dateList.push(`${yyyy}-${mm}-${dd}`);
    curr.setDate(curr.getDate() + 1);
  }

  const consumedMap = new Map<string, number>();
  (trends?.eventsByDay ?? [])
    .filter((event) => event.type === 'consumed')
    .forEach((event) => {
      consumedMap.set(event.day, Math.abs(event.totalQuantityDelta));
    });

  const consumedByDay = dateList
    .map((day) => ({
      day,
      value: consumedMap.get(day) ?? 0,
    }))
    .filter((entry) => entry.value > 0);
  const maxConsumed = Math.max(1, ...consumedByDay.map((entry) => entry.value));

  const topConsumed = trends?.topConsumed ?? [];
  const maxTopConsumed = Math.max(1, ...topConsumed.map((entry) => entry.quantity));

  return (
    <div className="bg-surface-bright text-on-surface font-body-md h-screen overflow-hidden flex">
      <SideNav />

      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        {/* TopNavBar (Web) */}
        <header className="hidden md:flex bg-surface dark:bg-surface-dim border-b border-outline-variant w-full shrink-0 z-30">
          <div className="flex justify-between items-center w-full h-nav-height px-margin-mobile max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Link to="/home" className="hover:text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">home</span>
              </Link>
              <span className="text-sm">/</span>
              <span className="font-bold text-primary text-sm">Báo cáo thống kê</span>
            </div>
            <div className="flex gap-4">
              <NotificationDropdown />
              <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-margin-mobile md:p-8 w-full max-w-7xl mx-auto pb-[100px] md:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-headline-md text-headline-md text-primary mb-2">Báo cáo & thống kê</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex bg-surface-container rounded-lg p-1 w-fit border border-outline-variant/30">
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-5 py-2 rounded font-label-sm text-label-sm transition-colors ${period === 'month' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'}`}
                >
                  Tháng này
                </button>
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-5 py-2 rounded font-label-sm text-label-sm transition-colors ${period === 'week' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'}`}
                >
                  Tuần này
                </button>
              </div>
            </header>

            {loading ? (
              <>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCardsSkeleton count={3} />
                </section>
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Skeleton className="lg:col-span-2 h-[320px]" />
                  <Skeleton className="h-[320px]" />
                </section>
              </>
            ) : (
              <>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-[18px]">shopping_bag</span>
                        </div>
                        <h3 className="font-body-md text-body-md">Món đã mua</h3>
                      </div>
                    </div>
                    <p className="font-display-lg text-display-lg text-on-surface">{shopping?.boughtItems ?? 0} <span className="font-body-lg text-body-lg text-on-surface-variant">món</span></p>
                    <div className="mt-3 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">local_mall</span>
                      <span>Từ {shopping?.totalLists ?? 0} danh sách mua sắm</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary-container text-[18px]">task_alt</span>
                        </div>
                        <h3 className="font-body-md text-body-md">Tỷ lệ hoàn thành mua sắm</h3>
                      </div>
                    </div>
                    <p className="font-display-lg text-display-lg text-primary">{Math.round((shopping?.completionRate ?? 0) * 100)}%</p>
                    <div className="mt-3 flex items-center gap-1 font-label-sm text-label-sm text-tertiary bg-tertiary-container/20 w-fit px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>{shopping?.completedLists ?? 0} danh sách đã hoàn thành</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-error text-[18px]">delete_sweep</span>
                        </div>
                        <h3 className="font-body-md text-body-md">Lãng phí (hết hạn/bỏ đi)</h3>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-display-lg text-display-lg text-error">{wasteRatio}%</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{wastedTotal} lần bỏ thực phẩm</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">event_busy</span>
                      <span>{waste?.expiredActiveItems.length ?? 0} món đang hết hạn trong tủ</span>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Tiêu thụ thực phẩm theo ngày</h3>
                    </div>
                    {consumedByDay.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl mb-3 text-outline">bar_chart</span>
                        <p className="font-body-md">Chưa có dữ liệu tiêu thụ trong khoảng thời gian này.</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-end pt-4 relative min-h-[250px] overflow-x-auto">
                        <div className="flex items-end justify-around gap-1 w-full min-w-[480px] h-[220px] z-10 relative">
                          {consumedByDay.map((entry) => (
                            <div key={entry.day} className="flex flex-col items-center flex-1 h-full justify-end group">
                              <span className="font-label-sm text-label-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity mb-1">{entry.value}</span>
                              <div
                                className="w-full max-w-[40px] bg-primary hover:bg-tertiary rounded-t-md transition-colors cursor-pointer shadow-sm"
                                style={{ height: `${entry.value > 0 ? Math.max(6, (entry.value / maxConsumed) * 100) : 0}%` }}
                              ></div>
                              <span className="font-label-sm text-[10px] text-on-surface-variant pt-2 rotate-0">{entry.day.slice(5)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Tiêu thụ nhiều nhất</h3>
                    {topConsumed.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant py-8">
                        <span className="material-symbols-outlined text-5xl mb-3 text-outline">restaurant</span>
                        <p className="font-body-md text-center">Chưa có dữ liệu. Hãy cập nhật khi nấu ăn nhé!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 font-body-md text-body-md">
                        {topConsumed.slice(0, 7).map((entry) => (
                          <div key={`${entry.name}-${entry.unit}`} className="p-2 rounded hover:bg-surface-container transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-on-surface line-clamp-1">{entry.name}</span>
                              <span className="font-bold text-on-surface-variant whitespace-nowrap">{entry.quantity} {entry.unit}</span>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(entry.quantity / maxTopConsumed) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {(waste?.wastedItems.length ?? 0) > 0 && (
                  <section className="mt-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error">delete_sweep</span>
                      Thực phẩm bị lãng phí
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {waste!.wastedItems.slice(0, 9).map((item) => (
                        <div key={`${item.name}-${item.unit}`} className="flex items-center justify-between p-3 bg-error-container/15 border border-error-container/40 rounded-lg">
                          <span className="font-body-md text-on-surface line-clamp-1">{item.name}</span>
                          <span className="font-label-sm text-label-sm text-error font-bold whitespace-nowrap">{item.wastedQuantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
