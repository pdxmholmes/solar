#!/bin/bash

# This assumes the latest postgres dump is at ./eve.dmp

docker run -v $(PWD)/eve.dmp:/tmp/eve.dmp -p 5432:5432 --name evedb -e POSTGRES_USER=yaml -e POSTGRES_PASSWORD=eve -d postgres

docker exec -it evedb psql -U yaml -c 'CREATE DATABASE eve;'

docker exec -it evedb pg_restore -U yaml -d eve /tmp/eve.dmp
