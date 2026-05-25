import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controller/chat.controller.js";

const router = Router();

router.route("/token").get(verifyJwt,getStreamToken)


export default router;