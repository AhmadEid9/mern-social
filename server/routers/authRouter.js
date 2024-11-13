import { Router } from "express";
import { userLogin, userSignUp, userLogOut } from "../controllers/authController.js";

const router = Router();

router.post("/signup", userSignUp);

router.post("/login", userLogin);

router.post("/logout", userLogOut);

export default router;