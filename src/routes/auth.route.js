import express, { Router } from "express";
import {
  login,
  logout,
  signup,
  onboard,
} from "../controller/auth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";

const router = Router();

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").post(verifyJwt, logout);

router.route("/onboard").post(verifyJwt, onboard);

router.route("/me").get(verifyJwt, (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

export default router;
