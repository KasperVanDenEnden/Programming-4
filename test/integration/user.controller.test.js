process.env.DB_DATABASE = process.env.DB_DATABASE || "2101787";

const chai = require("chai");
const chaiHttp = require("chai-http");
const res = require("express/lib/response");
const server = require("../../index");
const assert = require('assert')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require("../../src/config/config");
const dbconnection = require("../../database/dbconnection")

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "first@server.nl", "Secret#1", "street", "city"),' +
  '(2, "second", "last", "second@server.nl", "Secret#2", "street", "city"),' +
  '(3, "third", "last", "third@server.nl", "Secret#3", "street", "city"),' +
  '(4, "fourth", "last", "fourth@server.nl", "Secret#4", "street", "city"),' +
  '(5, "fifth", "last", "fifth@server.nl", "Secret#5", "street", "city");';
/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// UC-201 Register as new user
describe("UC-201 Register as new user - POST /api/user", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        }
      );
    });
  });

  it("TC-201-1 Required input is missing", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        // firstName:'Kasper',    firstName missing leads to error
        lastName: "van den Enden",
        street: "Heinoord 7",
        city: "Breda",
        emailAdress: "test@test.nl",
        password: "Secreth2",
      })
      .end((req, res) => {
        res.should.be.an("object");
        let { status, message } = res.body;
        status.should.equals(400);
        message.should.be.a("string").that.equals("Firstname must be a string");
        done();
      });
  });
  // it("TC-201-2 No valid Email Address");
  // it("TC-201-3 No valid Password");

  it("TC-201-2 No valid Email Address", () => {
    it("TC-201-2 When the email is not equal to the regex, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Kasper",
          lastName: "van den Enden",
          street: "Heinoord 7",
          city: "Breda",
          postcode: "4824 LT",
          emailAdress: "te..st@test.nl",
          password: "secret",
          phoneNumber: "06 36391089",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("Email is not a valid format");
          done();
        });
    });
  });

  it("TC-201-3 No valid Password", () => {
    it("TC-201-3 A valid password must be given", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Kasper",
          lastName: "van den Enden",
          street: "Heinoord 7",
          city: "Breda",
          postcode: "4824 LT",
          emailAdress: "unvalid@test.nl",
          password: "unvalid",
          phoneNumber: "06 36391089",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals(
              "Make sure the password contains: eight characters including one uppercase letter, one lowercase letter, and one number or special character."
            );
          done();
        });
    });
  });

  it("TC-201-4 User already exists", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Kasper",
        lastName: "van den Enden",
        street: "Heinoord 7",
        city: "Breda",
        emailAdress: "m.vandullemen@server.nl", //email that exists
        password: "Secreth2",
      })
      .end((req, res) => {
        res.should.be.an("object");
        let { status, message } = res.body;
        status.should.equals(409);
        message.should.be.a("string").that.equals("User already exists");
        done();
      });
  });

  it("TC-201-5 User has been registered succesfully", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Kasper",
        lastName: "van den Enden",
        street: "Heinoord 7",
        city: "Breda",
        emailAdress: "registration.test@test.nl",
        password: "Secreth2",
      })
      .end((req, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;

        console.log(res.body);

        //store id that can be used for the delete test later on
        userId = result.id;

        status.should.equals(201);
        done();
      });
  });
});

// UC-202 Overview of users

describe("UC-202 Overview of users - GET /api/user", (done) => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) throw error;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        }
      );
    });
  });

  it("TC-202-1 Show zero users", (done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(CLEAR_DB, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) throw error;
        // Let op dat je done() pas aanroept als de query callback eindigt!
        logger.debug("before done");
        done();
      });
    });

    chai
      .request(server)
      .get("/api/meal")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");

        res.body.should.be
          .an("object")
          .that.has.all.keys("results", "statusCode");

        const { statusCode, results } = res.body;
        statusCode.should.be.an("number").that.equals(200);
        results.should.be.an("array").that.has.length(0);
        done();
      });
  });
  it("TC-202-2 Show two users", (done) => {
    chai
      .request(server)
      .get("/api/meal")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");

        res.body.should.be
          .an("object")
          .that.has.all.keys("results", "statusCode");

        const { statusCode, results } = res.body;
        statusCode.should.be.an("number");
        results.should.be.an("array").that.has.length(2);
        results[0].name.should.equal("Meal A");
        results[0].id.should.equal(1);
        done();
      });
  });
  it("TC-202-3 Show users using a searchterm with non-existing name", (done) => {
    chai
      .request(server)
      .get("/api/meal?name=NoFood")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");

        res.body.should.be
          .an("object")
          .that.has.all.keys("results", "statusCode");

        const { statusCode, results } = res.body;
        statusCode.should.be.an("number")
        results.should.be.an("array").that.has.length(0);
        done();
      });
  });

  it("TC-202-4 Show users using a searchterm with isActive status of true", (done) => {
    chai
    .request(server)
    .get("/api/meal?isActive=false")
    .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
    .end((err, res) => {
      assert.ifError(err);

      res.should.have.status(200);
      res.should.be.an("object");

      res.body.should.be
        .an("object")
        .that.has.all.keys("results", "statusCode");

      const { statusCode, results } = res.body;
      statusCode.should.be.an("number")
      results.should.be.an("array").that.has.length(0);
      done();
    });
  });
      it("TC-202-5 Show users using a searchterm with isActive status of true", (done) => {
        chai
        .request(server)
        .get("/api/meal?isActive=false")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);
    
          res.should.have.status(200);
          res.should.be.an("object");
    
          res.body.should.be
            .an("object")
            .that.has.all.keys("results", "statusCode");
    
          const { statusCode, results } = res.body;
          statusCode.should.be.an("number")
          results.should.be.an("array").that.has.length(5);
          done();
        });

      });
      it("TC-202-6 Show users using a searchterm with existing name", (done) => {
        chai
        .request(server)
        .get("/api/meal?firstName=Second")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);
    
          res.should.have.status(200);
          res.should.be.an("object");
    
          res.body.should.be
            .an("object")
            .that.has.all.keys("results", "statusCode");
    
          const { statusCode, results } = res.body;
          statusCode.should.be.an("number")
          results.should.be.an("array").that.has.length(1);
          done();
        });
      });
});

