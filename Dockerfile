FROM node:18-bullseye
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y sudo bash curl systemctl
RUN curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared.deb
RUN yarn install --production
RUN mkdir -p /app/data
ENTRYPOINT bash ./run.sh
#CMD ["node", "index.js"]
EXPOSE 3000
