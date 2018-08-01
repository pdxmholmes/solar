#!/bin/bash

DBPORT=45432

curl https://www.fuzzwork.co.uk/dump/postgres-schema-latest.dmp.bz2 --output $PWD/postgres-schema-latest.dmp.bz2
bunzip2 -f $PWD/postgres-schema-latest.dmp.bz2
rm -f $PWD/postgres-schema-latest.dmp.bz2

docker rm -f evedb > /dev/null 2>&1|| true
docker run -v $PWD/postgres-schema-latest.dmp:/tmp/postgres-schema-latest.dmp -p $DBPORT:5432 --name evedb -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -d postgres

echo 'Waiting for DB to start...'
sleep 10

docker exec -it evedb psql -U root -c "CREATE ROLE yaml WITH LOGIN PASSWORD 'eve' IN ROLE postgres;"
docker exec -it evedb psql -U root -c "CREATE DATABASE eve;"
docker exec -it evedb psql -U root -c "GRANT ALL PRIVILEGES ON DATABASE eve TO yaml;"

docker exec -it evedb pg_restore -U yaml -d eve /tmp/postgres-schema-latest.dmp
