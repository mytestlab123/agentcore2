FROM --platform=$BUILDPLATFORM python:3.12-slim AS dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --no-compile --target /deps -r requirements.txt

FROM --platform=linux/arm64 python:3.12-slim
WORKDIR /app
# boto3 and its dependencies are pure Python. Build them on
# the host platform; only the execution environment must be ARM64.
COPY --from=dependencies /deps /opt/deps
ENV PYTHONPATH=/opt/deps
COPY service.py rpc.py server.py ./
EXPOSE 8080
CMD ["python", "server.py"]
