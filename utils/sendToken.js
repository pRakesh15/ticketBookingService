import Jwt from "jsonwebtoken";

   

export const sendToken=(res,user,message,statusCode)=>
{
    const token= Jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "15D",
      });
    //   console.log(token);
    const options={
        httpOnly:true,
        expires:new Date(Date.now()+15*24*60*60*1000),
        secure:true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    }

    res.status(statusCode).json({
        success:true,
        message,
        user,
        token
    });
}