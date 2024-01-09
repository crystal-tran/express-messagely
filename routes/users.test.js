"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const User = require("../models/user");

let token;
beforeEach(async function() {
  let response = await request(app)
    .post("/auth/register")
    .send({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000"
  });
  token = response.body.token;
});

describe("User Routes Test", function () {


  test("get list of users", async function(){

  })
});