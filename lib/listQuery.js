const PAGE_SIZE = 25;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getListQuery(query, options) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  const sortField = options.allowedSorts.includes(query.sort) ? query.sort : options.defaultSort;
  const dir = query.dir === 'desc' ? -1 : 1;
  const sort = { [sortField]: dir };
  if (options.tieBreak && options.tieBreak !== sortField) {
    sort[options.tieBreak] = 1;
  }

  return {
    basePath: options.basePath,
    defaultSort: options.defaultSort,
    page,
    q,
    sortField,
    dir,
    sort,
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  };
}

function regexFilter(q, fields) {
  if (!q) return {};
  const pattern = new RegExp(escapeRegex(q), 'i');
  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

function href(list, page, sortField, dir) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (list.q) params.set('q', list.q);
  if (sortField && sortField !== list.defaultSort) params.set('sort', sortField);
  if (dir === -1) params.set('dir', 'desc');
  const qs = params.toString();
  return qs ? `${list.basePath}?${qs}` : list.basePath;
}

function withTotals(list, total) {
  const pages = Math.max(Math.ceil(total / list.limit), 1);
  const page = Math.min(list.page, pages);
  const paged = {
    ...list,
    page,
    skip: (page - 1) * list.limit,
    total,
    pages,
    start: (page - 1) * list.limit,
  };
  paged.href = href(paged, page, paged.sortField, paged.dir);
  paged.prevHref = href(paged, page - 1, paged.sortField, paged.dir);
  paged.nextHref = href(paged, page + 1, paged.sortField, paged.dir);
  return paged;
}

function sortHref(list, field) {
  const dir = list.sortField === field && list.dir === 1 ? -1 : 1;
  return href(list, 1, field, dir);
}

module.exports = { PAGE_SIZE, getListQuery, regexFilter, withTotals, sortHref };
