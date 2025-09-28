import { User, Article } from '@app/entities';
import { DataSource } from 'typeorm';

/**
 * Для полной проверки тест кейсов, неплохо было бы
 * смотреть результат записи в бд. Для этого используется
 * typeorm datasource. При желании, можно развернуть локальную
 * бд.
 *
 * testDataSource - сингелтон, создающий datasource 1 раз.
 */
let testDataSource: DataSource;

/**
 * Функция получения datasource.
 *
 * @returns DataSource.
 */
export const getTestDataSource = (): DataSource => {
  if (testDataSource) {
    return testDataSource;
  }

  testDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT as string) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'test',
    entities: [User, Article],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: true,
    logging: false,
  });

  return testDataSource;
};

/**
 * Очищает бд.
 */
export const cleanTestDatabase = async (): Promise<void> => {
  if (!testDataSource) {
    return;
  }

  await testDataSource.query('DELETE FROM articles;');
  await testDataSource.query('DELETE FROM users;');
};

/**
 * Закрывает подлкчение к бд.
 */
export const closeTestDataSource = async (): Promise<void> => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.undoLastMigration();
    await testDataSource.destroy();
  }
};
