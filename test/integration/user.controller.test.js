process.env.DB_DATABASE = process.env.DB_DATABASE || 'mytestdb'


const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
chai.should();
chai.use(chaiHttp);

let userId;

// UC-201 Register as new user
describe("UC-201 Register as new user - POST /api/user", () => {
    it("TC-201-1 Required input is missing", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
          // firstName:'Kasper',    firstName missing leads to error
          lastName: "van den Enden",
          street: "Heinoord 7",
          city: "Breda",
          emailAdress: "test@test.nl",
          password: "secret",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("Firstname must be a string");
                done();
            });
    });
    // it("TC-201-2 Non valid Email Address");
    // it("TC-201-3 Non valid Password");
    it("TC-201-4 User already exists", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
          firstName:'Kasper',
          lastName: "van den Enden",
          street: "Heinoord 7",
          city: "Breda",
          emailAdress: "m.vandullemen@server.nl", //email that exists
          password: "secret",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(409);
                done();
            });
    });
    it("TC-201-5 User has been registered succesfully", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
          firstName:'Kasper',
          lastName: "van den Enden",
          street: "Heinoord 7",
          city: "Breda",
          emailAdress: "test@test.nl",
          password: "secret",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;

              console.log(res.body)

                //store id that can be used for the delete test later on
                userId = result.id;

                status.should.equals(201);
                done();
            });
    });
});

// UC-202 Overview of users
// describe("UC-202 Overview of users - GET /api/user", () => {
//     it("TC-202-1 Show zero users");
//     it("TC-202-2 Show two users");
//     it("TC-202-3 Show users using a searchterm with non-existing name");
//     it("TC-202-4 User ID doesn't exist");
//     it("TC-202-5 Show users using a searchterm with isActive status of true");
//     it("TC-202-6 Show users using a searchterm with existing name");
// });
//
// // UC-203 Get users profile
// describe("UC-203 Get users profile - GET /api/user/profile", () => {
//     it("TC-203-1 Invalid token");
//     it("TC-203-2 Valid token and user exists");
// });

