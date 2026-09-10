// components/TableDisplay.jsx
export default function TableDisplay({ rows }) {
  return (
    <table className="h-full border-collapse border border-gray-100 mb-2 rounded overflow-hidden bg-white shadow-sm">
      <tbody>
        {rows.map(({ label, value }, i) => (
          <tr key={i} className="border-b border-gray-50 "  style={{ height: "40px" }} >
            <td className="w-1/3 px-4 py-2 font-medium text-gray-500 bg-gray-50">{label}</td>
            <td className="w-2/3 px-4 py-2 text-gray-800">{value || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
