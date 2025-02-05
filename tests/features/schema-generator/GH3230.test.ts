import { Collection, Entity, ManyToOne, MikroORM, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Author {

  @PrimaryKey({ columnType: 'mediumint' })
  id!: number;

  @Property()
  name!: string;

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  @OneToMany(() => Book, book => book.author)
  books = new Collection<Book>(this);

}

@Entity()
export class Book {

  @PrimaryKey({ columnType: 'mediumint' })
  bookId!: number;

  @Property()
  title!: string;

  @ManyToOne(() => Author)
  author!: Author;

}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    entities: [Author, Book],
    dbName: `mikro_orm_test_gh_3230`,
    type: 'mysql',
    port: 3308,
  });
  await orm.getSchemaGenerator().ensureDatabase();
  await orm.getSchemaGenerator().dropSchema();
});

afterAll(() => orm.close(true));

test('mediumint column type in mysql as FK', async () => {
  const sql = await orm.getSchemaGenerator().getCreateSchemaSQL();
  expect(sql).toMatchSnapshot();
  await orm.getSchemaGenerator().execute(sql);
  const diff = await orm.getSchemaGenerator().getUpdateSchemaSQL();
  expect(diff).toBe('');
});
