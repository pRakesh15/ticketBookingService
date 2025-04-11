import ErrorHendler from "../../utils/errorHandler.js";
import { bookRecommendedSeatsService, cancelBookingService, createBooking, getAllSeatsService, getUserBookingsService, resetSeatsAndBookingsService } from "../Services/seatBookingService.js";


//controller for get all the seat available 
export const getAllSeats = async (req, res) => {
    try {
      const seats = await getAllSeatsService();
      res.json(seats);
    } catch (error) {
      console.error('Error fetching seats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //controller for make booking  by chose the seat number 

  export const createSeatBooking = async (req, res) => {
    try {
      const result = await createBooking(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //controller for get all the bookings of my
  export const getUserBookingsController = async (req, res) => {
    try {
      const userId = req.user.id;
      const bookings = await getUserBookingsService(userId);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //controller for cancel the bookings by booking  id
  export const cancelBookingController = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      const result = await cancelBookingService(id, userId);
      res.json({ message: result });
    } catch (error) {
      console.error('Error while cancelling the  booking:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


  //create  a controller for book the seats through recommendation like if i enter 6 then contiguously take the seats..

  export const bookRecommendedSeatsController = async (req, res,next) => {
    try {
        const { count } = req.body;
        if (!count || count <= 0 || count > 7) {
            return next(new ErrorHendler("Please provide a valid seat count between 1 and 7", 403));
            // throw new Error('Please provide a valid seat count between 1 and 7');
          }
      const userId = req.user.id;
  
      const result = await bookRecommendedSeatsService(userId, count);
  
      res.status(201).json({
        message: 'Seats booked successfully',
        booking: result.booking,
        seats: result.seats,
      });
    } catch (error) {
      console.error('Error booking recommended seats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //controller for reset  the bookings
  export const resetSeatsAndBookingsController = async (req, res) => {
    try {
      const result = await resetSeatsAndBookingsService();
      res.json(result);
    } catch (error) {
      console.error('Error resetting seats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  