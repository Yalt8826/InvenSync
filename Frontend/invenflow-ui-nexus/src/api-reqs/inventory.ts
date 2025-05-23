export const getInventoryData = async () => {
  const res = await fetch("http://localhost:8000/inventory");
  const json = await res.json();
  return json?.data || [];
};
