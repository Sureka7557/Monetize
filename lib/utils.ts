export const formatCurrency = (
  value: number,
  currency: string = "USD"
) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return `$${value.toFixed(2)}`;
  }
};