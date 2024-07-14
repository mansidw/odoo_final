export const setToken = async (token) => {
  await localStorage.setItem("authToken", token);
};
export const getToken = async () => {
  let token = await localStorage.getItem("authToken");
  return token;
};
