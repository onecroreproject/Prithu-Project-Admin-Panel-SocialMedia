import { useQuery } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import { useState, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiCalendar,
  FiRefreshCw
} from "react-icons/fi";
import { fetchMonthlyRegistrations } from "../../Services/DashboardServices/userRegistrationChartServices";

export default function UserRegistrationRatio() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("registrations"); // "registrations", "active", "suspended"
  const [timeRange, setTimeRange] = useState("yearly"); // "yearly", "quarterly", "monthly"

  // ✅ Fetch registration data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["monthlyRegistrations"],
    queryFn: fetchMonthlyRegistrations,
    staleTime: 1000 * 60 * 5,
  });

  // Memoized data processing (subscription removed)
  const processedData = useMemo(() => {
    if (!data?.monthlyData) {
      return {
        monthlyData: Array(12).fill(0),
        activeUsers: Array(12).fill(0),
        suspendedUsers: Array(12).fill(0),
        growthPercentages: Array(12).fill(0),
        currentYear: new Date().getFullYear(),
        totals: {
          registrations: 0,
          activeUsers: 0,
          suspendedUsers: 0,
          avgGrowth: 0
        }
      };
    }

    const monthlyData = data.monthlyData.map(m => m.registrations);
    const activeUsers = data.monthlyData.map(m => m.activeUsers);
    const suspendedUsers = data.monthlyData.map(m => m.suspendedUsers);
    const growthPercentages = data.monthlyData.map(m => m.growthPercent || 0);

    const totals = {
      registrations: monthlyData.reduce((a, b) => a + b, 0),
      activeUsers: activeUsers.reduce((a, b) => a + b, 0),
      suspendedUsers: suspendedUsers.reduce((a, b) => a + b, 0),
      avgGrowth: (growthPercentages.reduce((a, b) => a + b, 0) / 12).toFixed(1)
    };

    return {
      monthlyData,
      activeUsers,
      suspendedUsers,
      growthPercentages,
      currentYear: data.year,
      totals
    };
  }, [data]);

  // Get current series based on view mode
  const getCurrentSeries = () => {
    const seriesMap = {
      registrations: processedData.monthlyData,
      active: processedData.activeUsers,
      suspended: processedData.suspendedUsers,
    };

    return seriesMap[viewMode] || processedData.monthlyData;
  };

  // Get color based on view mode
  const getChartColor = () => {
    const colors = {
      registrations: ["#3b82f6", "#60a5fa"], // Blue gradient
      active: ["#10b981", "#34d399"], // Emerald gradient
      suspended: ["#ef4444", "#f87171"], // Red gradient
    };
    return colors[viewMode] || ["#3b82f6", "#60a5fa"];
  };

  // Get icon based on view mode
  const getViewIcon = () => {
    const icons = {
      registrations: FiUsers,
      active: FiUserCheck,
      suspended: FiUserX,
    };
    return icons[viewMode] || FiUsers;
  };

  // Get view label
  const getViewLabel = () => {
    const labels = {
      registrations: "Registrations",
      active: "Active Users",
      suspended: "Suspended Users",
    };
    return labels[viewMode] || "Registrations";
  };

  // Chart options
  const chartOptions = {
    colors: getChartColor(),
    chart: {
      fontFamily: "Inter, -apple-system, sans-serif",
      type: "bar",
      height: 220,
      toolbar: { 
        show: false 
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 8,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top"
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val > 0 ? val : "";
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#374151"]
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        }
      }
    },
    yaxis: {
      title: {
        text: "Count",
        style: {
          color: "#6b7280",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        }
      },
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "11px"
        },
        formatter: function(val) {
          return val >= 1000 ? (val/1000).toFixed(0) + 'k' : val;
        }
      },
      min: 0
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true
        }
      },
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: getChartColor(),
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif"
      },
      y: {
        formatter: function(val) {
          return val + " users";
        },
        title: {
          formatter: function(seriesName) {
            return seriesName + ":";
          }
        }
      },
      x: {
        formatter: function(val) {
          return val + " " + processedData.currentYear;
        }
      }
    },
    responsive: [{
      breakpoint: 640,
      options: {
        chart: {
          height: 180
        },
        dataLabels: {
          enabled: false
        },
        plotOptions: {
          bar: {
            columnWidth: "60%"
          }
        }
      }
    }]
  };

  const chartSeries = [{
    name: getViewLabel(),
    data: getCurrentSeries()
  }];

  // Handle view mode change
  const handleViewChange = (mode) => {
    setViewMode(mode);
    closeDropdown();
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    closeDropdown();
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-48 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
            <FiUsers className="text-red-400 text-xl" />
          </div>
          <p className="text-red-500 font-medium">Failed to load registration data</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ViewIcon = getViewIcon();
  const growthIcon = parseFloat(processedData.totals.avgGrowth) >= 0 ? 
    <FiTrendingUp className="text-emerald-500" /> : 
    <FiTrendingDown className="text-red-500" />;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header Section */}
      <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <ViewIcon className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                User Analytics - {processedData.currentYear}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Monthly {getViewLabel().toLowerCase()} overview
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { id: "registrations", icon: FiUsers, label: "Reg" },
                { id: "active", icon: FiUserCheck, label: "Active" },
                { id: "suspended", icon: FiUserX, label: "Suspended" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`p-2 rounded-md flex items-center gap-1.5 text-sm transition-all ${
                      viewMode === item.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title={item.label === "Reg" ? "Registrations" : item.label}
                  >
                    <Icon className="text-base" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown Menu */}
            <div className="relative inline-block">
              <button 
                onClick={toggleDropdown}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 size-5" />
              </button>
              <Dropdown 
                isOpen={isOpen} 
                onClose={closeDropdown} 
                className="w-48 p-2 shadow-lg border border-gray-200"
              >
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Range
                </div>
                {["Yearly", "Quarterly", "Monthly"].map((range) => (
                  <DropdownItem
                    key={range}
                    onItemClick={() => handleTimeRangeChange(range.toLowerCase())}
                    className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                      timeRange === range.toLowerCase()
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FiCalendar />
                    {range} View
                  </DropdownItem>
                ))}
                <div className="border-t border-gray-200 my-2"></div>
                <DropdownItem
                  onItemClick={() => refetch()}
                  className="flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiRefreshCw />
                  Refresh Data
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 py-3 sm:px-6 border-b border-gray-100 bg-gray-50/50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">
              {processedData.totals.registrations.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Registrations</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-emerald-600">
              {processedData.totals.activeUsers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active Users</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-gray-800">
                {processedData.totals.avgGrowth}%
              </span>
              {growthIcon}
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg. Growth</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4 sm:p-6">
        <div className="relative">
          <Chart 
            options={chartOptions} 
            series={chartSeries} 
            type="bar" 
            height={220} 
            className="w-full"
          />
          
          {/* Current Month Highlight */}
          <div className="absolute top-0 right-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
            <div className="text-xs text-blue-700 font-medium">
              Current Month: {chartSeries[0].data[new Date().getMonth()]} users
            </div>
          </div>
        </div>

        {/* Month Selector (Mobile) */}
        <div className="mt-4 sm:hidden">
          <div className="flex overflow-x-auto pb-2 space-x-2 custom-scrollbar">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
              <button
                key={month}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  index === new Date().getMonth()
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => {/* Scroll to month */}}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}