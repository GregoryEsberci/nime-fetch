import request from 'supertest';
import { app } from '@/app';
import database from '@/database/connection';
import httpStatusCodes from '@/utils/http-status-codes';

describe('GET /healthcheck', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/healthcheck')
      .expect(httpStatusCodes.OK);

    expect(response.body).toEqual({ health: true });
  });

  it('should return unhealthy status', async () => {
    jest.spyOn(database, 'select').mockImplementation(() => {
      throw new Error('Fake error');
    });

    const response = await request(app)
      .get('/healthcheck')
      .expect(httpStatusCodes.SERVICE_UNAVAILABLE);

    expect(response.body).toEqual({ health: false });
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(httpStatusCodes.NOT_FOUND);

    expect(response.body).toEqual({ error: 'Not found' });
  });
});
