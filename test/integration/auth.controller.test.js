// process.env.DB_DATABASE = process.env.DB_DATABASE || "2101787";

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const res = require("express/lib/response");
// const server = require("../../index");
// const assert = require("assert");
// const jwt = require("jsonwebtoken");
// const { jwtSecretKey, logger } = require("../../src/config/config");
// const dbconnection = require("../../database/dbconnection");

// chai.should();
// chai.expect();
// chai.use(chaiHttp);

// let token;
// let wrongToken;

// /**
//  * Db queries to clear and fill the test database before each test.
//  */
// const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
// const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
// const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
// const CLEAR_DB =
//   CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

// /**
//  * Voeg een user toe aan de database. Deze user heeft id 1.
//  * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
//  */
// const INSERT_USER =
//   "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
//   '(1, "first", "last", "first@server.nl", "Secret#1", "street", "city"),' +
//   '(2, "second", "last", "second@server.nl", "Secret#2", "street", "city"),' +
//   '(3, "third", "last", "third@server.nl", "Secret#3", "street", "city"),' +
//   '(4, "fourth", "last", "fourth@server.nl", "Secret#4", "street", "city"),' +
//   '(5, "fifth", "last", "fifth@server.nl", "Secret#5", "street", "city");';
// /**
//  * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
//  * met een bestaande user in de database.
//  */
// const INSERT_MEALS =
//   "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
//   "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
//   "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// // UC-101 Login
// describe("UC-101 Login /api/aut/user", () => {
//   before((done) => {
//     token = jwt.sign(
//       {
//         userId: 1,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "10d",
//       }
//     );

//     wrongToken = jwt.sign(
//       {
//         userId: 2,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "10d",
//       }
//     );
//     done()
    
//   });

//   beforeEach((done) => {
//     logger.debug("beforeEach called");
//     // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
//     dbconnection.getConnection(function (err, connection) {
//       if (err) throw err; // not connected!

//       // Use the connection
//       connection.query(
//         CLEAR_DB + INSERT_USER,
//         function (error, results, fields) {
//           // When done with the connection, release it.
//           connection.release();

//           // Handle error after the release.
//           if (error) throw error;
//           // Let op dat je done() pas aanroept als de query callback eindigt!
//           logger.debug("beforeEach done");
//           done();
//         }
//       );
//     });
//   });

//   it("TC-101-1 Valid input is missing", (done) => {
//     chai
//       .request(server)
//       .post("/api/aut/login")
//       .send({
//         emailAdress: "first@server.nl",
//         // password: "",
//       })
//       .end((req, res) => {
//         res.should.be.an("object");
//         let { status, message } = res.body;
//         status.should.equals(400);
//         message.should.be.a("string").that.equals("Password must be a string");
//         done();
//       });
//   });

//   it("TC-101-2 No valid email was given", (done) => {
//     chai
//       .request(server)
//       .post("/api/aut/login")
//       .send({
//         emailAdress: "email$$$.test@server.nl",
//         password: "Secret##",
//       })
//       .end((req, res) => {
//         res.should.be.an("object");
//         let { status, message } = res.body;
//         status.should.equals(400);
//         message.should.be
//           .a("string")
//           .that.equals("Email is not a valid format");
//         done();
//       });
//   });

//   it("TC-101-3 No valid password was given", (done) => {
//     chai
//       .request(server)
//       .post("/api/aut/login")
//       .send({
//         emailAdress: "password.test@server.nl",
//         password: "test",
//       })
//       .end((req, res) => {
//         res.should.be.an("object");
//         let { status, message } = res.body;
//         status.should.equals(400);
//         message.should.be
//           .a("string")
//           .that.equals(
//             "Make sure the password contains: eight characters including one uppercase letter, one lowercase letter, and one number or special character."
//           );
//         done();
//       });
//   });

//   it("TC-101-4 User does not exist", (done) => {
//     chai
//       .request(server)
//       .post("/api/aut/login")
//       .send({
//         emailAdress: "nobody.test@server.nl",
//         password: "Nobody#3",
//       })
//       .end((req, res) => {
//         res.should.be.an("object");
//         let { status, message } = res.body;
//         status.should.equals(404);
//         message.should.be.a("string").that.equals("User does not exist");
//         done();
//       });
//   });

//   it("TC-101-5 Succesfull login", (done) => {
//     chai.request(server)
//     .post('/api/aut/login')
//     .send({
//         emailAdress: "first@server.nl",
//         password: "Secret#1",
//     })
//     .end((err, res) => {
//         res.body.should.be
//             .an('object')
//             .that.has.all.keys('status', 'result')

//         let {
//             status,
//             result
//         } = res.body

//         status.should.equals(200);
//         result.id.should.equals(1);
//         result.firstName.should.be.a("string").that.equals("first");
//         result.lastName.should.be.a("string").that.equals("last");
//         result.isActive.should.equals(1);
//         result.emailAdress.should.be.a("string").that.equals("first@server.nl");
//         result.password.should.be.a("string").that.equals("Secret#1");
//         result.street.should.be.a("string").that.equals("street");
        
//         done()
//     })
//   });
// });
