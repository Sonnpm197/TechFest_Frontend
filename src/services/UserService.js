import axios, { AxiosResponse } from "axios";

export const getLoginUser = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/auth/user-info`,
      {
        withCredentials: true,
      }
    );
    return response.data.userName;
  } catch (err) {
    console.error(err);
    return null;
  }
};
