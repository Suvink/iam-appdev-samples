# Build Stage
FROM python:3.9-alpine

# copy the requirements file into the image
COPY ./requirements.txt /app/requirements.txt

# switch working directory
WORKDIR /app

# install the dependencies and packages in the requirements file
RUN pip3 install -r requirements.txt

# copy every content from the local file to the image
COPY . /app

# Build arguments for user/group configurations
ARG USER=wso2
ARG USER_ID=10001
ARG USER_GROUP=wso2
ARG USER_GROUP_ID=10001
ARG USER_HOME=/home/${USER}

USER 10001

VOLUME /tmp

# configure the container to run in an executed manner
ENTRYPOINT [ "python" ]

CMD ["Service.py" ]
