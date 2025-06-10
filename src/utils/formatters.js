export const formatPrice = (price) => {
  if (price === 'N/A' || price === null || price === undefined) {
    return 'N/A';
  }
  return typeof price === 'number' ? price?.tofixed(2) : price;
};
