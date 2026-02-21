import { useState } from "react";
import Chart from "react-apexcharts";
import ChartTab from "../../components/common/ChartTab";
import { useQuery } from "@tanstack/react-query";
import { getDailyUserSubscriptionCounts } from "../../Services/SalesDashboardSecrvices/metricServices";

export default function StatisticsChart() {
  const [tab, setTab] = useState("month");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["salesStatistics", tab],
    queryFn: () => getDailyUserSubscriptionCounts(tab),
  });

  const categories = data?.categories || [];
  const series = [
    { name: "Registered Users", data: data?.registeredUsers || [] },
    { name: "Subscription Users", data: data?.subscriptionUsers || [] },
  ];

  const options = {
    legend: { show: true, position: "top", horizontalAlign: "center", labels: { colors: "#6B7280" } },
    colors: ["#6366F1", "#F43F5E"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 320,
      type: "area",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 1000 },
      dropShadow: { enabled: true, top: 8, left: 2, blur: 6, color: "#6366F1", opacity: 0.15 },
    },
    stroke: { curve: "smooth", width: 3, lineCap: "round" },
    fill: { type: "gradient", gradient: { shade: "dark", type: "vertical", shadeIntensity: 0.5, gradientToColors: ["#A855F7", "#FB7185"], inverseColors: false, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 100] } },
    markers: { size: 4, colors: ["#fff"], strokeColors: ["#6366F1", "#F43F5E"], strokeWidth: 3, hover: { size: 7 } },
    grid: { borderColor: "rgba(200, 200, 200, 0.2)", row: { colors: ["transparent", "transparent"], opacity: 0.1 } },
    tooltip: { theme: "dark", style: { fontSize: "13px" } },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#6B7280", fontSize: "12px" } } },
    yaxis: { labels: { style: { colors: "#9CA3AF", fontSize: "12px" } } },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-indigo-50 via-white to-pink-50 px-5 pb-5 pt-5 shadow-[0_4px_10px_rgba(99,102,241,0.08)] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 sm:pt-6 transition-all duration-700 hover:shadow-[0_8px_15px_rgba(244,63,94,0.15)]">
      <div className="relative z-10 flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Target you’ve set for each period</p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab onChange={setTab} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full relative min-h-[310px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : isError ? (
            <div className="absolute inset-0 flex items-center justify-center text-rose-500">
              Failed to load statistics
            </div>
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>

      <div className="absolute -top-5 -right-5 w-28 h-28 bg-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400 rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none z-0"></div>
    </div>
  );
}
