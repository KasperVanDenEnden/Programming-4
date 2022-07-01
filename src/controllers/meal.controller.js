const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");
const assert = require("assert");
const logger = require("../config/config").logger;
const { is } = require("express/lib/request");
const jwt = require("jsonwebtoken");

let meals = [];
let id = 0;

// queries
const mealExists = "SELECT COUNT(name) as count FROM meal WHERE name = ? AND description = ? AND price = ? AND dateTime = ?";
const addMealQuery = "INSERT INTO meal (name, description, dateTime, price, imageUrl, cookId, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants) VALUES (?,?,?,?,?,?,?,?,?,?,?)";

const allMealsQuery = "SELECT id, name FROM meal;";
const ExistMealByIdQuery = "SELECT COUNT(id) as count FROM meal WHERE id = ?";
const mealByIdQuery = "SELECT * FROM meal WHERE id = ?";
const mealByNameQuery = "SELECT * FROM meal WHERE name = ?";

const updateMealQuery = "UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, name = ?, description = ? WHERE id = ?"; 
const deleteMealQuery = "DELETE FROM meal WHERE id = ?";

const getParticipantsByMealIdQuery = "SELECT * FROM meal_participants_user WHERE mealId = ?";
const addParticpantQuery = "INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)";
const deleteParticipantByIds = "DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?"; 



