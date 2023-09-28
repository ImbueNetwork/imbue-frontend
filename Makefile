DBDIR := "./src/db"


all: clean_build

clean:
	rm -rf .next

clean_build: clean
	yarn install --force
	yarn build
	
migrate: migrate_latest

migrate_latest: 
	yarn run knex --cwd "./src/db" migrate:latest

migrate_up: node_modules
	yarn run knex --cwd ${DBDIR} migrate:up

migrate_down: node_modules
	yarn run knex --cwd ${DBDIR} migrate:down

migrate_reset: node_modules
	/bin/bash -c '\
	    while [ "x$${OUT/Already at the base migration}" == "x$${OUT}" ]; do\
	        export OUT="$$(yarn run knex --cwd ${DBDIR} migrate:down)";\
		echo "$$OUT";\
	    done;\
	'
seed:
	yarn run knex --cwd "./src/db" seed:run

db_seed: migrate seed

db_up: migrate

db_down: migrate_reset

cmd: npm run build
	db_up
	yarn start

.PHONY: all clean clean_build clean_deps build \
	migrate migrate_latest migrate_up migrate_down migrate_reset \
	seed db_up db_down \
	cmd start
