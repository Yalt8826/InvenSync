export const getTotalRevenue = async () => {
  const res = await fetch("http://localhost:8000/orders/total-revenue/");
  const json = await res.json();
  return json.total_revenue;
};
