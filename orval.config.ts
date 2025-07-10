// orval.config.ts
import { defineConfig } from 'orval';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Set in your .env file
});

export default defineConfig({
  chatService: {
    input: './docs/swagger.json',
    output: {
      mode: 'tags-split',
      target: './src/services/endpoints',
      schemas: './src/services/schemas',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/services/axios-config.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
});
