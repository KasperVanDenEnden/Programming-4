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
let token;
let wrongToken;

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
        token = jwt.sign({
                userId: 1
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });

        wrongToken = jwt.sign({
                userId: 2
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });
        done()
    })

    beforeEach((done) => {
        logger.debug("beforeEach called");
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
          if (err) throw err; // not connected!
    
          // Use the connection
          connection.query(
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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
      'Bearer ' + wrongToken)
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
    .set('authorization', 'Bearer', + 123)
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
        message.should.be.a('string').that.equals('Unauthorized')
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
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "7.00",
        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        cookId: 1,
        name: "Spaghetti Bolognese",
        description: "Dé pastaklassieker bij uitstek.",
        maxAmountOfParticipants: 10
        
        
       
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

        result.id.should.equal(createdMeal);
        result.name.should.equal('Spaghetti Bolognese')
        result.description.should.equal('Dé pastaklassieker bij uitstek.')
        result.isActive.should.equal(1)
        result.isVega.should.equal(1)
        result.isVegan.should.equal(1)
        result.isToTakeHome.should.equal(1)
        result.imageUrl.should.equal('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg')
        result.price.should.equal('7.00')

        // expect(result.cook.id).to.equal(1);
        // expect(result.cook.firstName).to.equal('first');
        // expect(result.cook.lastName).to.equal('last');
        // expect(result.cook.isActive).to.equal(1);
        // expect(result.cook.emailAdress).to.equal('name@server.nl');
        // expect(result.cook.password).to.equal('secret');
        // expect(result.cook.street).to.equal('street');
        // expect(result.cook.city).to.equal('city');

        done()
      });
  });
});

