FROM ghcr.io/puppeteer/puppeteer:20.8.0
WORKDIR /app
# Install dependencies
COPY --chown=pptruser:pptruser package*.json yarn.lock .env ./
RUN yarn

# Copy app files
COPY --chown=pptruser:pptruser . . 

#Build Typescript code to Javascript
RUN yarn prisma generate
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Define the startup command
CMD ["yarn", "start"]