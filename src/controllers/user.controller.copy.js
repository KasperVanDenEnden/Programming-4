
const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");
const assert = require("assert");


let users = [];
let id = 0;
let profile = 0;


let controller = {
  validateLogin: (req, res, next) => {
    let login = req.body;
    let { emailAdress, password } = login;
    try {
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
  },
  validateUser: (req, res, next) => {
    let user = req.body;
    let {
      id,
      firstName,
      lastName,
      street,
      city,
      postcode,
      emailAdress,
      password,
      phoneNumber,
    } = user;
    try {
      assert(typeof firstName === "string", "Firstname must be a string");
      assert(typeof lastName === "string", "Lastname must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      assert(typeof postcode === "string", 'Postcode must be a string')
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof phoneNumber === "string", "Phonenumber must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };

      next(error);
    }
  },

  validateIdInput: (req, res, next) => {
    let param = req.params.id;
    let regex = /^[0-9]{1,}$/;
    if (regex.test(param)) {
      next();
    } else {
      const error = {
        status: 400,
        result: "Id input can only contain numbers",
      };
      next(error);
    }
  },

  regexpPostcode: (req,res,next) => {
    let postcode = req.body.postcode

    let regex = 
    /^[0-9]{4}[a-z]{2}/ ||
    /^[0-9]{4}\s[a-z]{2}/ ||
    /^[0-9]{4}[A-Z]{2}/ ||
    /^[0-9]{4}\s[A-Z]{2}/;

    if (regex.test(postcode)){
      next()
    } else {
      const error = { 
        status: 400,
        result: "No valid postcode format"
      }
      next(error);
    }
  },


  regexpEmail: (req, res, next) => {
    let email = req.body.emailAdress;

    let regex =
      /^[a-z]{1,}.[a-z]{1,}@[a-z]{1,}.[a-z]{1,}/ ||
      /^[a-z]{1,}@[a-z]{1,}.[a-z]{1,}/;

    if (regex.test(email)) {
      next();
    } else {
      const error = {
        status: 400,
        result: "No valid email format",
      };

      next(error);
    }
  },

  regexpPhoneNumber: (req, res, next) => {
    let phoneNumber = req.body.phoneNumber;

    let regex = /^[0-9]{2}\s[0-9]{8}/;

    if (regex.test(phoneNumber)) {
      next();
    } else {
      const error = {
        status: 400,
        result: "No valid phonenumber format",
      };

      next(error);
    }
  },
  databaseEmptyCheck: (req,res,next) => {
    if (users.length > 0) {
      next()
    } else {
      let error = {
        status: 400,
        result: users
      }
      next(error)
    }

  },
  // paths
  login: (req, res) => {
    let privateKey = fs.readFileSync('../../private.pem', 'utf8')
    let token = jwt.sign({"body" : "stuff"}, privateKey, {algorithm: 'HS256'})
    res.send(token)

    // const email = req.body.emailAdress;
    // const password = req.body.password;
    // console.log(email + ' | ' + password)
    // let user = users.filter(
    //   (item) => item.password == password && item.emailAdress == email
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
  addUser: (req, res) => {

  //   database.addUser(req.body,(error,result) =>{
  //   if (error) {
  //     console.log(`index.js : ${error}`)
  //     res.status(409).json({
  //       status:409,
  //       error: `Email in not unique!`
  //     })

  //   }
  // })



    let user = req.body;
    let email = req.body.emailAdress;
    let check = users.filter((item) => item.emailAdress == email);

    if (check.length == 0) {
      id++;
      user = {
        id,
        isActive: true,
        ...user,
      };
      users.push(user);

      res.status(201).json({
        status: 201,
        result: `User is added!`
      });
    } else {
      res.status(409).json({
        status: 409,
        result: `Email is not unique!`
      });
      check = true;
    }
  },
  getAllUsers: (req, res) => {
    let size = users.length;

    try {
      assert(typeof users === "array", "Length of array is (" + size + ").");
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
    }

    if (users.length > 0) {
      const mapped = users.map(
        ({
          id,
          firstName,
          lastName,
          isActive,
          emailAdress,
          phoneNumber,
          city,
          postcode
        }) => ({
          id,
          firstName,
          lastName,
          isActive,
          emailAdress,
          phoneNumber,
          city,
          postcode
        })
      );

      res.status(201).json({
        status: 201,
        result: mapped,
      });
    } else {
      res.status(200).json({
        status: 200,
        result: "No users exists yet",
      });
    }
  },
  getUserById: (req, res) => {
    const id = req.params.id;
    console.log(id);

    let user = users.filter((item) => item.id == id);

    if (user.length > 0) {
      const mapped = user.map(
        ({
          id,
          firstName,
          lastName,
          isActive,
          emailAdress,
          phoneNumber,
          city,
          postcode,
        }) => ({
          id,
          firstName,
          lastName,
          isActive,
          emailAdress,
          phoneNumber,
          city,
          postcode,
        })
      );
      res.status(200).json({
        status: 200,
        result: mapped,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with ID ${id} not found`,
      });
    }
  },
  updateUser: (req, res) => {
    dbconnection.getConnection((err,connection) => {
        if (err) throw err
        const id = Number(req.params.id)
        
        if (isNaN(id)) {
          return next()
        }
      
        const newUser = req.body

        connection.query("SELECT * FROM USER WHERE id = ?", id, (err,result,fields) =>{
          if (err) throw err

          const oldUser = result[0]
          if (oldUser) {

            connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ? and id <> ?" [newUser.emailAdress, id], (err, result, fields) => {
              if (err) throw err

              if (result[0].count === 1) {
                return next({
                  status: 409,
                  result: "Email is not unique!"
                })
              } else {
                const user = {
                  ...oldUser,
                  ...newUser
                  
                }
                const { firstName, lastName, emailAdress, phoneNumber, postcode, password, street, city} = user

                connection.query("UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, phoneNumber =?, postcode = ?, password = ?, street = ?, city = ? WHERE id = ?", [firstName, lastName, emailAdress, phoneNumber, postcode, password, street, city, id], (err, result, fields) => {
                  if (err) throw err

                  connection.release()

                  res.status(200).json({
                    status: 200,
                    result: user
                  })
                  res.end()
                })
              }
            }) 
          } else {
            return next({
              status: 400,
              result: `User with ID ${id} not found`
            })
          }
        })
    })
  },
  deleteUser: (req, res) => {
    const id = req.params.id;
    let check = users.filter((item) => item.id == id);

    if (check.length > 0) {
      users = users.filter((item) => item.id === id);
      res.status(200).json({
        status: 200,
        result: `User with id ${id} has been deleted`,
      });
    } else {
      res.status(400).json({
        status: 400,
        result: `No user with id ${id} was found`,
      });
    }
  },
  getProfile: (req, res) => {
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
};



module.exports = controller;
