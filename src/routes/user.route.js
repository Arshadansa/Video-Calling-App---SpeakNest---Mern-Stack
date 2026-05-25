import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getMyFriends, getRecommendatedUsers,sendFriendRequest,outgoingFriendRequests,acceptFriendRequest,getFriendRequests } from "../controller/user.controller.js";


const router = Router();

router.route("/").get(verifyJwt,getRecommendatedUsers);
router.route("/friends").get(verifyJwt, getMyFriends);
router.route("/friends-request/:id").post(verifyJwt, sendFriendRequest);
router.route("/friends-request/:id/accept").put(verifyJwt, acceptFriendRequest);
router.route("/friends-requests",).get(verifyJwt,getFriendRequests);
router.route("/outgoing-friend-requests").get(verifyJwt,outgoingFriendRequests);

export default router;