# Build Stage
FROM node:20-alpine AS BUILD_IMAGE
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# Production Stage
FROM node:20-alpine AS PRODUCTION_STAGE
WORKDIR /app

ENV NODE_ENV production

# Build arguments for user/group configurations
ARG USER=wso2
ARG USER_ID=10001
ARG USER_GROUP=wso2
ARG USER_GROUP_ID=10001
ARG USER_HOME=/home/${USER}

RUN addgroup -S -g ${USER_GROUP_ID} ${USER_GROUP} \
    && adduser -S -D -H -h ${USER_HOME} -s /sbin/nologin -G ${USER_GROUP} -u ${USER_ID} ${USER}

RUN npm -v 

COPY --from=BUILD_IMAGE --chown=${USER}:${USER_GROUP} /app/.next ${USER_HOME}/.next
COPY --from=BUILD_IMAGE /app/node_modules ${USER_HOME}/node_modules
COPY --from=BUILD_IMAGE /app/package.json ${USER_HOME}/package.json
# COPY --from=BUILD_IMAGE /app/public ${USER_HOME}./public

USER 10001

WORKDIR ${USER_HOME}
VOLUME /tmp

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
