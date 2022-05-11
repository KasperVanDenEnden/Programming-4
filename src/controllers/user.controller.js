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
        message: err.message,
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
      // assert(typeof postcode === "string", 'Postcode must be a string')
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      // assert(typeof phoneNumber === "string", "Phonenumber must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };

      next(error);
    }
  },
  validateUserUpdate: (req, res, next) => {
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
      assert(typeof emailAdress === "string", "Email must be a string");

      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
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
        message: "Id input can only contain numbers",
      };
      next(error);
    }
  },

  regexpPostcode: (req, res, next) => {
    let postcode = req.body.postcode;

    let regex =
      /^[0-9]{4}[a-z]{2}/ ||
      /^[0-9]{4}\s[a-z]{2}/ ||
      /^[0-9]{4}[A-Z]{2}/ ||
      /^[0-9]{4}\s[A-Z]{2}/;

    if (regex.test(postcode)) {
      next();
    } else {
      const error = {
        status: 400,
        result: "No valid postcode format",
      };
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
  // paths
  login: (req, res) => {
    let privateKey = fs.readFileSync("../../private.pem", "utf8");
    let token = jwt.sign({ body: "stuff" }, privateKey, { algorithm: "HS256" });
    res.send(token);

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
    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      const { firstName, lastName, emailAdress, password, street, city } =
        req.body;

      connection.query(
        "SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?",
        [emailAdress],
        (err, result, fields) => {
          if (err) throw err;

          if (result[0].count === 1) {
            // error email bestaat al
            res.status(409).json({
              status: 409,
              message: "Email is not unique!",
            });
          } else {
            connection.query(
              "INSERT INTO user (firstName, lastName, street, city, emailAdress, password) VALUES (?,?,?,?,?,?)",
              [firstName, lastName, street, city, emailAdress, password],
              (err, result, fields) => {
                if (err) throw err;

                connection.query(
                  "SELECT * FROM user WHERE emailAdress = ?",
                  emailAdress,
                  (err, result, fields) => {
                    if (err) throw err;

                    connection.release();

                    if (result[0].isActive === 1) {
                      result[0].isActive = true;
                    } else {
                      result[0].isActive = false;
                    }

                    res.status(201).json({
                      status: 201,
                      result: result[0],
                    });

                    res.end();
                  }
                );
              }
            );
          }
        }
      );
    });
  },
  getAllUsers: (req, res) => {
    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query("SELECT * FROM USER", (err, result, fields) => {
        if (err) throw err;
        connection.release();

        res.status(200).json({
          status: 200,
          result: result,
        });
      });
    });
  },
  getUserById: (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        "SELECT COUNT(id) as count FROM user WHERE id = ?",
        id,
        (err, result, fields) => {
          if (err) throw err;

          if (result[0].count === 1) {
            connection.query(
              "SELECT * FROM user WHERE id = ?",
              id,
              (err, result, fields) => {
                if (err) throw err;

                connection.release();

                res.status(200).json({
                  status: 200,
                  result: result[0],
                });

                res.end()
              }
            );
          } else {
            res.status(404).json({
              status: 404,
              message: "User does not exist",
            });
          }    
        }
      );
    });
  },
  updateUser: (req, res) => {
    const id = req.params.id;
    const newUser = req.body;

    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;
      
      connection.query("SELECT COUNT(id) as count FROM user WHERE id = ?", [id], (err, result, fields) => {
          if (err) throw err;
          console.log(result[0].count)

          if (result[0].count === 0) {
            res.status(400).json({
              status: 400,
              message: "User does not exist",
            });
          } else {
            let {firstName, lastName, emailAdress, password, city, street} = newUser
            connection.query("UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ? WHERE id = ?", [firstName,lastName,emailAdress,password,street,city,id], (err,result,fields)=> {

              if (err) throw err;

                connection.query("SELECT * FROM user WHERE id = ?", [id], (err, result, fields) => {

                  connection.release()

                  res.status(200).json({
                    status: 200,
                    result: result
                  })

                  res.end()

                })
            })
          }
        }
      );
    });
  },
  deleteUser: (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        "SELECT COUNT(id) as count FROM user WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (err) throw err;

          if (result[0].count === 0) {
            res.status(400).json({
              status: 400,
              message: "User does not exist",
            });
          } else {
            connection.query(
              "DELETE FROM user WHERE id = ?",
              [id],
              (err, result, fields) => {
                if (err) throw err;

                connection.release();

                if (result.affectedRows === 1) {
                  res.status(200).json({
                    status: 200,
                    message: "User has been deleted",
                  });
                }

                res.end();
              }
            );
          }
        }
      );
    });
  },

  getProfile: (req, res) => {
    res.status(200).json({
      code: 200,
      message: "This feature has not ben realised yet",
    });
  },
};


module.exports = controller;
