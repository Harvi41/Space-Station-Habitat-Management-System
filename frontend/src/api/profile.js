const BASE_URL = "http://localhost:5000/api/profile";

const getToken = () => localStorage.getItem("token");

export const getProfile = async () => {
  const res = await fetch(BASE_URL, {
    headers: { Authorization: getToken() },
  });
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${BASE_URL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const changePassword = async (data) => {
  const res = await fetch(`${BASE_URL}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
};