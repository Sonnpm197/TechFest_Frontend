import axios, { AxiosResponse } from "axios";

export const getLoginUser = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/auth/user-info`,
      {
        // tells the browser to include credentials like cookies,
        // authorization headers, or TLS client certificates when making a cross-origin request.
        withCredentials: true,
      }
    );
    return response.data.userName;
  } catch (err) {
    console.error(err);
    return null;
  }
};
