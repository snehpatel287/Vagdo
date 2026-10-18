function download(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAsJson(trees) {
  download(
    "vagdo-trees.json",
    JSON.stringify(trees, null, 2),
    "application/json"
  );
}

const CSV_COLUMNS = [
  "id",
  "name",
  "color",
  "location",
  "latitude",
  "longitude",
  "health",
  "next_care_date",
  "description",
  "created_at",
];

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAsCsv(trees) {
  const header = CSV_COLUMNS.join(",");
  const rows = trees.map((t) =>
    CSV_COLUMNS.map((col) => csvEscape(t[col])).join(",")
  );
  download("vagdo-trees.csv", [header, ...rows].join("\n"), "text/csv");
}
