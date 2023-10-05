# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Build arguments for user/group configurations
ARG USER=wso2ipk
ARG USER_ID=10001
ARG USER_GROUP=wso2
ARG USER_GROUP_ID=10001
ARG USER_HOME=/home/${USER}

# Create a user group and a user
RUN addgroup -S -g ${USER_GROUP_ID} ${USER_GROUP} \
    && adduser -S -D -h ${USER_HOME} -G ${USER_GROUP} -u ${USER_ID} ${USER}

# Create app directory
WORKDIR ${USER_HOME}

# Set a non-root user
USER 10001

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY --chown=${USER}:${USER_GROUP} . .

EXPOSE 9090

CMD ["node", "server.js"]
