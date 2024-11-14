import { Router } from "express";
import { userLogin, userSignUp, userLogOut, getMe } from "../controllers/authController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = Router();

router.post("/signup", userSignUp);

router.post("/login", userLogin);

router.post("/logout", userLogOut);

router.get('/me', protectRoute, getMe)

export default router;