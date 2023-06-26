# Use the official Go image as the base image
FROM golang:1.19-alpine AS builder

# switch working directory
WORKDIR /app

# Copy the source code into the container
COPY . .

# Build the Go application
RUN go build -o nic-api .

# Use a small Alpine Linux image as the base image for the final container
FROM alpine:latest

# switch working directory
WORKDIR /app

# Copy the executable from the builder container
COPY --from=builder /app/nic-api .

# Build arguments for user/group configurations
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid 10014 \
    "choreo"
# Use the above created unprivileged user
USER 10014

# Set the entrypoint to the executable
ENTRYPOINT ["./nic-api"]