// Info.jsx
import React from "react";

export default function Info({ label, value, link }) {
  return (
    <div>
      <label className="block text-sm mb-1 font-medium text-gray-600">{label}</label>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-50 px-3 py-2 rounded block text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : (
        <div className="bg-gray-50 px-3 py-2 rounded">{value || "-"}</div>
      )}
    </div>
  );
}
