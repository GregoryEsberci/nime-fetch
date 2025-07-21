import {
  SelectedFields,
  SQLiteInsertValue,
  SQLiteSelectBuilder,
  SQLiteTable,
  SQLiteUpdateSetSource,
} from 'drizzle-orm/sqlite-core';
import database from '../connection';
import Database from 'better-sqlite3';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { now } from '@/utils/db';
import { eq } from 'drizzle-orm';

export default abstract class Repository<T extends SQLiteTable = SQLiteTable> {
  abstract readonly schema: T;

  constructor(public db: BetterSQLite3Database = database) {}

  select<T extends SelectedFields | undefined = undefined>(fields?: T) {
    const select: SQLiteSelectBuilder<T, 'sync', Database.RunResult, 'db'> =
      fields ? this.db.select(fields) : (this.db.select() as never);

    return select.from(this.schema);
  }

  create(data: SQLiteInsertValue<T> | SQLiteInsertValue<T>[]) {
    // TS complains because of overloads, and I don't want to handle it with JS now
    return this.db.insert(this.schema).values(data as SQLiteInsertValue<T>);
  }

  update(data: SQLiteUpdateSetSource<T>) {
    return this.db.update(this.schema).set({ updatedAt: now, ...data });
  }

  delete() {
    return this.db.delete(this.schema);
  }

  updateById(id: number, data: SQLiteUpdateSetSource<T>) {
    return this.update(data)
      .where(eq((this.schema as any).id, id))
      .run();
  }
}
