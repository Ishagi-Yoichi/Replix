FROM postgres:16@sha256:d4c3314b2dd74ff23cd6cd07e4d7e737cb6ef791c22a7cbd744cfbfb4815df72

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       git build-essential postgresql-server-dev-16 \
  && git clone https://github.com/eulerto/wal2json.git /tmp/wal2json \
  && cd /tmp/wal2json && make && make install \
  && rm -rf /var/lib/apt/lists/* /tmp/wal2json
