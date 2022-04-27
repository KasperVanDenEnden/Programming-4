const chai = require('chai')
const chaiHttp = require('chai-http');
const res = require('express/lib/response');
const server = require('../../index')
let database = [];

chai.should()
chai.use(chaiHttp)


// UC-101
describe('UC-101 login /api/aut/login', () => {
    describe('TC-101-1 required field is missing', () => {

    })

    describe('TC-101-2 wrong email', () => {

    })

    describe('TC-101-3 Wrong password', () => {

    })

    describe('TC-101-4 User does not exist', () => {

    })

    describe('TC-101-5 Succesfull login', () => {

    })

})


// UC-201
describe('UC-201 Manage users /api/user ', () => {
    describe('TC-201-1 add user',() =>{
        beforeEach((done) => {
            database = []
            done()
        })

        it('TC-201 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                // firstname ontbreekt
                lastName: 'van den Enden',
                phoneNumber: 06363,
            })
            .end((err,res) =>{
                res.should.be.an('object')
                let {status,result} = res.body
                status.should.equals(400)
                result.should.be.a('string').that.equals('Firstname must be a string')
                done()
            })
           it('TC-201 Other test examlpe', ( ) => {})
        })
    })

    describe('TC-201-2 wrong email', () => {

    })

    describe('TC-201-3 Wrong password', () => {

    })

    describe('TC-201-4 User already exist', () => {

    })

    describe('TC-201-5 Succesfull registration', () => {

    })

})

// UC-202
describe('UC-202 Request list of users /api/user', () => {
    describe('TC-202-1 Show zero users', () => {

    })

    describe('TC-202-2 Show two users', () => {

    })

    describe('TC-202-3 Show users with search of no existing name', () => {

    })

    describe('TC-202-4 Show users with search "isActive=false"', () => {

    })

    describe('TC-202-5 Show users with search "isActive=true"', () => {

    })

    describe('TC-202-6 Show users with search of existing name', () => {

    })

})

// UC-203
describe('UC-203 Request user profile /api/user/profile', () => {
    describe('TC-203-1 Illegal token', () => {

    })

    describe('TC-203-2 Legal token and user exists', () => {

    })

})

// UC-204
describe('UC-204 Request user details /api/user/:id', () => {
    describe('TC-204-1 Illegal token', () => {

    })

    describe('TC-204-2 UserId does exist', () => {

    })

    describe('TC-204-3 UserId does not exist', () => {

    })

})

// UC-205
describe('UC-205 Update user /api/user/:id', () => {
    describe('TC-205-1 required field is missing', () => {

    })

    describe('TC-205-2 No valid postcode', () => {

    })

    describe('TC-205-3 No valid phonenumber', () => {

    })

    describe('TC-205-4 User does not exist', () => {

    })

    describe('TC-205-5 User has been updated', () => {

    })

})

// UC-206
describe('UC-206 Update user /api/user/:id', () => {
    describe('TC-206-1 User does not exist', () => {

    })

    describe('TC-206-2 Not logged in', () => {

    })

    describe('TC-206-3 Actor is no owner', () => {

    })

    describe('TC-206-4 User has been deleted', () => {

    })

})