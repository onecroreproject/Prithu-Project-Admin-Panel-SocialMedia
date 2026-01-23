import Chart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { fetchSubscriptionStats } from "../../Services/DashboardServices/subscriptionRatioChartServices";

export default function SubscriptionRevenue() {
  const { data: stats = {}, isLoading, isError } = useQuery({
    queryKey: ["subscriptionStats"],
    queryFn: fetchSubscriptionStats,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });



  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">Failed to load stats</p>;

  const series = [stats.ratioPercentage || 0];

  const options = {
    colors: ["#465FFF"],
    chart: { type: "radialBar", height: 330, sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Subscription Revenue
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Achieve Ratio for each month
            </p>
          </div>

          <div className="relative inline-block">
            <Dropdown isOpen={false} onClose={() => {}} className="w-40 p-2">
              <DropdownItem>View More</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            +{stats.ratioPercentage || 0}%
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          You earned ₹{stats.todaySubscriptionAmount || 0} today, it's higher than last month. Keep up your good work!
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total Revenue
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            ₹{stats.totalSubscriptionAmount || 0}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Today Revenue
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            ₹{stats.todaySubscriptionAmount || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