// // UC-203 Get users profile
describe("UC-203 Get users profile - GET /api/user/profile", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        }
      );
    });
  });

  it("TC-203-1 Invalid token", (done) => {
    chai
      .request(server)
      .get("/api/user/profile")
      .send()
      .end((req, res) => {
        let { status, message } = res.body;
        status.should.equals(401);
        message.should.be.a("string").that.equals("Not authorized");
      });
  });
  it("TC-203-2 Valid token and user exists", (done) => {
    chai
      .request(server)
      .get("/api/user/profile")
      .send()
      .end((req, res) => {
        let { status, message } = res.body;
        status.should.equals(401);
        message.should.be.a("string").that.equals("Not authorized");
      });
  });
});

// UC-204 Get user details
describe("UC-204 Get user details - GET /api/user/:id", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        }
      );
    });
  });

  it("TC-204-1 Invalid token");

  it("TC-204-2 User ID doesn't exists", (done) => {
    // chai
    //   .request(server)
    //   .get("/api/meal/10")
    //   .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
    //   .end((err, res) => {
    //     assert.ifError(err);

    //     res.should.have.status(404);
    //     res.should.be.an("object");

    //     res.body.should.be
    //       .an("object")
    //       .that.has.all.keys("results", "statusCode");

    //     const { statusCode, message } = res.body;
    //     statusCode.should.be.an("number")
    //     message.should.be.a("string").that.equals("User does not exist")
    //     done();
    //   });


    chai
      .request(server)
      .get("/api/user/0")
      .end((req, res) => {
        let { status, message } = res.body;
        status.should.equals(404);
        message.should.be.a("string").that.equals("User does not exist");
        done();
      });
  });

  it("TC-204-3 User ID exists", (done) => {
    chai
      .request(server)
      .get("/api/user/" + userId)
      .end((req, res) => {
        let { status } = res.body;
        status.should.equals(200);
        done();
      });
  });
});

// UC-205 Modify user
describe("UC-205 Modify user - PUT /api/user/:id", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        }
      );
    });
  });

  it("TC-205-1 Required field missing", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .send({
        firstName: "Marie",
        lastName: "Tilburg",
        // missing email should end up failing
        password: "dmG!F]!!6cUwK7JQ",
        street: "Hopstraat",
        city: "Amsterdam",
      })
      .end((req, res) => {
        let { status, message } = res.body;
        status.should.equals(400);
        message.should.be.a("string").that.equals("Email must be a string");
        done();
      });
  });
  // it("TC-205-2 Invalid postal code");
  // it("TC-205-3 Invalid phone number");
  it("TC-205-4 User doesn't exists", (done) => {
    chai
      .request(server)
      .put("/api/user/0")
      .send({
        firstName: "Kasper",
        lastName: "van den Enden",
        street: "Heinoord 7",
        city: "Breda",
        emailAdress: "test@test.nl",
        password: "secret",
      })
      .end((req, res) => {
        let { status } = res.body;
        status.should.equals(400);
        done();
      });
  });
  // it("TC-204-5 Not logged in");
  it("TC-205-6 User has been modified successfully", (done) => {
    chai
      .request(server)
      .put("/api/user/" + userId)
      .send({
        firstName: "Casper",
        lastName: "van den Enden",
        street: "Heinoord 7",
        city: "Breda",
        emailAdress: "test@test.nl",
        password: "secret",
      })
      .end((req, res) => {
        let { status } = res.body;
        status.should.equals(200);
        done();
      });
  });
});

// UC-206 Delete user
describe("UC-206 Delete user - DELETE /api/user/:id", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        }
      );
    });
  });

  it("TC-206-1 User doesn't exist", (done) => {
    chai
      .request(server)
      .delete("/api/user/0")
      .end((req, res) => {
        let { status } = res.body;
        status.should.equals(400);
        done();
      });
  });
  // it("TC-206-2 Not logged in");
  // it("TC-206-3 Actor is not the owner");
  it("TC-206-4 User has been deleted successfully", (done) => {
    chai
      .request(server)
      .delete("/api/user/" + userId)
      .end((req, res) => {
        let { status } = res.body;

        status.should.equals(200);
        res.body.should.have.property("message");
        done();
      });
  });
});