let controller = {
  validateMeal:(req,res,next) =>{
    let {isActive,isVega,isVegan,isToTakeHome,dateTime,price,imageUrl,cookId,name,description} = req.body

    try {
      assert(typeof name === "string", "Name must be a string");
      assert(typeof description === "string", "Description must be a string");
      assert(typeof dateTime === "string", "dateTime must be a string");
      assert(typeof price === "string", "price must be a string");
      assert(typeof imageUrl === "string", "imageUrl must be a string");
      assert(typeof cookId === "number", "cookId must be a number");

      assert(typeof isActive === 'boolean', "isActive must be a boolean")
      assert(typeof isVega === 'boolean', "isVega must be a boolean")
      assert(typeof isVegan === 'boolean', "isVegan must be a boolean")
      assert(typeof isToTakeHome === 'boolean', "isToTakeHome must be a boolean")
      
      logger.info(`Alle meal inputs hebben de juiste type`)

      next()
    } catch (err) {
      logger.error(`Niet alle meal inputs hebben de juiste type`)
      const error = {
        status:400,
        message: err.message
      }
      next(error)
    }
  },
  addMeal: (req, res) => {
   dbconnection.getConnection((err,connection)=> {
    if (err) throw err;
      const {name, description, dateTime, price, imageUrl, cookId, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants} = req.body

      connection.query( mealExists , [name, description, price, dateTime], (err,result,fields) =>{
        if (err) throw err;

        if (result[0] === 1) {
          logger.error("Meal already exists")
          res.status(404).json({
            status:404,
            message: "Meal already exists"
          })
        } else {
            connection.query( addMealQuery , [name,description,price,dateTime,imageUrl,cookId,isActive,isVega,isVegan,isToTakeHome, maxAmountOfParticipants], (err,result,fields) => {
              if (err) throw err;
              logger.info("New meal is added to the database")
              connection.query( mealByNameQuery , [name], (err,result,fields) => {
                if (err) throw err;

                connection.release();
                logger.info("New meal will be returned")
                res.status(201).json({
                  status: 201,
                  result: result[0],
                });
                res.end();
              })

            })


        }

      })
   })
  },
  getAllMeals: (req, res, next) => {
    const queryParams = req.query;
    logger.info(queryParams);
 
    dbconnection.getConnection((err, connection) => {
      if (err) {
        next(err);
      }
      // if querystring is finished place it below instead of the hardcoded query
      connection.query( allMealsQuery , (err, result, fields) => {
        if (err) {
          next(err);
        }
        connection.release();
        logger.info("All meals that have been found are returned")
        res.status(200).json({
          status: 200,
          result: result,
        });
      });
    });
  },
  getMealById: (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        ExistMealByIdQuery,
        [id],
        (err, result, fields) => {
          if (err) throw err;
          if (result[0].count === 1) {
            logger.info(`Meal with ${id} has been found`)
            connection.query(
              mealByIdQuery,
              [id],
              (err, result, fields) => {
                connection.release();
                logger.info(`Meal with ${id} is returned`)
                res.status(200).json({
                  status: 200,
                  result: result[0],
                });

                res.end();
              }
            );
          } else {
            logger.error("Meal does not exist")
            res.status(404).json({
              status: 404,
              message: "Meal does not exist",
            });
          }
        }
      );
    });
  },
  deleteMeal: (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        ExistMealByIdQuery,
        [id],
        (err, result, fields) => {
          if (result[0].count === 0) {
            logger.error("Meal does not exist")
            res.status(404).json({
              status: 404,
              message: "Meal does not exist",
            });
          } else {
            logger.info(`Meal with ${id} has been found`)
            connection.query(
              deleteMealQuery,
              [id],
              (err, result, fields) => {
                if (err) throw err;
                
                connection.release();

                if (result.affectedRows === 1) {
                  logger.info(`Meal with ${id} is deleted`)
                  res.status(200).json({
                    status: 200,
                    message: "Meal has been deleted",
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
  updateMeal: (req, res, next) => {
    id = req.params.id;
    const newMeal = req.body;

    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        "SELECT COUNT(id) as count FROM meal WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (err) throw err;

          if (result[0].count === 0) {
            logger.errow("Meal does not exist")
            res.status(400).json({
              status: 400,
              message: "Meal does not exist",
            });
          } else {
            logger.info(`Meal met het gevraagde ${id} is gevonden`)
            connection.query(
              mealByIdQuery,
              [id],
              (err, result, fields) => {
                if (err) throw err;
                
                const meal = {
                  ...result[0],
                  ...newMeal,
                };

                let {
                    isActive,
                    isVega,
                    isVegan,
                    isToTakeHome,
                    dateTime,
                    maxAmountOfParticipants,
                    price,
                    imageUrl,
                    name,
                    description,
                    id,
                } = meal;

                connection.query(
                  updateMealQuery,
                  [
                    isActive,
                    isVega,
                    isVegan,
                    isToTakeHome,
                    dateTime,
                    maxAmountOfParticipants,
                    price,
                    imageUrl,
                    name,
                    description,
                    id,
                  ],
                  (err, result, fields) => {
                    if (err) throw err;
                    logger.info(`Meal met het ${id} is geupdate`)
                    connection.release();
                    logger.info(`Geupdate meal met het ${id} wordt teruggegeven`)
                    res.status(200).json({
                      status: 200,
                      result: meal,
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
  participate: (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
        connection.release();
        if (err) next(err);

        const mealId = req.params.id;
        let userId;

        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7, authHeader.length);

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            userId = decoded.userId;
        });

        connection.query(mealByIdQuery, mealId, (error, results, fields) => {
            connection.release();
            if (error) next(error);

            if (results[0]) {

                const maxParticipants = results.maxAmountOfParticipants;

                connection.query(getParticipantsByMealIdQuery, mealId, (error, results, fields) => {
                    connection.release();
                    if (error) next(error);

                    let maxAmountOfParticipantsReached = false;
                    const numberOfparticipants = results.length;
                    if (numberOfparticipants === maxParticipants) {
                        maxAmountOfParticipantsReached = true;
                    }

                    let alreadyParticipating = false;
                    results.forEach(element => {
                        if (element.userId === userId) {
                            alreadyParticipating = true;
                        }
                    });

                    if (alreadyParticipating) {
                        connection.query(deleteParticipantByIds, [mealId, userId], (error, results, fields) => {
                            connection.release();
                            if (error) next(error);
                            res.status(200).json({
                                status: 200,
                                result: {
                                    'currentlyParticipating': false,
                                    'currentAmountOfParticipants': numberOfparticipants - 1
                                }
                            })
                        })
                    } else {
                        connection.query(addParticpantQuery, [mealId, userId], (error, results, fields) => {
                            connection.release();
                            if (error) next(error);

                            if (maxAmountOfParticipantsReached) {
                                res.status(401).json({
                                    status: 401,
                                    message: "This meal has reached its maximum amount of participants"
                                })
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    result: {
                                        'currentlyParticipating': true,
                                        'currentAmountOfParticipants': numberOfparticipants + 1
                                    }
                                })
                            }

                        })
                    }
                })

            } else {
                res.status(404).json({
                    status: 404,
                    message: "This meal does not exist"
                })
            }
        })
    })
  }
};

module.exports = controller;
