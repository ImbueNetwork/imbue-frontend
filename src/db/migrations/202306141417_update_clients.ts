import type { Knex } from "knex";
import { ON_UPDATE_TIMESTAMP_FUNCTION } from "../utils";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  const clientsTableName = "clients";
  await knex.schema.alterTable(clientsTableName, (builder) => {
    // username must be unique.
    builder.text("website");
    builder.text("logo");
  });
}

export async function down(knex: Knex): Promise<void> {
  const clientsTableName = "clients";
  await knex.schema.alterTable(clientsTableName, (builder) => {
    builder.dropColumn("website");
    builder.dropColumn("logo");
  });
}
