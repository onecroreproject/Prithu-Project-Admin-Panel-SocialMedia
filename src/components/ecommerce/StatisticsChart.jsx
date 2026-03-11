import Chart from "react-apexcharts";
import { useDashboardHeartbeat } from "../../hooks/useDashboardHeartbeat";
import ChartTab from "../common/ChartTab";

export default function StatisticsChart() {
  const { data: heartbeat, isLoading } = useDashboardHeartbeat();

  const options = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF", "#10B981"], // Blue for Registrations, Green for Subscriptions
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: "#F1F5F9",
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category",
      categories: ["Total"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#64748B"] } },
    },
  };

  const series = [
    { 
      name: "Total Registrations", 
      data: [heartbeat?.metrics?.totalUsers || 0] 
    },
    { 
      name: "Active Subscriptions", 
      data: [heartbeat?.metrics?.totalUsers ? Math.round((heartbeat.revenue.ratioPercentage / 100) * heartbeat.metrics.totalUsers) : 0] 
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Overall Growth
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Real-time registration vs subscription counts
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
