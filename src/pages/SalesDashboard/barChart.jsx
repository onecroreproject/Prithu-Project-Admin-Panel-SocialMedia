import { useState } from "react";
import Chart from "react-apexcharts";
import ChartTab from "../../components/common/ChartTab";

export default function StatisticsChart() {
  const [tab, setTab] = useState("month");

  // Last N years
  const getLastYears = (count) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = count - 1; i >= 0; i--) years.push(currentYear - i);
    return years;
  };

  // Get current week dates (Sun → Sat)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const weekDays = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      weekDays.push(dayNames[d.getDay()]);
    }
    return weekDays;
  };

  // Series & categories based on tab
  const getSeriesAndCategories = (tab) => {
    const today = new Date();
    switch (tab) {
      case "week": {
        const days = getCurrentWeekDays();
        return {
          categories: days,
          series: [
            { name: "Registered Users", data: days.map(() => Math.floor(Math.random() * 50 + 5)) },
            { name: "Subscription Users", data: days.map(() => Math.floor(Math.random() * 30 + 3)) },
          ],
        };
      }
      case "year": {
        const years = getLastYears(5);
        return {
          categories: years,
          series: [
            { name: "Registered Users", data: years.map(() => Math.floor(Math.random() * 5000 + 1000)) },
            { name: "Subscription Users", data: years.map(() => Math.floor(Math.random() * 2500 + 500)) },
          ],
        };
      }
      default: { // month
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return {
          categories: months,
          series: [
            { name: "Registered Users", data: months.map(() => Math.floor(Math.random() * 300 + 100)) },
            { name: "Subscription Users", data: months.map(() => Math.floor(Math.random() * 150 + 40)) },
          ],
        };
      }
    }
  };

  const { series, categories } = getSeriesAndCategories(tab);

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
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-5 pb-5 pt-5 shadow-[0_4px_10px_rgba(99,102,241,0.08)] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 sm:pt-6 transition-all duration-700 hover:shadow-[0_8px_15px_rgba(244,63,94,0.15)]">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Target you’ve set for each period</p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab onChange={setTab} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>

      <div className="absolute -top-5 -right-5 w-28 h-28 bg-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
    </div>
  );
}
