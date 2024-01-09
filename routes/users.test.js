"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const TEST_USER_1 = {
  username: "test1",
  password: "password",
  first_name: "Test1",
  last_name: "Testy1",
  phone: "+14155550000"
};

const TEST_USER_2 = {
  username: "test2",
  password: "password2",
  first_name: "Test2",
  last_name: "Testy2",
  phone: "+14155550002"
};


describe("User Routes Test", function () {

  let user1Token;
  let user2Token;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    const user1Resp = await request(app)
      .post("/auth/register")
      .send(TEST_USER_1);
    user1Token = user1Resp.body.token;

    const user2Resp = await request(app)
      .post("/auth/register")
      .send(TEST_USER_2);
    user2Token = user2Resp.body.token;
  });

  test("get list of users", async function () {
    const resp = await request(app).get("/users").send({ _token: user1Token });

    expect(resp.body).toEqual({
      users: [
        {
          username: TEST_USER_1.username,
          first_name: TEST_USER_1.first_name,
          last_name: TEST_USER_1.last_name,
        },
        {
          username: TEST_USER_2.username,
          first_name: TEST_USER_2.first_name,
          last_name: TEST_USER_2.last_name,
        },
      ]
    });
  });

  test("get user details", async function () {
    const resp = await request(app)
      .get(`/users/${TEST_USER_1.username}`)
      .send({ _token: user1Token });

    expect(resp.body).toEqual({
      user: {
        username: TEST_USER_1.username,
        first_name: TEST_USER_1.first_name,
        last_name: TEST_USER_1.last_name,
        phone: TEST_USER_1.phone,
        join_at: expect.any(String),
        last_login_at: expect.any(String),
      }
    });
  });
});

afterAll(async function () {
  await db.end();
});
