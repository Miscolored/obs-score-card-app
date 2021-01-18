FROM python:alpine

RUN pip install flask flask_socketio==4.3.2

COPY src /src/
COPY config /config/

EXPOSE 5000

ENV FLASK_ENV development

ENTRYPOINT ["python", "/src/app.py"]