/**
 * Exports data to a CSV file.
 * @param {Array} data - The array of objects to export.
 * @param {string} fileName - The name of the file to be saved.
 * @param {Array} headers - Array of objects with { label, key } for CSV headers.
 */
export const exportToCSV = (data, fileName, headers) => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Create the header row
    const headerRow = headers.map(header => `"${header.label}"`).join(",");

    // Create the data rows
    const rows = data.map(item => {
        return headers.map(header => {
            let value = item[header.key];

            // Handle nested keys (e.g., 'profile.name')
            if (header.key.includes('.')) {
                value = header.key.split('.').reduce((obj, key) => (obj ? obj[key] : ""), item);
            }

            // Handle null/undefined
            if (value === null || value === undefined) value = "";

            // Escape quotes and wrap in quotes
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
        }).join(",");
    });

    // Combine headers and rows
    const csvContent = [headerRow, ...rows].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
