import applyProjection from '../utils/applyProjection';

export default ({
  model,
  searchQuery = () => {},
  briefColumns = '_id',
}) => async (ctx) => {
  const {
    sortBy, sortDesc, page = 1, itemsPerPage = 0, columns, filter = '{}', postGet = x => x,
  } = ctx.request.query;

  const totalSearchQuery = {
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true },
  };

  const [items, total] = await Promise.all([
    model.find(totalSearchQuery)
      .collation({ locale: 'ru' })
      .sort(sortBy && { [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip(itemsPerPage !== '-1' ? (page - 1) * parseInt(itemsPerPage, 10) : 0)
      .limit(itemsPerPage !== '-1' ? parseInt(itemsPerPage, 10) : 0),
    model.countDocuments(totalSearchQuery),
  ]);

  ctx.body = {
    items: items
      .map(applyProjection(columns === 'brief' ? briefColumns : columns))
      .map(x => postGet(x)),
    total,
  };
};
