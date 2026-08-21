const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("securewipe_token");

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

export default API_BASE_URL;