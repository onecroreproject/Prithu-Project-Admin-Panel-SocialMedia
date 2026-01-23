import { useState } from "react";

export default function ChartTab({ onChange }) {
  const [selected, setSelected] = useState("month");

  const getButtonClass = (option) =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const handleClick = (option) => {
    setSelected(option);
    if (onChange) onChange(option);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => handleClick("month")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "month"
        )}`}
      >
        Month
      </button>
      <button
        onClick={() => handleClick("year")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "year"
        )}`}
      >
        Year
      </button>
      <button
        onClick={() => handleClick("week")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "week"
        )}`}
      >
        Week
      </button>
    </div>
  );
}
