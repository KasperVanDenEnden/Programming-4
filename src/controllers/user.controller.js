const res = require("express/lib/response");
const assert = require('assert')


let users = [];
let userId = 0;
let profile = 0;

let controller = {
    validateUser:(req,res,next) => {
        
        let user = req.body
        let {userId, firstName, lastName, emailAdress, phoneNumber, ...other} = user
        try {
            assert(typeof firstName === 'string', 'Firstname must be a string')
            assert(typeof lastName === 'string', 'Lastname must be a string')
            assert(typeof phoneNumber === 'number', 'Phonenumber must be a number')
            next()
        } catch(err){
            const error = { 
                status: 400,
                result: err.message
            }
                
            next(error)
        }
    },


    login:(req,res) =>{
        // const email = req.params.emailAdress;
    // const password = req.params.password;
    // let user = users.filter(
    //   (item) => item.password == password && item.emailAdress == emailAdress
    // );
    // if (user.length > 0) {
    //   profile = user.id;
    //   res.status(201).json({
    //     status: 201,
    //     result: user,
    //   });
    // } else {
    //   res.status(401).json({
    //     status: 401,
    //     result: "Wrong credentials",
    //   });
    // }
    },
    addUser:(req,res) => {
        let user = req.body;
        let email = req.body.emailAdress;
        let check = users.filter((item) => item.emailAdress == email);
      
        if (check.length == 0) {
          userId++;
          user = {
            userId,
            ...user,
          };
          users.push(user);
          console.log(users.length);
      
          res.status(201).json({
            status: 201,
            result: `User is added!`,
          });
        } else {
          res.status(401).json({
            status: 401,
            result: `Email is not unique!`,
          });
          check = true;
        }
    },
    getAllUsers:(req,res) => {
        if (users.length > 0) {
            res.status(201).json({
              status: 201,
              result: users,
            });
          } else {
            res.status(401).json({
              status: 401,
              result: "No users exists yet",
            });
          }
    },
    getUserById:(req,res) => {
        const id = req.params.id;
    console.log(id);
    let user = users.filter((item) => item.userId == id);
    if (user.length > 0) {
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with ID ${id} not found`,
      });
    }
    },
    updateUser:(req,res) => {
        const id = req.params.id;
    const body = req.body;
    let check = users.filter((item) => item.userId == id);
  
    if (check.length > 0) {
      let index = users.findIndex((item) => item.userId == id);
      users[index] = body;
      res.status(201).json({
        status: 201,
        result: `Updated user with ID ${id}`,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with ID ${id} not found`,
      });
    }
    },
    deleteUser:(req,res) => {
        const id = req.params.id;
    let check = users.filter((item) => item.userId == id);
    console.log(check.length);
  
    if (check.length > 0) {
      users = users.filter((item) => item.userId === id);
      res.status(201).json({
        status: 255,
        result: `User with userId ${id} has been deleted`,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `No user with userID ${id} was found`,
      });
    }
    },
    getProfile:(req,res) => {
        let user = users.filter((item) => item.id == profile);
        if (user.length > 0) {
        res.status(201).json({
            status: 201,
            result: user,
        });
        } else {
        res.status(404).json({
            status: 404,
            result: "This function is not realised yet!",
            // result: `No profile was found! Make sure you are logged in!`,
        });
        }
    },
}


module.exports = controller