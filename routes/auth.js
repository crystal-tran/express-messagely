"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


const User = require("../models/user");
const Message = require("../models/message");
const { BadRequestError, UnauthorizedError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post("/login", async function(req, res, next){
  if(req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;
  const result = await User.authenticate(username, password);

  if(result){
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid user/password.");

});




/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

module.exports = router;