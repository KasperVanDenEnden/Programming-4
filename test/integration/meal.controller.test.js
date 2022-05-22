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
chai.expect();
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
      .set(  'authorization',
      'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey))
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
        message.should.be.a("string").that.equals("Name must be a string");
        done();
      });
  });

  it("TC-301-2 Not logged in", (done) => {
    chai.request(server)
    .post('/api/meal')
    .send({
        name: "patat",
        description: "Lekkere friet",
        isActive: 1,
        isVega: 1,
        isVegan: 1,
        isToTakeHome: 1,
        dateTime: "2022/05/22",
        imageUrl: "testurl.nl",
        price: "6.75"
    })
    .end((err, res) => {
        assert.ifError(err)
        res.should.have.status(401)
        res.should.be.an('object')

        res.body.should.be
            .an('object')
            .that.has.all.keys('status', 'message')

        let {
            status,
            message
        } = res.body
        status.should.be.a('number').that.equals(401)
        message.should.be.a('string').that.equals('Authorization header is missing')
        done()
    })
  });

  it("TC-301-3 Meal has been added", (done) => {
    chai.request(server)
    .post('/api/meal')
    .set(
        'authorization',
        'Bearer ' + token
    )
    .send({
        "name": "Spaghetti Bolognese",
        "description": "Dé pastaklassieker bij uitstek.",
        "isActive": "1",
        "isVega": "1",
        "isVegan": "1",
        "isToTakeHome": "1",
        "dateTime": "2022-05-15T20:07:10.870Z",
        "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        "price": "6.75"
    })
    .end((err, res) => {
        assert.ifError(err)
        res.should.have.status(201)
        res.should.be.an('object')

        res.body.should.be
            .an('object')
            .that.has.all.keys('status', 'result')

        let createdMeal = res.body.result.id

        let {
            status,
            result
        } = res.body

        status.should.be.a('number').that.equals(201)

        expect(result.id).to.equal(createdMeal);
        expect(result.name).to.equal('Spaghetti Bolognese')
        expect(result.description).to.equal('Dé pastaklassieker bij uitstek.')
        expect(result.isActive).to.equal('1')
        expect(result.isVega).to.equal('1')
        expect(result.isVegan).to.equal('1')
        expect(result.isToTakeHome).to.equal('1')
        expect(result.dateTime).to.equal('2022-05-15T20:07:10.870Z')
        expect(result.imageUrl).to.equal('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg')
        expect(result.price).to.equal('6.75')

        expect(result.cook.id).to.equal(1);
        expect(result.cook.firstName).to.equal('first');
        expect(result.cook.lastName).to.equal('last');
        expect(result.cook.isActive).to.equal(1);
        expect(result.cook.emailAdress).to.equal('name@server.nl');
        expect(result.cook.password).to.equal('secret');
        expect(result.cook.street).to.equal('street');
        expect(result.cook.city).to.equal('city');

        done()
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


  // it('TC-302-1 required field is missing', (done) => {
  // })
  // it('TC-302-2 Not logged in', (done) => {
  // })
  // it('TC-302-3 Not the owner of the data', (done) => {
  // })
  // it('TC-302-4 Meal does not exist', (done) => {
  // })
  // it('TC-302-5 Meal has been updated', (done) => {
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

  it("TC-303-1 List of meals is returned", (done) => {
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

  it("TC-303-1-a List of meals is returned *2 ", (done) => {
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

  it("TC-303-1-b List of meals is returned *0", (done) => {
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
        
          }
        );
      });




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
        results.should.be.an("array").that.has.length(0);
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



  it("TC-304-1 Meal does not exist", (done) => { done();});

  it("TC-304-2 Details of meal is returned", (done) => { done();});
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

  it("TC-305-2 Not logged in", (done) => { done();});

  it("TC-305-3 Not the owner of the data", (done) => { done();});

  it("TC-305-4 Meal does not exist", (done) => { done();});

  it("TC-305-5 Meal has been deleted", (done) => { done();});
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
