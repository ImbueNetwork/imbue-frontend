import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  const tableName = "saved_briefs";
  await knex.schema.createTable(tableName, (builder) => {
    builder.increments("id", { primaryKey: true });
    builder.text("headline");

    builder.text("description");
    builder.integer("scope_id");
    builder.integer("duration_id");
    builder.bigInteger("budget");
    builder.integer("experience_id");
    builder.integer("project_id");
    builder.foreign("project_id").references("projects.id");
    builder.integer("brief_id");

    // stored in its own table
    // The foreign key is put on in the experience migration.
    builder.integer("user_id");
    builder.foreign("user_id").references("users.id");
    // stored in its own table
    // The foreign key is put on in the experience migration.

    auditFields(knex, builder);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("drop table saved_briefs cascade");
}
