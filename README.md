# AI Journal

Production-grade AI-powered journaling platform with asynchronous AI processing, cloud deployment on AWS, and real-time analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [DevOps and Infrastructure](#devops-and-infrastructure)
- [Observability and Monitoring](#observability-and-monitoring)
- [Security](#security)
- [Performance and Optimization](#performance-and-optimization)
- [Load Testing (k6)](#load-testing-k6)
- [CI/CD Pipeline](#cicd-pipeline)
- [Live Demo](#live-demo)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)
- [Author](#author)

## Overview

AI Journal is a full-stack application where users can create, manage, and analyze journal entries with AI-generated insights.

The platform is built for practical production use:
- Asynchronous AI processing through AWS SQS + worker
- Redis caching for analytics and repeated reads
- Cloud deployment using EC2, S3, CloudFront, and Nginx
- Process management and zero-downtime reloads with PM2
- Monitoring with AWS CloudWatch

## Features

- JWT-based authentication and protected routes
- Journal CRUD operations
- AI sentiment analysis, mood score, and summaries
- Automatic AI re-analysis when journal content is updated
- Analytics dashboard (mood trends, sentiment distribution, tag insights)
- Search journals by title, content, and tags
- Asynchronous queue-based processing with AWS SQS
- Redis cloud cache support for faster response times
- Hardened backend middleware stack with Helmet and Morgan

## Architecture

```text
Frontend (React + Vite)
        |
        v
AWS S3 (Static Hosting)
        |
        v
CloudFront (CDN + Caching)
        |
        v
Nginx (Reverse Proxy)
        |
        v
EC2 (Node.js + Express API via PM2)
        |
        +--------------------+---------------------+
        |                    |                     |
        v                    v                     v
 MongoDB Atlas            Redis                AWS SQS
 (Database)             (Cache)                (Queue)
                                               |
                                               v
                                      Worker (AI Processing)
```

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas + Mongoose
- Redis
- AWS SQS
- JWT Authentication
- Zod validation
- bcrypt
- Morgan
- Helmet
- PM2

### Frontend
- React (TypeScript)
- Vite
- Axios
- React Router

### Cloud and Infra
- AWS EC2 (backend hosting)
- AWS S3 (frontend static hosting)
- AWS CloudFront (global CDN + cache)
- AWS CloudWatch (logs and monitoring)
- AWS IAM (access control and least-privilege roles)
- Nginx (reverse proxy)

### Testing and Quality
- k6 load testing

## DevOps and Infrastructure

- Deployed on AWS Free Tier architecture
- Frontend hosted on S3 and delivered by CloudFront
- Backend hosted on EC2 behind Nginx reverse proxy
- PM2 manages Node processes and supports zero-downtime reloads
- IAM policies/roles used for secure service permissions
- Redis cloud cache improves latency and reduces repeated DB load

## Observability and Monitoring

- AWS CloudWatch for instance and application monitoring
- PM2 logs for process-level debugging and runtime diagnostics
- CloudFront cache behavior tracking (Hit/Miss)
- Morgan request logging for API traffic visibility

## Security

- Helmet secures HTTP headers
- JWT auth for session security
- bcrypt password hashing
- Input validation using Zod
- IAM role-based access control for AWS resources

## Performance and Optimization

- Asynchronous processing with AWS SQS reduces API blocking
- Redis cache lowers repeated computation and read latency
- CloudFront CDN improves frontend delivery speed globally
- PM2 zero-downtime reloads minimize service interruption

## Load Testing (k6)

Load test executed with script `load-tests/test-journals.js`.

### Performance Snapshot

- Latency (p95): `63.78ms`
- Latency (avg): `29.32ms`
- Throughput (HTTP): `345.86 req/s`
- Throughput (iterations): `172.93 iter/s`
- Error rate: `0.00%`

### Scenario
- 1 scenario
- Up to 20 VUs
- 5m duration over 4 stages (with graceful ramp down/stop)

### Thresholds
- `http_req_duration`: `p(95)=63.78ms` (threshold `p(95)<150` passed)
- `http_req_failed`: `0.00%` (threshold `rate<0.01` passed)

### Total Results
- Checks total: `207,520`
- Checks succeeded: `100.00%` (`207,520/207,520`)
- Checks failed: `0.00%` (`0/207,520`)
- HTTP requests: `103,760`
- Iterations: `51,880`
- VUs max: `20`

### HTTP Metrics
- `http_req_duration`: avg `29.32ms`, med `20.51ms`, p(90) `49.93ms`, p(95) `63.78ms`, max `1.61s`
- `http_req_failed`: `0.00%` (`0/103,760`)

### Execution Metrics
- `iteration_duration`: avg `59.53ms`, med `45.28ms`, p(90) `94.68ms`, p(95) `114.84ms`, max `2.5s`

### Network Metrics
- Data received: `83 MB`
- Data sent: `9.4 MB`

### Bottleneck Analysis

- Primary bottleneck observed at tail latency under peak load, not average latency.
- Evidence: request max latency reached `1.61s` while p95 remained `63.78ms`, indicating intermittent slow paths.
- Most likely pressure points in this architecture are AI job enqueue/processing boundaries, database write contention, and occasional cache misses.
- Practical next step: instrument endpoint-level timing (API route, DB query, SQS enqueue, Redis hit/miss) in CloudWatch to isolate which stage causes the long-tail spikes.

## CI/CD Pipeline

Suggested GitHub Actions flow for `main` branch deployments:

1. Checkout repository
2. Install backend dependencies
3. Run backend checks/tests (if configured)
4. Build frontend (Vite)
5. Deploy frontend to S3
6. Invalidate CloudFront cache
7. Deploy backend to EC2 (SSH)
8. Reload PM2 process with zero downtime

## Live Demo

- Live Website: [https://ai-journal-dun.vercel.app/](https://ai-journal-dun.vercel.app/)
<!-- Previous AWS CloudFront deployment (https://d3sz5t05wxp00y.cloudfront.net/) moved to Vercel for cost optimization. -->
- Demo Video: [https://youtu.be/TUG6KXk9c4Y](https://youtu.be/TUG6KXk9c4Y?si=47uG7v9hzXgBEoH7)

[![Demo Video](https://img.youtube.com/vi/TUG6KXk9c4Y/maxresdefault.jpg)](https://youtu.be/TUG6KXk9c4Y?si=47uG7v9hzXgBEoH7)

## Installation

```bash
git clone <repository-url>
cd AI_JOURNAL
```

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

HUGGINGFACE_API_KEY=your_huggingface_api_key
GROQ_API_KEY=your_groq_api_key

AWS_REGION=your_aws_region
SQS_QUEUE_URL=your_sqs_queue_url
```

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Running the Application

### Development

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### Production (Typical)

- Frontend built and uploaded to S3, served through CloudFront
- Backend process started/reloaded via PM2 on EC2 behind Nginx

## Project Structure

```text
AI_JOURNAL/
|-- backend/
|   |-- ecosystem.config.js
|   |-- src/
|   |   |-- app.js
|   |   |-- controllers/
|   |   |-- models/
|   |   |-- routers/
|   |   |-- services/
|   |   |-- workers/
|   |   `-- utils/
|   `-- public/
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- routes/
|   |   `-- types/
|   `-- public/
|-- load-tests/
|   `-- test-journals.js
|-- README.md
`-- package.json
```

## API Endpoints

### Auth
- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/logout`
- `POST /api/v1/users/refresh-token`

### Journals
- `POST /api/v1/journals`
- `GET /api/v1/journals`
- `GET /api/v1/journals/:id`
- `PUT /api/v1/journals/:id`
- `DELETE /api/v1/journals/:id`

### Analytics
- `GET /api/v1/analytics/mood-trends`
- `GET /api/v1/analytics/sentiment-distribution`
- `GET /api/v1/analytics/tags-distribution`
- `GET /api/v1/analytics/average-mood-by-tag`

## License

ISC License

## Author

Lipika Mandal
