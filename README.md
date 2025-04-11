# Train Seat Reservation System

A full-stack application built with Next.js, Node.js (Express), and PostgreSQL for managing train seat reservations.

## Features

- User authentication (signup/login)
- Interactive train seat booking interface
- Intelligent seat recommendation algorithm
- Booking history management
- Seat cancellation functionality
- Responsive design for various screen sizes

## Technical Requirements

- **Frontend**: Next.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL (v12 or later)

### Setup Database

1. Create a PostgreSQL database:

```bash
createdb train_reservation
```

2. Initialize the database schema by executing the SQL script in `server/db/schema.sql` or use the provided schema in this README.

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:

```
PORT=5000
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=train_reservation
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_secret_key
```

4. Start the server:

```bash
npm start
```

### Frontend Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register a new user

```
POST /api/auth/register
```

Request body:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

### Seat Endpoints

#### Get all seats

```
GET /api/seats
```

Response:
```json
[
  {
    "id": 1,
    "seat_number": 1,
    "row_number": 1,
    "is_booked": false,
    "created_at": "2023-04-11T10:00:00.000Z"
  },
  // ... more seats
]
```

#### Get seat recommendations

```
POST /api/recommend-seats
```

Request body:
```json
{
  "count": 3
}
```

Response:
```json
{
  "recommendedSeats": [
    {
      "id": 1,
      "seatNumber": 1,
      "rowNumber": 1
    },
    {
      "id": 2,
      "seatNumber": 2,
      "rowNumber": 1
    },
    {
      "id": 3,
      "seatNumber": 3,
      "rowNumber": 1
    }
  ]
}
```

### Booking Endpoints

#### Create a booking

```
POST /api/bookings
```

Request headers:
```
Authorization: Bearer jwt_token
```

Request body:
```json
{
  "seatNumbers": [1, 2, 3]
}
```

Response:
```json
{
  "message": "Booking successful",
  "booking": {
    "id": 1,
    "user_id": 1,
    "created_at": "2023-04-11T10:00:00.000Z",
    "status": "active"
  },
  "seatNumbers": [1, 2, 3]
}
```

#### Get user bookings

```
GET /api/bookings
```

Request headers:
```
Authorization: Bearer jwt_token
```

Response:
```json
[
  {
    "id": 1,
    "created_at": "2023-04-11T10:00:00.000Z",
    "status": "active",
    "seat_numbers": [1, 2, 3]
  },
  // ... more bookings
]
```

#### Cancel booking

```
POST /api/bookings/:id/cancel
```

Request headers:
```
Authorization: Bearer jwt_token
```

Response:
```json
{
  "message": "Booking cancelled successfully"
}
```

#### Reset all seats (for demo purposes)

```
POST /api/reset
```

Request headers:
```
Authorization: Bearer jwt_token
```

Response:
```json
{
  "message": "All seats have been reset successfully"
}
```

## Database Schema

```sql
-- Users table to store user information
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seats table to represent all seats in the train
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  seat_number INTEGER NOT NULL UNIQUE,
  row_number INTEGER NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table to track reservations
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' -- active, cancelled
);

-- BookingDetails to track which seats are included in each booking
CREATE TABLE booking_details (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id INTEGER NOT NULL REFERENCES seats(id),
  UNIQUE(booking_id, seat_id)
);

-- Insert seat data for the train
-- 11 rows * 7 seats per row = 77 seats + 3 seats in the last row = 80 seats
DO $$
DECLARE
  row_count INTEGER := 12; -- 11 full rows and 1 partial row
  seats_per_row INTEGER := 7;
  current_seat INTEGER := 1;
BEGIN
  FOR r IN 1..row_count LOOP
    -- Last row has only 3 seats
    IF r = row_count THEN
      seats_per_row := 3;
    END IF;
    
    FOR s IN 1..seats_per_row LOOP
      INSERT INTO seats (seat_number, row_number)
      VALUES (current_seat, r);
      current_seat := current_seat + 1;
    END LOOP;
  END LOOP;
END $$;
```

## Frontend Pages

1. **Homepage**: Landing page with links to login/register
2. **Login Page**: User authentication
3. **Register Page**: New user registration
4. **Seats Page**: Interactive seat selection interface
5. **My Bookings Page**: View and manage bookings

## Booking Algorithm

The seat booking algorithm follows these priorities:

1. Book seats in the same row when possible
2. If not possible, find consecutive seats in the same row
3. If still not possible, book seats in nearby rows

The algorithm ensures that:
- User can book a maximum of 7 seats at once
- Seats are booked as close to each other as possible

## Deployment

### Backend Deployment

1. Set up a PostgreSQL database on your preferred cloud provider (AWS RDS, Digital Ocean, etc.)
2. Deploy the Express backend to a service like Heroku, Vercel, AWS Elastic Beanstalk, or Digital Ocean App Platform.
3. Set the environment variables in your deployment environment.

### Frontend Deployment

1. Build the Next.js application:

```bash
npm run build
```

2. Deploy the built application to Vercel, Netlify, or other Next.js-compatible platforms.
3. Configure the API base URL to point to your deployed backend.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.
