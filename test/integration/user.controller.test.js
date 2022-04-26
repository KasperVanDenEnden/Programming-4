const chai = require('chai')
const chaiHttp = require('chai-http');
const res = require('express/lib/response');
const server = require('../../index')
let database = [];

chai.should()
chai.use(chaiHttp)

describe('UC-201 Manage users ', () => {
    describe('TC-1 add user /api/user',() =>{
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
           it('TC-202 Other test examlpe', ( ) => {})
        })
    })
    
})