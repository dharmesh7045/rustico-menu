// Flows MENU sections into fixed-height columns, adding pages as needed.
// Each design supplies:
//   newPage(part)        -> { columns: [HTMLElement, ...] }  (appended to the document by the design)
//   renderHeading(sec, continued) -> HTMLElement
//   renderItem(item, sec) -> HTMLElement
//   renderCompact(sec)   -> HTMLElement   (optional; used for sections with compact: true)
// A section heading is always kept together with its first item.
window.paginate = function (opts) {
  const { sections, newPage, renderHeading, renderItem, renderCompact, breakBetweenParts = true } = opts;
  let columns = null, ci = 0, part = null;

  const overflows = (col) => col.scrollHeight > col.clientHeight + 1;
  const freshPage = (p) => { columns = newPage(p).columns; ci = 0; };
  const nextColumn = () => { ci++; if (ci >= columns.length) freshPage(part); };

  // Places a unit; returns true if it had to move to a new column.
  function place(unit) {
    columns[ci].appendChild(unit);
    if (!overflows(columns[ci])) return false;
    columns[ci].removeChild(unit);
    nextColumn();
    columns[ci].appendChild(unit);
    return true;
  }

  for (const sec of sections) {
    if (sec.part !== part) {
      part = sec.part;
      if (!columns || breakBetweenParts) freshPage(part);
    }
    if (sec.compact && renderCompact) {
      const unit = document.createElement("div");
      unit.className = "unit";
      unit.append(renderHeading(sec, false), renderCompact(sec));
      place(unit);
      continue;
    }
    sec.items.forEach((item, i) => {
      const unit = document.createElement("div");
      unit.className = "unit";
      if (i === 0) unit.appendChild(renderHeading(sec, false));
      unit.appendChild(renderItem(item, sec));
      const moved = place(unit);
      if (moved && i > 0) {
        // Section continues in a new column: repeat a small heading on top.
        unit.prepend(renderHeading(sec, true));
        if (overflows(columns[ci])) unit.firstChild.remove();
      }
    });
  }
};

window.el = function (tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
