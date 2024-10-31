import { sql, GeneratedAlways, Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";

interface Database {
  person: PersonTable;
}

interface PersonTable {
  id: GeneratedAlways<number>;
  first_name: string;
  gender: "male" | "female" | "other";
}

const db = new Kysely<Database>({
  dialect: new NeonDialect({
    connectionString: process.env.DATABASE_URL,
  }),
});

if (!process.env.DATABASE_URL) {
  console.error("Please set DATABASE_URL in .env");
}

const main = async () => {
  //await db.schema.dropTable('person').execute()

  await db.schema
    .createTable("person")
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("first_name", "varchar(255)")
    .addColumn("last_name", "varchar(255)")
    .addColumn("metadata", "varchar(255)")
    .addColumn("gender", "varchar(50)")
    .addColumn("created_at", "timestamp", (cb) =>
      cb.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  const a = await db
    .insertInto("person")
    .values({ first_name: "Jennifer", gender: "female" })
    .returning(["id", "first_name", "gender"])
    .executeTakeFirstOrThrow();

  console.log(a);
  try {
    await sql`truncate table ${sql.table("person")}`.execute(db);
    await db.schema.dropTable("person").execute();
  } catch (err) {
    console.log(`dropTable fail.`);
  } finally {
    process.exit(0);
  }
};

main();
