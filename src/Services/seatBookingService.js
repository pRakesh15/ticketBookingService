import { pool } from "../data/databaseConfig.js";

//get all seat service...
export const getAllSeatsService = async () => {
  //here i fetch the seat by order in which i can ploat them inside the ui..
  const result = await pool.query("SELECT * FROM seats ORDER BY seat_number");
  return result.rows;
};



//service for book seat by user choice like can select the seats...
export const createBooking = async (body, userId) => {
  const client = await pool.connect();
  const { seatNumbers } = body; //we make input for the seat like can chose the seat number

  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new Error("Seat numbers are required");
  }

  if (seatNumbers.length > 7) {
    throw new Error("You can book maximum 7 seats at a time");
  }

  try {
    await client.query("BEGIN");

    // Check seat availability
    const seatsQuery = await client.query(
      "SELECT * FROM seats WHERE seat_number = ANY($1::int[])",
      [seatNumbers]
    );

    if (seatsQuery.rows.length !== seatNumbers.length) {
      throw new Error("One or more seats not found");
    }
    //check if  the seats are already book..
    const alreadyBooked = seatsQuery.rows.filter((seat) => seat.is_booked);
    if (alreadyBooked.length > 0) {
      return {
        message: "One or more seats are already booked",
        bookedSeatNumbers: alreadyBooked.map((seat) => seat.seat_number),
      };
    }

    // Create booking
    const booking = await client.query(
      "INSERT INTO bookings (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
    const bookingId = booking.rows[0].id;

    // Mark seats and link to booking
    for (const seatNumber of seatNumbers) {
      const seat = await client.query(
        "SELECT id FROM seats WHERE seat_number = $1",
        [seatNumber]
      );
      const seatId = seat.rows[0].id;
      //here i mark true of seats number's.
      await client.query("UPDATE seats SET is_booked = TRUE WHERE id = $1", [
        seatId,
      ]);
      //track the booking details of the user and the seat..
      await client.query(
        "INSERT INTO booking_details (booking_id, seat_id) VALUES ($1, $2)",
        [bookingId, seatId]
      );
    }

    await client.query("COMMIT");

    return {
      message: "Booking successful",
      booking: booking.rows[0],
      seatNumbers,
    };
  } catch (err) {
    //make sure if there is any error then we rollback all the saved data in the database....
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


//function for get all my Bookings

export const getUserBookingsService = async (userId) => {
    const result = await pool.query(
      `SELECT b.id, b.created_at, b.status, 
        ARRAY_AGG(s.seat_number) as seat_numbers
      FROM bookings b
      JOIN booking_details bd ON b.id = bd.booking_id
      JOIN seats s ON bd.seat_id = s.id
      WHERE b.user_id = $1
      GROUP BY b.id
      ORDER BY b.created_at DESC`,
      [userId]
    );
  
    return result.rows;
  };


  //service for cancel the bookings by booking id 
  export const cancelBookingService = async (bookingId, userId) => {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const booking = await client.query(
        'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
        [bookingId, userId]
      );
  
      if (booking.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('Booking not found');
      }
  
      const bookingDetails = await client.query(
        'SELECT seat_id FROM booking_details WHERE booking_id = $1',
        [bookingId]
      );

      //retrive the seats from the booking like what seats are booked  by the user..
  
      const seatIds = bookingDetails.rows.map(row => row.seat_id);
  
      await client.query(
        'UPDATE bookings SET status = $1 WHERE id = $2',
        ['cancelled', bookingId]
      );

      //after successfully cancel the seats make it free.
  
      await client.query(
        'UPDATE seats SET is_booked = FALSE WHERE id = ANY($1::int[])',
        [seatIds]
      );
  
      await client.query('COMMIT');
      return 'Booking cancelled successfully';
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };
  

  //service for  booking by recommendation 
  export const bookRecommendedSeatsService = async (userId, count) => {
    const client = await pool.connect();
  
    try {

      await client.query('BEGIN');
  
      const availableSeats = await client.query(
        'SELECT * FROM seats WHERE is_booked = FALSE ORDER BY row_number, seat_number'
      );
  
      if (availableSeats.rows.length < count) {
        throw new Error('Not enough seats available');
      }
  
      const seatsByRow = {};
      availableSeats.rows.forEach(seat => {
        if (!seatsByRow[seat.row_number]) {
          seatsByRow[seat.row_number] = [];
        }
        seatsByRow[seat.row_number].push(seat);
      });
  
      let recommendedSeats = [];
  
      for (const rowNum in seatsByRow) {
        const rowSeats = seatsByRow[rowNum];
        rowSeats.sort((a, b) => a.seat_number - b.seat_number);
  
        for (let i = 0; i <= rowSeats.length - count; i++) {
          let consecutive = true;
          for (let j = 0; j < count - 1; j++) {
            if (rowSeats[i + j + 1].seat_number !== rowSeats[i + j].seat_number + 1) {
              consecutive = false;
              break;
            }
          }
          if (consecutive) {
            recommendedSeats = rowSeats.slice(i, i + count);
            break;
          }
        }
  
        if (recommendedSeats.length > 0) break;
  
        if (rowSeats.length >= count) {
          recommendedSeats = rowSeats.slice(0, count);
          break;
        }
      }
  
      if (recommendedSeats.length === 0) {
        const sortedRows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));
        let seatsNeeded = count;
  
        for (const rowNum of sortedRows) {
          const rowSeats = seatsByRow[rowNum];
          const seatsFromThisRow = Math.min(seatsNeeded, rowSeats.length);
  
          recommendedSeats = recommendedSeats.concat(rowSeats.slice(0, seatsFromThisRow));
          seatsNeeded -= seatsFromThisRow;
  
          if (seatsNeeded <= 0) break;
        }
      }
  
      const booking = await client.query(
        'INSERT INTO bookings (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
  
      const bookingId = booking.rows[0].id;
  
      for (const seat of recommendedSeats) {
        await client.query(
          'UPDATE seats SET is_booked = TRUE WHERE id = $1',
          [seat.id]
        );
  
        await client.query(
          'INSERT INTO booking_details (booking_id, seat_id) VALUES ($1, $2)',
          [bookingId, seat.id]
        );
      }
  
      await client.query('COMMIT');
  
      return {
        booking: booking.rows[0],
        seats: recommendedSeats.map(seat => ({
          id: seat.id,
          seatNumber: seat.seat_number,
          rowNumber: seat.row_number,
        })),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };


  //service for reset all bookings 
  export const resetSeatsAndBookingsService = async () => {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Reset all seats
      await client.query('UPDATE seats SET is_booked = FALSE');
  
      // Cancel all bookings
      await client.query('UPDATE bookings SET status = $1', ['cancelled']);
  
      await client.query('COMMIT');
  
      return { message: 'All seats have been reset successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };