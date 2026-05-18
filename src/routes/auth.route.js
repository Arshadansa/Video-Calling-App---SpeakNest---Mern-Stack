import express, { Router } from "express";
import { login, logout, signup , onboard} from "../controller/auth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").post(verifyJwt, logout);

router.route("/onboard").post(verifyJwt, onboard)


export default router;
