// src/components/dashboard/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const styles = {
    Delivered: "bg-green-50 text-green-600",
    "In Transit": "bg-yellow-50 text-yellow-600",
    Pending: "bg-gray-50 text-gray-500",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}
