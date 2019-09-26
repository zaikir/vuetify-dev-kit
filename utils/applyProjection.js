export default keys => (obj) => {
  if (!keys) {
    return obj;
  }

  const columns = keys.split(',').map(x => x.trim());

  return Object.assign({ _id: obj._id }, ...columns.map(column => ({
    [column]: obj[column],
  })));
};
