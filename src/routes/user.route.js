import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getMyFriends, getRecommendatedUsers,sendFriendRequest } from "../controller/user.controller.js";


const router = Router();

router.route("/").get(verifyJwt,getRecommendatedUsers);
router.route("/friends").get(verifyJwt, getMyFriends);
router.route("/friends/:id").post(verifyJwt, sendFriendRequest);
export default router;