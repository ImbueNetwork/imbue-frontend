import type { Knex } from "knex";

import { ON_UPDATE_TIMESTAMP_FUNCTION } from "../utils";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  const usersTableName = "users";
  await knex.schema.alterTable(usersTableName, (builder) => {
    builder.text("profile_photo");
    builder.text("country");
    builder.text("region");
    builder.text("web3_address");
    builder.text("about");
    builder.text("website");
    builder.text("industry");
  });
}

export async function down(knex: Knex): Promise<void> {
  const usersTableName = "users";
  await knex.schema.alterTable(usersTableName, (builder) => {
    builder.dropColumn("profile_photo");
    builder.dropColumn("country");
    builder.dropColumn("region");
    builder.dropColumn("web3_address");
    builder.dropColumn("about");
    builder.dropColumn("website");
    builder.dropColumn("industry");
  });
}
