import axios from "axios";

export const getConnectChannels = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/`);
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return [];
  }
};