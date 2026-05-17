const request = require('supertest');
const app = require('../src/app');
const { resetTodos } = require('../src/routes/todos');

// Reset in-memory store before each test for isolation
beforeEach(() => {
  resetTodos();
});

describe('Health Check', () => {
  test('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/todos', () => {
  test('returns empty array initially', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns list of todos after creation', async () => {
    await request(app).post('/api/todos').send({ title: 'Test todo' });
    const res = await request(app).get('/api/todos');
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Test todo');
  });
});

describe('POST /api/todos', () => {
  test('creates a todo and returns 201', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy groceries' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Buy groceries');
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  test('returns 400 if title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  test('returns 400 if title is empty string', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.statusCode).toBe(400);
  });
});

describe('PATCH /api/todos/:id', () => {
  test('toggles completed status', async () => {
    const created = await request(app)
      .post('/api/todos')
      .send({ title: 'Toggle me' });

    const id = created.body.id;

    const toggled = await request(app).patch(`/api/todos/${id}`);
    expect(toggled.body.completed).toBe(true);

    const toggledBack = await request(app).patch(`/api/todos/${id}`);
    expect(toggledBack.body.completed).toBe(false);
  });

  test('returns 404 for non-existent id', async () => {
    const res = await request(app).patch('/api/todos/fake-id-999');
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/todos/:id', () => {
  test('deletes a todo and returns 204', async () => {
    const created = await request(app)
      .post('/api/todos')
      .send({ title: 'Delete me' });

    const id = created.body.id;
    const del = await request(app).delete(`/api/todos/${id}`);
    expect(del.statusCode).toBe(204);

    const list = await request(app).get('/api/todos');
    expect(list.body.length).toBe(0);
  });

  test('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/todos/fake-id-999');
    expect(res.statusCode).toBe(404);
  });
});
