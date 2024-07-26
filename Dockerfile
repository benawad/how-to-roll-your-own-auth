# Stage 1: Building the code
FROM node:21-alpine as builder

# Set the working directory in the container
WORKDIR /usr/src/api

RUN npm i -g pnpm

# Copy package.json
COPY ./api/package.json ./
COPY pnpm-lock.yaml ..
COPY pnpm-workspace.yaml ..

# Install npm dependencies
RUN pnpm install

# Copy the rest of your application's source code
COPY api/ ./

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Run the built code with only production dependencies
FROM node:21-alpine

WORKDIR /usr/src/api

# Copy built artifacts from the builder stage
COPY --from=builder /usr/src/api/dist ./dist
COPY --from=builder /usr/src/api/.env.example ./.env.example
COPY --from=builder /usr/src/api/drizzle ./drizzle

# Copy package.json (to run the application) and any other necessary files
COPY api/package.json ./

RUN npm i -g pnpm
# Install only production dependencies
RUN pnpm install --only=production

ENV NODE_ENV=production

# Command to run your app
CMD ["node", "dist/index.js"]
