/**
 * Turns an array of flat objects into a CSV file and triggers a browser
 * download — no backend endpoint needed since every "report" here is
 * just a client-side reshaping of data the Admin dashboard already
 * fetched for its tables/charts. Shared by every exportable table on
 * the Reports tab.
 */
const toCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Quote any field containing a comma, quote, or newline; escape
  // embedded quotes by doubling them, per standard CSV rules.
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const downloadCsv = (filename, columns, rows) => {
  const header = columns.map((col) => toCsvValue(col.header)).join(',');
  const body = rows
    .map((row) => columns.map((col) => toCsvValue(col.value(row))).join(','))
    .join('\n');
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
