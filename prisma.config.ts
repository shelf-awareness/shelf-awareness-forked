/* eslint-disable import/no-extraneous-dependencies */
import { config } from 'dotenv';
import * as fs from 'fs';

if (fs.existsSync('.env.local')) {
  config({ path: '.env.local', override: true });
}

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});