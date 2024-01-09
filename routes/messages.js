"use strict";

const { UnauthorizedError, BadRequestError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn } = require("../middleware/auth");

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

router.get("/:id", ensureLoggedIn, async function (req, res) {
  const message = await Message.get(req.params.id);

  const currentUsername = res.locals.user.username;

  const fromUsername = message.from_user.username;
  const toUsername = message.to_user.username;

  if (![fromUsername, toUsername].includes(currentUsername)){
    throw new UnauthorizedError();
  }

  return res.json({ message });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
**/

router.post("/", ensureLoggedIn, async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();

  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;

  try {
    const message = await Message.create({ from_username, to_username, body });
    if (message !== undefined) {
      return res.json({ message });
    }
  } catch (err) {
    throw new BadRequestError("Message creation failed.");
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res) {
  const messageData = await Message.get(req.params.id);

  console.log('read at', messageData.read_at);

  const currentUsername = res.locals.user.username;
  const toUsername = messageData.to_user.username;

  if (currentUsername !== toUsername) {
    throw new UnauthorizedError("Only recipient can read message");
  }

  // Read message if unread, otherwise return when it was read
  let message;
  if (messageData.read_at === null) {
    message = await Message.markRead(req.params.id);
  }
  else {
    message = {
      id: messageData.id,
      read_at: messageData.read_at,
    };
  }
  return res.json({ message });
});


module.exports = router;
