import { PrismaConfig } from '@prisma/config-engine'

export default {
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
} satisfies PrismaConfig
