"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


const User = require("../models/user");

const { BadRequestError, UnauthorizedError } = require("../expressError");

/** POST /login: {username, password} => {token} */

router.post("/login", async function(req, res){
  if(req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;
  const result = await User.authenticate(username, password);

  if (result !== true) {
    throw new UnauthorizedError("Invalid user/password.");
  }
  await User.updateLoginTimestamp(username);
  const token = jwt.sign({ username }, SECRET_KEY);
  return res.json({ token });
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function(req, res) {
  if(req.body === undefined) throw new BadRequestError();

  const { username, password, first_name, last_name, phone } = req.body;

  const result = await User.register(
    { username, password, first_name, last_name, phone }
  );

  if (result === undefined) {
    throw new BadRequestError("User registration failed.");
  }

  await User.updateLoginTimestamp(username);
  const token = jwt.sign({ username }, SECRET_KEY);
  return res.json({ token });
})

module.exports = router;