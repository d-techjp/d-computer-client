FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_API_BASE_URL=/api/v1
ENV NEXT_PUBLIC_SITE_URL=https://d-techjp.com
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAF9sMcdl5gvlLGsj
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=675769604131-p5emsjsjnc9c3r3215keo9af6cnb1ue6.apps.googleusercontent.com

RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]