// UC-204 Get user details
describe("UC-204 Get user details - GET /api/user/:id", () => {
    // it("TC-204-1 Invalid token");


    it("TC-204-2 User ID doesn't exists", (done) => {
        chai.request(server)
            .get("/api/user/0")
            .end((req, res) => {
                let { status,message } = res.body;
                status.should.equals(404);
                message.should.be.a('string').that.equals("User does not exist")
                done();
            });
    });


    it("TC-204-3 User ID exists", (done) => {
        chai.request(server)
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
    it("TC-205-1 Required field missing", (done) => {
        chai.request(server)
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
        chai.request(server)
            .put("/api/user/0")
            .send({
              firstName:'Kasper',
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
        chai.request(server)
            .put("/api/user/" + userId)
            .send({
              firstName:'Casper',
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
    it("TC-206-1 User doesn't exist", (done) => {
        chai.request(server)
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
        chai.request(server)
            .delete("/api/user/" + userId)
            .end((req, res) => {
                let { status } = res.body;

                status.should.equals(200);
                res.body.should.have.property("message");
               done();
            });
    });
});

// process.env.DB_DATABASE = process.env.DB_DATABAASE || 'share-a-meal-testdb'

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const res = require("express/lib/response");
// const server = require("../../index");
// const assert = require('assert')
// require('dotenv').config()
// const dbconnection = require('../../database/dbconnection')
// let users = [];

// chai.should();
// chai.use(chaiHttp);

// // DB Queries to clar andfill the test database before eacht test
//   // const CLEAR_USER_TABLE = 'DELETE IGNORE FROM `meal`;'
//   // const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
//   // const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
//   // const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE



// // UC-101
// describe("UC-101 login /api/aut/login", () => {
//   describe("TC-101-1 required field is missing", () => {});

//   describe("TC-101-2 wrong email", () => {});

//   describe("TC-101-3 Wrong password", () => {});

//   describe("TC-101-4 User does not exist", () => {});

//   describe("TC-101-5 Succesfull login", () => {});
// });

// // UC-201
// describe("UC-201 Manage users /api/user ", () => {
//   describe("TC-201-1 add user", () => {
//     beforeEach((done) => {
//       users = [];
//       done();
//     });

//     it("TC-201 When a required input is missing, a valid error should be returned", (done) => {
//       chai
//         .request(server)
//         .post("/api/user")
//         .send({
//           // firstName:'Kasper',
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "test@test.nl",
//           password: "secret",
//           phoneNumber: "06 36391089",
//         })
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be
//             .a("string")
//             .that.equals("Firstname must be a string");
//           done();
//         });
//       it("TC-201 Other test examlpe", () => {});
//     });
//   });

//   describe("TC-201-2 wrong email", () => {
//     it("TC-201-2 When the email is not equal to the regex, a valid error should be returned", (done) => {
//       chai
//         .request(server)
//         .post("/api/user")
//         .send({
//           firstName: "Kasper",
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "te..st@test.nl",
//           password: "secret",
//           phoneNumber: "06 36391089",
//         })
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be.a("string").that.equals("No valid email format");
//           done();
//         });
//     });
//   });

//   describe("TC-201-3 Wrong password", () => {
//     beforeEach((done) => {
//       users = [];
//       done();
//     });

//     it("TC-201-3 Password can not be empty", (done) => {
//       chai
//         .request(server)
//         .post("/api/user")
//         .send({
//           firstName: "Kasper",
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "te..st@test.nl",
//           password: 5235252523,
//           phoneNumber: "06 36391089",
//         })
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be.a("string").that.equals("Password must be a string");
//           done();
//         });
//     });
//   });

//   describe("TC-201-4 User already exist", () => {
//     it("TC-201-4 When a user already exists, a valid error should be returned", (done) => {
//       beforeEach((done) => {
//         users = [];
//         users.push({
//           firstName: "Kasper",
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "test@test.nl",
//           password: "secret",
//           phoneNumber: "06 36391089",
//         });
//         done();
//       });

//       chai
//         .request(server)
//         .post("/api/user")
//         .send({
//           firstName: "Kasper",
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "test@test.nl",
//           password: "secret",
//           phoneNumber: "06 36391089",
//         })
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(409);
//           message.should.be.a("string").that.equals("Email is not unique!");
//           done();
//         });
//     });
//   });

//   describe("TC-201-5 Succesfull registration", () => {
//     it("TC-201-5 Creating a new user, should give a valid response", (done) => {
//       beforeEach((done) => {
//         users = [];
//         done();
//       });

//       chai
//         .request(server)
//         .post("/api/user")
//         .send({
//           firstName: "Kasper",
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "test@test.nl",
//           password: "secret",
//           phoneNumber: "06 36391089",
//         })
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(201);
//           message.should.be.a("string").that.equals("User is added!");
//           done();
//         });
//     });
//   });
// });

// // UC-202
// describe("UC-202 Request list of users /api/user", () => {
//   describe("TC-202-1 Show zero users", () => {
//     it("TC-202-1 When no users exist, should give a valid response", (done) => {
//       chai
//         .request(server)
//         .get("/api/user")
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(201);
//           message.should.be.a("array");
//           done();
//         });
//     });
//   });

//   describe("TC-202-2 Show two users", () => {
//     beforeEach((done) => {
//       users = [];
//       const objOne = {
//         id: 1,
//         firstName: "Kasper",
//         lastName: "van den Enden",
//         isActive: true,
//         emailAdress: "k.test@test.nl",
//         phoneNumber: "06 36391089",
//         city: "Breda",
//         postcode: "4824 LT",
//       };
//       const objTwo = {
//         id: 2,
//         firstName: "Steven",
//         lastName: "van den Enden",
//         isActive: true,
//         emailAdress: "s.test@test.nl",
//         phoneNumber: "06 12345678",
//         city: "Breda",
//         postcode: "4824 LT",
//       };
//       users.push(objOne, objTwo);
//       done();
//     });

//     it("TC-202-2 when 2 user exist, they wil be shown and a valid response is given", (done) => {
//       chai
//         .request(server)
//         .get("/api/user")
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(201);
//           message.should.be.a("array");

//           done();
//         });
//     });
//   });

//   describe("TC-202-3 Show users with search of no existing name", () => {});

//   describe('TC-202-4 Show users with search "isActive=false"', () => {});

//   describe('TC-202-5 Show users with search "isActive=true"', () => {});

//   describe("TC-202-6 Show users with search of existing name", () => {});
// });

// // UC-203
// describe("UC-203 Request user profile /api/user/profile", () => {
//   describe("TC-203-1 Illegal token", () => {
//     // it('TC-203-1 When the token is not valid, an error should be given', (done) => {
//     // })
//   });

//   describe("TC-203-2 Legal token and user exists", () => {
//     // it('TC-203-2 When token is valid and user exists, a valid response should be given', (done) => {
//     // })
//   });
// });

// // UC-204
// describe("UC-204 Request user details /api/user/:id", () => {
//   describe("TC-204-1 Illegal token", () => {
//     // it('TC-204-1 When a token is not valid, an error should be given' , (done) => {
//     // })
//   });

//   describe("TC-204-2 UserId does not exist", () => {
//     it('TC-204-2 When a user does not exist, a valid error should be given' , (done) => {
//       beforeEach((done) => {
//         users = []
//         done();
//       });
//       let userId = 500
//       chai
//         .request(server)
//         .get("/api/user" + userId)
//         .send()
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(404);
//           message.should.be.a("string").that.equals("User with ID 500 not found");
//           done();
//         });

//     })
//   });

//   describe("TC-204-3 UserId does  exist", () => {
//     // it('TC-204-3 When a user does exist, a valid response should be given' , (done) => {
//       beforeEach((done) => {
//         users = []
//         users.push({
//           id: 500,
//           firstName: "Kasper",
//           lastName: "van den Enden",
//           street: "Heinoord 7",
//           city: "Breda",
//           postcode: "4824 LT",
//           emailAdress: "test@test.nl",
//           password: "secret",
//           phoneNumber: "06 36391089",
//         })
//         done();
//       });
//       let userId = 1
//       chai
//         .request(server)
//         .get("/api/user" + userId)
//         .send()
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(200);
//           message.should.be.a("string").that.equals("User with ID 500 not found");
//           done();
//         });
//     // })
//   });
// });

// // UC-205
// describe("UC-205 Update user /api/user/:id", () => {
//   describe("TC-205-1 required field is missing", () => {
//     // it('TC-205-1 When a required field is missing, a valid error should be given', (done) => {    
//     //   chai
//     //   .request(server)
//     //   .post("/api/user/:id")
//     //   .send({
//     //     // firstName:'Kasper',
//     //     lastName: "van den Enden",
//     //     street: "Heinoord 7",
//     //     city: "Breda",
//     //     postcode: "4824 LT",
//     //     emailAdress: "test@test.nl",
//     //     password: "secret",
//     //     phoneNumber: "06 36391089",
//     //   })
//     //   .end((err, res) => {
//     //     res.should.be.an("object");
//     //     let { status, message } = res.body;
//     //     status.should.equals(401);
//     //     message.should.be
//     //       .a("string")
//     //       .that.equals("Firstname must be a string");
//     //     done();
//     //   });
//     // })
//   });

//   describe("TC-205-2 No valid postcode", () => {
//     it('TC-205-2 When no valid postcode is given, an error should be returned', (done) => {
//       chai
//       .request(server)
//       .post("/api/user/1")
//       .send({
//         firstName:'Kasper',
//         lastName: "van den Enden",
//         street: "Heinoord 7",
//         city: "Breda",
//         postcode: "482444242 LT",
//         emailAdress: "test@test.nl",
//         password: "secret",
//         phoneNumber: "06 36391089"
//       })
//       .end((err,res) => {
//         res.should.be.an("object")
//         let {status, message} = res.body;
//         status.should.equals(400)
//         message.should.be.a("string").that.equals("No valid postcode format")
//       })
//     })
//   });

//   describe("TC-205-3 No valid phonenumber", () => {
//     // it('TC-205-3 When no valid phonenumber is given, an error should be returned', (done) => {
//     //   chai
//     //   .request(server)
//     //   .post("/api/user/1")
//     //   .send({
//     //     firstName:'Kasper',
//     //     lastName: "van den Enden",
//     //     street: "Heinoord 7",
//     //     city: "Breda",
//     //     postcode: "4824 LT",
//     //     emailAdress: "test@test.nl",
//     //     password: "secret",
//     //     phoneNumber: "06",
//     //   })
//     //   .end((err, res) => {
//     //     res.should.be.an("object");
//     //     let { status, message } = res.body;
//     //     status.should.equals(400);
//     //     message.should.be.a("string").that.equals("No valid phonenumber format");
//     //     done();
//     //   });
//     // })
//   });

//   describe("TC-205-4 User does not exist", () => {
//     // it('TC-205-4 When the user does not exist, an eroor should be returned', (done) => {
//     //   beforeEach((done) => {
//     //     users = [];
//     //     done();
//     //   });
//     //   chai
//     //   .request(server)
//     //   .post("/api/user/57")
//     //   .send({
//     //     firstName:'Kasper',
//     //     lastName: "van den Enden",
//     //     street: "Heinoord 7",
//     //     city: "Breda",
//     //     postcode: "4824 LT",
//     //     emailAdress: "test@test.nl",
//     //     password: "secret",
//     //     phoneNumber: "abava",
//     //   })
//     //   .end((err, res) => {
//     //     res.should.be.an("object");
//     //     let { status, message } = res.body;
//     //     status.should.equals(400);
//     //     message.should.be.a("string").that.equals("User with ID 57 not found");
//     //     done();
//     //   });
//     // })
//   });

//   describe("TC-205-5 User has been updated", () => {
//     // it('TC-205-5 When a user has been updated, a valid responese should be returned', (done) => {
//     //   beforeEach((done) => {
//     //     users = [];
//     //     users.push({
//     //       id: 57,
//     //       firstName:'Kasper',
//     //       lastName: "van den Enden",
//     //       street: "Heinoord 7",
//     //       city: "Breda",
//     //       postcode: "4824 LT",
//     //       emailAdress: "test@test.nl",
//     //       password: "secret",
//     //       phoneNumber: "06 36391089",
//     //     })
//     //     done();
//     //   });
//     //   chai
//     //   .request(server)
//     //   .post("/api/user/57")
//     //   .send({
//     //     firstName:'Kasper',
//     //     lastName: "van den Enden",
//     //     street: "Heinoord 7",
//     //     city: "Breda",
//     //     postcode: "4824 LT",
//     //     emailAdress: "test@test.nl",
//     //     password: "secret",
//     //     phoneNumber: "06 36391089",
//     //   })
//     //   .end((err, res) => {
//     //     res.should.be.an("object");
//     //     let { status, message } = res.body;
//     //     status.should.equals(200);
//     //     message.should.be
//     //       .a("string")
//     //       .that.equals('Updated user with ID 57');
//     //     done();
//     //   });
//     // })
//   });
// });

// // UC-206
// describe("UC-206 Delete user /api/user/:id", () => {
//   describe("TC-206-1 User does not exist", () => {
//     it("TC-206-1 When the user does not exist, a error should be given", (done) => {
//       beforeEach((done) => {
//         users = [];
//         done();
//       });

//       chai
//         .request(server)
//         .delete("/api/user/57")
//         .send()
//         .end((err, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be
//             .a("string")
//             .that.equals("No user with id 57 was found");
//           done();
//         });
//     });
//   });

//   describe("TC-206-2 Not logged in", () => {});

//   describe("TC-206-3 Actor is no owner", () => {});

//   describe("TC-206-4 User has been deleted", () => {});
// });


