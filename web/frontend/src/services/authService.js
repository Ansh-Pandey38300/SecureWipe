import API_BASE_URL, { getAuthHeaders } from "./api";

export const registerUser = async (userData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Registration failed"
    );
  }

  return data;
};

export const loginUser = async (loginData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Login failed"
    );
  }

  if (data.success && data.token) {
    localStorage.setItem("securewipe_token", data.token);
  }

  return data;
};


export const getCurrentUser = async () => {
  const token = localStorage.getItem("securewipe_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to get current user"
    );
  }

  return data;
};

export const getAllUsers = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/users`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to load users"
    );
  }

  return data;
};

export const updateUserRole = async (userId, role) => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/role`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to update user role"
    );
  }

  return data;
};

export const getEligibleCenterHeads = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/eligible-center-heads`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to load workstation heads"
    );
  }

  return data;
};

export const createWorkstationCenter = async (centerData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/workstation-centers`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(centerData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to create workstation center"
    );
  }

  return data;
};