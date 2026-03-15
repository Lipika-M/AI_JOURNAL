import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 1 },    // ramp-up from 1 VU
    { duration: '2m', target: 20 },   // ramp to 20 VUs
    { duration: '1m', target: 20 },   // hold at 20 VUs
    { duration: '1m', target: 0 }     // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'], // keep p95 latency under 150ms
    http_req_failed: ['rate<0.01']    // <1% requests fail
  },
};

export default function () {
  const payload = JSON.stringify({ title: 'FAANG Free-Tier Test', content: 'Edge + Backend Load Test' });
  const params = { headers: { 'Content-Type': 'application/json' } };

  // Test GET first, then POST
  let getRes = http.get('https://d3sz5t05wxp00y.cloudfront.net/dashboard');
  check(getRes, {
    'GET status 200': r => r.status === 200,
    'GET body not empty': r => r.body.length > 0,
  });

  let postRes = http.post('https://d3sz5t05wxp00y.cloudfront.net/dashboard', payload, params);
  check(postRes, {
    'POST status 200': r => r.status === 200,
    'POST body not empty': r => r.body.length > 0,
  });
}
