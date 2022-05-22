const chai = require('chai')
const chaiHttp = require('chai-http');
const res = require('express/lib/response');
const server = require('../../index')
let database = [];

chai.should()
chai.use(chaiHttp)

// UC-301
describe('UC-301 create meal /api/meal', () => {
    describe('TC-301-1 required field is missing', (done) => {
        chai.request(server)
            .post("/api/meal")
            .send({
                isActive:true,
                isVega:true,
                isVegan:false,
                isToTakeHome:true,
                dateTime:"07-12",
                price:"2,99",
                imageUrl:"http://test.url",
                CookId:1,
                // name:"Patat",
                description:"Van de beste aardappelen gemaakt!"
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("Name shoul be a string");
                done();
            });
    })

    describe('TC-301-2 Not logged in', () => {
        chai.request(server)
        .post("/api/meal")
        .send({
            isActive:true,
                isVega:true,
                isVegan:false,
                isToTakeHome:true,
                dateTime:"07-12",
                price:"2,99",
                imageUrl:"http://test.url",
                CookId:1,
                name:"Patat",
                description:"Van de beste aardappelen gemaakt!"
        })
        .end((req,res) => {
            res.should.be.an("object")
            let {status, message} = res.body
            status.should.equals(401)
            message.should.be.a("string").that.equals("User not found or password invalid")
        })
    })

    describe('TC-301-3 Meal has been added', (done) => {
        chai.request(server)
            .post("/api/meal")
            .send({
                isActive:true,
                isVega:true,
                isVegan:false,
                isToTakeHome:true,
                dateTime:"07-12",
                price:"2,99",
                imageUrl:"http://test.url",
                CookId:1,
                name:"Patat",
                description:"Van de beste aardappelen gemaakt!"
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
    })
})

// UC-302
describe('UC-302 update meal /api/meal/:id', () => {
    describe('TC-302-1 required field is missing', () => {

    })

    describe('TC-302-2 Not logged in', () => {

    })

    describe('TC-302-3 Not the owner of the data', () => {

    })

    describe('TC-302-4 Meal does not exist', () => {

    })

    describe('TC-302-5 Meal has been updated', () => {

    })

})

// UC-303
describe('UC-303 Fetching list of meals /api/meal', () => {
    describe('TC-303-1 List of meals is returned', () => {

    })

})

// UC-304
describe('UC-304 Fetching details of a meal /api/meal/:id', () => {
    describe('TC-304-1 Meal does not exist', () => {

    })

    describe('TC-304-2 Details of meal is returned', () => {

    })

})

// UC-305
describe('UC-305 update meal /api/meal/:id', () => {
    // TC-305-1 expires

    describe('TC-305-2 Not logged in', () => {

    })

    describe('TC-305-3 Not the owner of the data', () => {

    })

    describe('TC-305-4 Meal does not exist', () => {

    })

    describe('TC-305-5 Meal has been deleted', () => {

    })

})

// UC-401
describe('UC-401 Sign up for meal /api/meal/:id/participate', () => {
    describe('TC-401-1 Not logged in', () => {

    })

    describe('TC-401-2 Meal does not exist', () => {

    })

    describe('TC-401-3 Succesfully signed up', () => {

    })

})

// UC-402
describe('UC-402 Sign out for meal /api/meal/:id/unparticipate', () => {
    describe('TC-402-1 Not logged in', () => {

    })

    describe('TC-402-2 Meal does not exist', () => {

    })

    describe('TC-402-3 Registration does not exist', () => {

    })

    describe('TC-402-4 Succesfully signed out', () => {

    })

})

// UC-403
describe('UC-403 Request list of participants /api/meal/:id/participants', () => {
    describe('TC-403-1 Not logged in', () => {

    })

    describe('TC-403-2 Meal does not exist', () => {

    })

    describe('TC-403-3 List of participants has been returned', () => {

    })

})

// UC-404
describe('UC-404 Request details of participant /api/user/:id  || /api/meal/:id/participants/:id', () => {
    describe('TC-404-1 Not logged in', () => {

    })

    describe('TC-404-2 Meal does not exist', () => {

    })

    describe('TC-404-3 Details of participants has been returned', () => {

    })

})