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

const CSV_COLUMNS = [
  "name",
  "color",
  "location",
  "location_type",
  "latitude",
  "longitude",
  "health",
  "description",
  "has_bird_nesting",
  "owner_name",
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
