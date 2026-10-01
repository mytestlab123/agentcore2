FROM --platform=linux/arm64 python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY service.py rpc.py server.py ./
EXPOSE 8080
CMD ["python", "server.py"]
