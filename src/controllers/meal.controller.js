const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");
const assert = require("assert");

let meals = [];
let id = 0;

let controller = {
  validateMeal:(req,res,next) =>{
    let meal = req.body
    let {} = meal

    try {
      assert(typeof name === "string", "Name must be a string");

      next()
    } catch (err) {
      const error = {
        status:400,
        message: err.message
      }
      next(error)
    }
  },


  addMeal: (req, res) => {
    let meal = req.body;
    id++;
    meal = {
      id,
      ...meal,
    };
    meals.push(meal);
    console.log(meals);
    res.status(201).json({
      status: 201,
      result: meal,
    });
  },
  getAllMeals: (req, res, next) => {
    const queryParams = req.query;
    console.log(queryParams);
    // const {} = queryParams
    // console.log(` = ${} &  = ${}`  )

    let queryString = `SELECT id, name FROM meal;`;
    console.log(queryString);

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
        "SELECT COUNT(id) as count FROM meal WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (err) throw err;
          if (result[0].count === 1) {
            connection.query(
              "SELECT * FROM meal WHERE id = ?",
              [id],
              (err, result, fields) => {
                connection.release();

                res.status(200).json({
                  status: 200,
                  result: result[0],
                });

                res.end();
              }
            );
          } else {
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
        "SELECT COUNT(id) as count FROM meal WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (result[0].count === 0) {
            res.status(400).json({
              status: 400,
              message: "Meal does not exist",
            });
          } else {
            connection.query(
              "DELETE FROM meal WHERE id = ?",
              [id],
              (err, result, fields) => {
                if (err) throw err;

                connection.release();

                if (result.affectedRows === 1) {
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
};

module.exports = controller;
