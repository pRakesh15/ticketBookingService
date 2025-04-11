import { pool } from "../data/databaseConfig.js";
import bcrypt from 'bcryptjs';

export const createUser = async ({ username, email, password }) => {
  
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
  
    if (userExists.rows.length > 0) {
        throw new Error('User already exists');
    }
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    //i can make the toke in a common function in utils also..
    return {
      user: newUser.rows[0],
      
    };
  };

  //service for login user...

  export const loginUserService = async ({ email, password }) => {

  
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];
  
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 400;
      throw err;
    }
  
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const err = new Error('Invalid credentials');
      err.status = 400;
      throw err;
    }
  
    return { 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  };