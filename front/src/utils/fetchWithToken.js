export const fetchWithToken = async (url, options = {}) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) throw new Error("No token found. Please log in.");

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // No refresh-token flow in this app: clear auth and redirect to login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};
