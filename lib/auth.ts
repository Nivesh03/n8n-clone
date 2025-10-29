import { checkout, polar, portal } from '@polar-sh/better-auth'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './db'
import { polarClient } from './polar'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: 'cee80220-e808-4823-98d2-207cdab68c08',
              slug: 'pro',
            },
          ],
          authenticatedUsersOnly: true,
          successUrl: process.env.POLAR_SUCCESS_URL,
        }),
        portal(),
      ],
    }),
  ],
})