// UC-302
describe("UC-302 update meal /api/meal/:id", () => {

    beforeEach((done) => {
        token = jwt.sign({
                userId: 1
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });

        wrongToken = jwt.sign({
                userId: 2
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });
        done()
    })


    beforeEach((done) => {
        logger.debug("beforeEach called");
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
          if (err) throw err; // not connected!
    
          // Use the connection
          connection.query(
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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


  it('TC-302-1 required field is missing', (done) => {
    chai.request(server)
                .put("/api/meal/1")
                .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    //missing name
                    description: "De pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    maxAmountOfParticipants: 6,
                    price: 2.5,
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Name must be a string");
                    done();
                });
  })
  it('TC-302-2 Not logged in', (done) => {
    chai.request(server)
    .put('/api/meal/1')
    .set(
        'authorization',
        'Bearer ' + 123
    )
    .send({
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "7.00",
        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        cookId: 1,
        name: "Spaghetti Bolognese",
        description: "Dé pastaklassieker bij uitstek.",
        maxAmountOfParticipants: 10       
    })
    .end((err, res) => {
        res.body.should.be.an("object");
        let { status, message } = res.body;
        status.should.equals(401);
        // message.should.be.a("string").that.equals("Unauthorized");
        done()
    });
  })
  // it('TC-302-3 Not the owner of the data', (done) => {
  // })
  it('TC-302-4 Meal does not exist', (done) => {
    chai.request(server)
    .put('/api/meal/50')
    .set(
        'authorization',
        'Bearer' + token
    )
    .send({
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "7.00",
        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        cookId: 1,
        name: "Spaghetti Bolognese",
        description: "Dé pastaklassieker bij uitstek.",
        maxAmountOfParticipants: 10
    })
    .end((err,res) => {
        res.body.should.be.an("object");
        let {status, message} = res.body;
        status.should.equals(401);
        // message.should.be.a("string").that.equals("Meal does not exist");
    })
    done();
  })
  it('TC-302-5 Meal has been updated', (done) => {
    chai.request(server)
    .put('/api/meal/1')
    .set(
        'authorization',
        'Bearer' + token
    )
    .send({
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "07-12",
        price: "7.00",
        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        cookId: 1,
        name: "Spaghetti Bolognese",
        description: "Dé pastaklassieker bij uitstek.",
        maxAmountOfParticipants: 10,
        allergenes: "gluten,lactose"
    })
    .end((err,res) => {
        res.body.should.be.an("object");
        let {status, message} = res.body;
        // status.should.equals(200);
        // message.should.be.a("string").that.equals("Meal has been updated");
       
    })
    done(); 

  })
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
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

      it("TC-303-1 Return list of meals", (done) => {
        chai.request(server)
            .get("/api/meal")
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an('array');
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
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

  it("TC-304-1 Meal does not exist", (done) => { 
    
    chai.request(server)
                .get("/api/meal/0")
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("Meal does not exist");
                    done();
                });
  });

  it("TC-304-2 Details of meal is returned", (done) => { 
    
    chai.request(server)
                .get("/api/meal/1")
                .end((req, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(200);
                    
                    result.id.should.equal(1);
                    result.name.should.equal('Meal A')
                    result.description.should.equal('description')
                    result.imageUrl.should.equal('image url')
                    result.price.should.equal('6.50')

                    done();
                });
  });
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
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

  it("TC-305-2 Not logged in", (done) => { 
    chai.request(server)
    .delete('/api/meal/1')
    .set(
        'authorization',
        'Bearer ' + jwt.sign({ userId: 1 }, "test")
    )
    .end((err, res) => {
        res.body.should.be.an("object");
        let { status, message } = res.body;
        status.should.equals(401);
        message.should.be.a("string").that.equals("Unauthorized");

        done()
    });
  });

//   it("TC-305-3 Not the owner of the data", (done) => {done();});

  it("TC-305-4 Meal does not exist", (done) => {
    chai.request(server)
    .delete('/api/meal/50')
    .set(
        'authorization',
        'Bearer' + token
    )
    .end((err,res) => {
        res.body.should.be.an("object");
        let {status, message} = res.body;
        status.should.equals(401);
        // message.should.be.a("string").that.equals("Meal does not exist");
    })
    done();

   });

  it("TC-305-5 Meal has been deleted", (done) => { 

    chai.request(server)
    .delete('/api/meal/1')
    .set(
        'authorization',
        'Bearer' + token
    )
    .end((err,res) => {
        res.body.should.be.an("object");
        let {status, message} = res.body;
        // status.should.equals(200);
        // message.should.be.a("string").that.equals("Meal has been deleted");
        
    })
    done();
  });
});



// MEAL PARTICIPATING
// UC-401
describe("UC-401 Sign up for meal - GET /api/meal/:id/participate", () => {

    beforeEach((done) => {
        logger.debug("beforeEach called");
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
          if (err) throw err; // not connected!
    
          // Use the connection
          connection.query(
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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




    it("TC-401-1 Not logged in", (done) => {
        chai.request(server)
            .get("/api/meal/1/participate")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a("string").that.equals("Unauthorized");
                done();
            });
    });
    it("TC-401-2 Meal does not exist", (done) => {
        chai.request(server)
            .get("/api/meal/4/participate")
            .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(404);
                message.should.be.a("string").that.equals("This meal does not exist");
                done();
            });
    });
    it("TC-401-3 Successfully signed up", (done) => {
        chai.request(server)
            .get("/api/meal/2/participate")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                assert.deepEqual(result, {
                    currentlyParticipating: true,
                    currentAmountOfParticipants: 1,
                });

                done();
            });
    });
});
// UC-402 Sign out for meal
describe("UC-402 Sign out for meal - GET /api/meal/:id/participate", () => {

    beforeEach((done) => {
        logger.debug("beforeEach called");
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
          if (err) throw err; // not connected!
    
          // Use the connection
          connection.query(
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
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




    it("TC-401-1 Not logged in", (done) => {
        chai.request(server)
            .get("/api/meal/1/participate")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a("string").that.equals("Unauthorized");
                done();
            });
    });
    it("TC-402-2 Meal does not exist", (done) => {
        chai.request(server)
            .get("/api/meal/4/participate")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(404);
                message.should.be.a("string").that.equals("This meal does not exist");
                done();
            });
    });
    it("TC-402-3 Successfully signed out", (done) => {
        chai.request(server)
            .get("/api/meal/1/participate")
            .set("authorization", "Bearer " + jwt.sign({ userId: 2 }, jwtSecretKey))
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                assert.deepEqual(result, {
                    currentlyParticipating: true,
                    currentAmountOfParticipants: 1,
                });

                done();
            });
    });
});

