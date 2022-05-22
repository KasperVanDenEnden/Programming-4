process.env.DB_DATABASE = process.env.DB_DATABASE || "2101787";
const chai = require("chai");
const chaiHttp = require("chai-http");
const res = require("express/lib/response");
const server = require("../../index");
const assert = require('assert')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require("../../src/config/config");
const dbconnection = require("../../database/dbconnection")

let database = [];

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

// UC-301
describe("UC-301 create meal /api/meal", () => {

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


  it("TC-301-1 required field is missing", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set
      // 'authorization',
      // 'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
      ()
      .send({
        isActive: true,
        isVega: true,
        isVegan: false,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "2,99",
        imageUrl: "http://test.url",
        CookId: 1,
        // name:"Patat",
        description: "Van de beste aardappelen gemaakt!",
      })
      .end((req, res) => {
        res.should.be.an("object");
        let { status, message } = res.body;
        status.should.equals(400);
        message.should.be.a("string").that.equals("Name shoul be a string");
        done();
      });
  });

  it("TC-301-2 Not logged in", () => {
    chai
      .request(server)
      .post("/api/meal")
      .send({
        isActive: true,
        isVega: true,
        isVegan: false,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "2,99",
        imageUrl: "http://test.url",
        CookId: 1,
        name: "Patat",
        description: "Van de beste aardappelen gemaakt!",
      })
      .end((req, res) => {
        res.should.be.an("object");
        let { status, message } = res.body;
        status.should.equals(401);
        message.should.be
          .a("string")
          .that.equals("Authorization header missing!");
      });
  });

  it("TC-301-3 Meal has been added", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set
      // 'authorization',
      // 'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
      ()
      .send({
        isActive: true,
        isVega: true,
        isVegan: false,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "2,99",
        imageUrl: "http://test.url",
        CookId: 1,
        name: "Patat",
        description: "Van de beste aardappelen gemaakt!",
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

// UC-302
describe("UC-302 update meal /api/meal/:id", () => {

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


  // it('TC-302-1 required field is missing', () => {
  // })
  // it('TC-302-2 Not logged in', () => {
  // })
  // it('TC-302-3 Not the owner of the data', () => {
  // })
  // it('TC-302-4 Meal does not exist', () => {
  // })
  // it('TC-302-5 Meal has been updated', () => {
  // })
});

// UC-303
describe("UC-303 Fetching list of meals /api/meal", () => {
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

  it("TC-303-1 List of meals is returned", () => {
    chai
      .request(server)
      .get("/api/movie")
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

  it("TC-303-1 List of meals is returned ", () => {
    chai
      .request(server)
      .get("/api/movie")
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

  it("TC-303-1 List of meals is returned", () => {
    chai
      .request(server)
      .get("/api/movie")
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
});

// UC-304
describe("UC-304 Fetching details of a meal /api/meal/:id", () => {
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



  it("TC-304-1 Meal does not exist", () => {});

  it("TC-304-2 Details of meal is returned", () => {});
});

// UC-305
describe("UC-305 delete meal /api/meal/:id", () => {

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

  // TC-305-1 expires

  it("TC-305-2 Not logged in", () => {});

  it("TC-305-3 Not the owner of the data", () => {});

  it("TC-305-4 Meal does not exist", () => {});

  it("TC-305-5 Meal has been deleted", () => {});
});



// MEAL PARTICIPATING
// UC-401
// describe("UC-401 Sign up for meal /api/meal/:id/participate", () => {
//   describe("TC-401-1 Not logged in", () => {});

//   describe("TC-401-2 Meal does not exist", () => {});

//   describe("TC-401-3 Succesfully signed up", () => {});
// });

// // UC-402
// describe("UC-402 Sign out for meal /api/meal/:id/unparticipate", () => {
//   describe("TC-402-1 Not logged in", () => {});

//   describe("TC-402-2 Meal does not exist", () => {});

//   describe("TC-402-3 Registration does not exist", () => {});

//   describe("TC-402-4 Succesfully signed out", () => {});
// });

// // UC-403
// describe("UC-403 Request list of participants /api/meal/:id/participants", () => {
//   describe("TC-403-1 Not logged in", () => {});

//   describe("TC-403-2 Meal does not exist", () => {});

//   describe("TC-403-3 List of participants has been returned", () => {});
// });

// // UC-404
// describe("UC-404 Request details of participant /api/user/:id  || /api/meal/:id/participants/:id", () => {
//   describe("TC-404-1 Not logged in", () => {});

//   describe("TC-404-2 Meal does not exist", () => {});

//   describe("TC-404-3 Details of participants has been returned", () => {});
// });
