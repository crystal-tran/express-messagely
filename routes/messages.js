"use strict";

const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} = require("../middleware/auth");

const Message = require("../models/message");

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
router.get("/:id", authenticateJWT, ensureLoggedIn, async function (req, res){
  const message = await Message.get();

  const from_user = message.from_user.username;
  const to_user = message.to_user.username;
  const user = res.local.username;

  if(user === from_user || user === to_user){
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


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/


module.exports = router;