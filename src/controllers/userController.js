import { catchError } from "../../middlewares/catchError.js";
import ErrorHendler from "../../utils/errorHandler.js";
import { sendToken } from "../../utils/sendToken.js";
import { createUser, loginUserService } from "../Services/authService.js";

//create a userRegister controller
//here i catch the error in a global error handling format
//for extra sefty im using try catch but in this the catchError is not working properly
export const registerUser = catchError(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(new ErrorHendler("plz fill all the field", 400));
    }
    const { user } = await createUser({ username, email, password });
    // console.log(user)
    sendToken(res, user, "Register successfully", 201);
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(400).json({ message: error.message || "Server error" });
  }
});

//create a function for login user

export const loginUser = catchError(async (req, res,next) => {
    const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHendler("plz fill all the field", 400));
  }
  try {
    const result = await loginUserService({email,password});
    // res.json(result);
    const newUser=result.user;
    sendToken(res, newUser, `welcome back  ${newUser.username}`, 201);
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Server error" });
  }
});
