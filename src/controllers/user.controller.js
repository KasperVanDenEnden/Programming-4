const dbconnection = require("../../database/dbconnection");
const assert = require("assert");
const { info } = require("console");
const logger = require("../config/config").logger;

let controller = {
  
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, street, city, emailAdress, password } = user;
    try {
      assert(typeof firstName === "string", "Firstname must be a string");
      assert(typeof lastName === "string", "Lastname must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      logger.info("Alle user inputs zijn strings");
      next();
    } catch (err) {
      logger.error("Niet alle user inputs zijn strings");
      const error = {
        status: 400,
        message: err.message,
      };

      next(error);
    }
  },
  validateUserUpdate: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, street, city, emailAdress, password, isActive } =
      user;
    try {
      assert(typeof firstName === "string", "Firstname must be a string");
      assert(typeof lastName === "string", "Lastname must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof isActive === "boolean", "isActive must be a boolean");
      logger.info("Alle user inputs voor update zijn strings");
      next();
    } catch (err) {
      logger.error("Niet alle user inputs voor update zijn strings");
      const error = {
        status: 400,
        message: err.message,
      };

      next(error);
    }
  },
  addUserRegex: (req, res, next) => {
    const { emailAdress, password } = req.body;

    let regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // password: eight characters including one uppercase letter, one lowercase letter, and one number or special character.
    let regexPassword = /^(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    if (!regexMail.test(emailAdress)) {
      logger.error("Email is not a valid format")
      const error = {
        status: 400,
        message: "Email is not a valid format",
      };
      next(error);
    }
    logger.info("Email matched regex")
    if (!regexPassword.test(password)) {
      logger.error("Make sure the password contains: eight characters including one uppercase letter, one lowercase letter, and one number or special character.")
      const error = {
        status: 400,
        message:
          "Make sure the password contains: eight characters including one uppercase letter, one lowercase letter, and one number or special character.",
      };
      next(error);
    }
    logger.info("Password matched regex")
    next()

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
            logger.error("Email is not unique!");
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
                logger.info("User wordt aangemaakt");
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
                    logger.info("Aangemaakte user wordt teruggegeven");
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
  getAllUsers: (req, res, next) => {
    const queryParams = req.query;
    logger.info(queryParams);

    const { firstName, isActive } = queryParams;
    logger.info(`firstName = ${firstName} isActive = ${isActive}`);
    let queryString = "SELECT * FROM user";
    if (firstName || isActive) {
      queryString += " WHERE ";

      if (firstName) {
        queryString += `firstName LIKE '%${firstName}%'`;
      }
      if (firstName && isActive) {
        queryString += ` AND `;
      }
      if (isActive) {
        queryString += `isActive = ${isActive}`;
      }
    }
    queryString += ";";
    logger.info(queryString);

    // firstName = '%' + firstName + '%'

    dbconnection.getConnection((err, connection) => {
      if (err) {
        next(err);
      }
      // if querystring is finished place it below instead of the hardcoded query
      connection.query(queryString, (err, result, fields) => {
        if (err) {
          next(err);
        }
        connection.release();
        logger.info("User met eventuele zoekvelden wordt teruggeven");
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
        [id],
        (err, result, fields) => {
          if (err) throw err;

          if (result[0].count === 1) {

            logger.info(`User met het gevraagde ${id} is gevonden`)
            connection.query(
              "SELECT * FROM user WHERE id = ?",
              [id],
              (err, result, fields) => {
                if (err) throw err;

                connection.release();

                logger.info(`User met ${id} wordt teruggegeven`)
                res.status(200).json({
                  status: 200,
                  result: result[0],
                });

                res.end();
              }
            );
          } else {
            logger.error("User does not exist")
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

      connection.query(
        "SELECT COUNT(id) as count FROM user WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (err) throw err;

          if (result[0].count === 0) {
            logger.errow("User does not exist")
            res.status(400).json({
              status: 400,
              message: "User does not exist",
            });
          } else {
            logger.info(`User met het gevraagde ${id} is gevonden`)
            connection.query(
              "SELECT * FROM user WHERE id = ?",
              [id],
              (err, result, fields) => {
                if (err) throw err;
                
                const user = {
                  ...result[0],
                  ...newUser,
                };

                let {
                  firstName,
                  lastName,
                  emailAdress,
                  password,
                  city,
                  street,
                  phoneNumber,
                } = user;

                connection.query(
                  "UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ?, phoneNumber = ? WHERE id = ?",
                  [
                    firstName,
                    lastName,
                    emailAdress,
                    password,
                    street,
                    city,
                    phoneNumber,
                    id,
                  ],
                  (err, result, fields) => {
                    if (err) throw err;
                    logger.info(`User met het ${id} is geupdate`)
                    connection.release();
                    logger.info(`Geupdate user met het ${id} wordt teruggegeven`)
                    res.status(200).json({
                      status: 200,
                      result: user,
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
            logger.error("User does not exist")
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
                  logger.info(`User met ${id} is deleted`)
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
