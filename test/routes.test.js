const request = require('supertest');
const app = require('../app');//Test case for dji flight all correct paramters value

test('/api/users/current', async done => {
  jest.setTimeout(1500000);
  const response = await request(app)
    .get('/api/users/current')
  expect(response.statusCode).toBe(200);
  done();
});
// test('/flightdetails/storedetails', async done => {
//   jest.setTimeout(1500000);
//   const response = await request(app)
//     .post('/api/users/')
//     .send({
//       droneType: 'dji',
//       filename: 'DJIFlightRecord_2019-07-11_[10-08-25].txt.csv',
//       uniqueId: '11w1w232e'
//     });
//   expect(response.statusCode).toBe(200);
//   done();
// });