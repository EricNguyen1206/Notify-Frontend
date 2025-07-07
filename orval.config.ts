// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  chatService: {
    input: './docs/swagger.json',
    output: {
      mode: 'tags-split',
      target: './src/api/endpoints',
      schemas: './src/api/schemas',
      client: 'react-query',
    },
  },
});
