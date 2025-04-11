import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import express from 'express'
import authRoutes from './src/Routes/userRouter.js';
import seatRout from './src/Routes/seatBookingRoute.js';


 const app=express();

config();
//these are the basic middlewares..
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get("/",async(req,res)=>{
//     const email="rp5865442@gmail.com"
//     const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
// res.send(user.rows);
// })
app.get("/",(req,res)=>{
    
res.send("JAY SHREE RAM");
})

//add the user router
app.use("/api/v1/user",authRoutes)

//add the seat routs
app.use("/api/v1/seat",seatRout)



export default app;