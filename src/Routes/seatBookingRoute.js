import express from 'express';

import { bookRecommendedSeatsController, cancelBookingController, createSeatBooking, getAllSeats, getUserBookingsController, resetSeatsAndBookingsController } from "../controllers/seatBookingController.js";
import authenticateToken from '../../middlewares/auth.js';

const router = express.Router();

router.get('/allSeat', getAllSeats)
.post("/bookingSeats",authenticateToken,createSeatBooking)
.get("/getMyBookings",authenticateToken,getUserBookingsController)
.post("/bookings/cancel/:id",authenticateToken,cancelBookingController)
.post("/bookSeatByRecommendation",authenticateToken,bookRecommendedSeatsController)
.post("/reset",resetSeatsAndBookingsController);

export default router;