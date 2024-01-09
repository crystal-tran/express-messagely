"use strict";

const { UnauthorizedError, BadRequestError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} = require("../middleware/auth");

const Message = require("../models/message");
const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", authenticateJWT, ensureLoggedIn, async function (req, res) {
  const message = await Message.get();

  const from_user = message.from_user.username;
  const to_user = message.to_user.username;
  const user = res.local.user.username;

  if (user === from_user || user === to_user) {
    return res.json({ message });
  }
  throw new UnauthorizedError();
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
**/

router.post("/", authenticateJWT, ensureLoggedIn, async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();

  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;

  const toUserCheck = await User.get(to_username);
  if (!toUserCheck) throw new BadRequestError("to_username not found");

  const message = await Message.create({ from_username, to_username, body });

  if (message !== undefined) {
    return res.json({ message });
  }
  throw new BadRequestError("Message creation failed.");
});



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", authenticateJWT, ensureLoggedIn, async function (req,res){
  const message = await Message.get(req.params.id);
  // console.log("message", "message")
  const user = res.locals.user.username;
  const toUserCheck = message.to_user.username;
  console.log("user:", user, "toUserCheck:", toUserCheck);

  if(user === toUserCheck){
    const readMessage = await Message.markRead(req.params.id);
    return res.json({ readMessage });
  }
  throw new BadRequestError("Unauthorized to view message");
});

module.exports = router;