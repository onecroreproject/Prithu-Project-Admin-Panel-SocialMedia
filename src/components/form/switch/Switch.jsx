import { useState, useEffect } from "react";

const Switch = ({
  label,
  defaultChecked = false,
  checked,
  disabled = false,
  onChange,
  color = "blue",
  id,
  name,
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  // Sync internal state if controlled
  useEffect(() => {
    if (checked !== undefined) setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !isChecked;
    if (checked === undefined) setIsChecked(newChecked); // uncontrolled mode
    if (onChange) onChange(newChecked);
  };

  const switchColors =
    color === "blue"
      ? {
          background: isChecked
            ? "bg-brand-500"
            : "bg-gray-200 dark:bg-white/10",
          knob: isChecked
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        }
      : {
          background: isChecked
            ? "bg-gray-800 dark:bg-white/10"
            : "bg-gray-200 dark:bg-white/10",
          knob: isChecked
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-400"
      }`}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        disabled={disabled}
        onChange={handleToggle}
      />
      <div className="relative">
        <div
          className={`block h-6 w-11 rounded-full transition duration-150 ease-linear ${
            disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800"
              : switchColors.background
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm transform duration-150 ease-linear ${switchColors.knob}`}
        />
      </div>
      {label}
    </label>
  );
};

export default Switch;
