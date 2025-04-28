const API_BASE_URL = "http://localhost:8000";

export const getItemsData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data; // Return the array of item data
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error; // Re-throw the error so the component can handle it
  }
};
