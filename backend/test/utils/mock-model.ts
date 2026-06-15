/**
 * Test helpers for unit-testing services that depend on Mongoose models.
 *
 * Services here are heavy on chainable queries
 * (`model.find(...).sort(...).limit(...).lean().exec()`), so a plain `jest.fn()`
 * is not enough. `mockQuery(result)` returns a chainable object where every
 * builder method returns `this` and `.exec()` resolves to `result`.
 *
 * `createMockModel()` wires the common model methods to return fresh chainable
 * queries by default; individual tests override per call with
 * `model.findById.mockReturnValue(mockQuery(doc))`.
 */

export type MockQuery<T = unknown> = {
  sort: jest.Mock;
  limit: jest.Mock;
  skip: jest.Mock;
  select: jest.Mock;
  lean: jest.Mock;
  populate: jest.Mock;
  exec: jest.Mock<Promise<T>, []>;
};

/** A chainable Mongoose query stub whose `.exec()` resolves to `result`. */
export function mockQuery<T>(result: T): MockQuery<T> {
  const query: Partial<MockQuery<T>> = {};
  for (const method of [
    'sort',
    'limit',
    'skip',
    'select',
    'lean',
    'populate',
  ] as const) {
    query[method] = jest.fn(() => query) as jest.Mock;
  }
  query.exec = jest.fn(() => Promise.resolve(result)) as jest.Mock<
    Promise<T>,
    []
  >;
  return query as MockQuery<T>;
}

export type MockModel = {
  find: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  exists: jest.Mock;
  aggregate: jest.Mock;
  create: jest.Mock;
  insertMany: jest.Mock;
  findOneAndUpdate: jest.Mock;
  updateOne: jest.Mock;
  updateMany: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
  countDocuments: jest.Mock;
};

/**
 * A mock Mongoose model. Read methods default to "no results" so a test that
 * forgets to stub one fails loudly (NotFound) rather than silently passing.
 */
export function createMockModel(): MockModel {
  return {
    find: jest.fn(() => mockQuery([])),
    findById: jest.fn(() => mockQuery(null)),
    findOne: jest.fn(() => mockQuery(null)),
    exists: jest.fn(() => mockQuery(null)),
    aggregate: jest.fn(() => mockQuery([])),
    create: jest.fn(),
    insertMany: jest.fn(),
    findOneAndUpdate: jest.fn(() => mockQuery(null)),
    updateOne: jest.fn(() => mockQuery({ upsertedCount: 0, modifiedCount: 0 })),
    updateMany: jest.fn(() => mockQuery({ modifiedCount: 0 })),
    deleteOne: jest.fn(() => mockQuery({ deletedCount: 0 })),
    deleteMany: jest.fn(() => mockQuery({ deletedCount: 0 })),
    countDocuments: jest.fn(() => mockQuery(0)),
  };
}
