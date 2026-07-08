const request = require('supertest');
const app = require('../index');
const fs = require('fs');
const path = require('path');

// Mock llmService to avoid hitting the actual API during tests
jest.mock('../services/llmService', () => ({
  processCSVBatch: jest.fn().mockImplementation(async (batch) => {
    return batch.map(row => ({
      name: row['Full Name'],
      email: row['Primary Email'],
      mobile_without_country_code: row['Phone 1'],
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
      data_source: 'leads_on_demand'
    }));
  })
}));

describe('API Tests', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('POST /api/upload should reject request without file', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('No CSV file uploaded');
  });

  it('POST /api/upload should process valid CSV', async () => {
    const testCsvPath = path.join(__dirname, 'test.csv');
    fs.writeFileSync(testCsvPath, 'Full Name,Primary Email,Phone 1\\nTest User,test@example.com,1234567890');

    const res = await request(app)
      .post('/api/upload')
      .attach('csv', testCsvPath);

    expect(res.statusCode).toEqual(200);
    expect(res.body.total_imported).toEqual(1);
    expect(res.body.successfully_parsed.length).toEqual(1);
    expect(res.body.successfully_parsed[0].name).toEqual('Test User');
    
    fs.unlinkSync(testCsvPath);
  });
});
