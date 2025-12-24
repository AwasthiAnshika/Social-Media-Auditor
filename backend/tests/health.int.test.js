const request = require('supertest');
const app = require('../src/app');

describe('Health API', () => {
  it('GET /health responds with constant template', async () => {
    const res = await request(app).get('/health').expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');

    expect(res.body.data).toMatchObject({
      status: 'up',
    });
  });
});
