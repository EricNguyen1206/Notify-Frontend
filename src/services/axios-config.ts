import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// This function matches Orval's mutator signature
export const axiosInstance = <T>({
  url,
  method,
  ...config
}: {
  url: string;
  method: string;
  [key: string]: any;
}): Promise<T> => {
  return instance({
    url,
    method,
    ...config,
  });
};
