const express = require('express');
const {createProblem , updateProblem  , deleteProblem , getProblemById , getAllProblem , solvedProblemsbyUser , submittedProblem , adminGetProblemById} = require("../controllers/userProblem")

const adminMiddleware = require("../middleware/adminMiddleware")
const userMiddleware = require("../middleware/userMiddleware") ;
const problemRouter =  express.Router();

// Create problem 
problemRouter.post("/create",adminMiddleware ,createProblem);

// update problem 
problemRouter.put("/update/:id", adminMiddleware , updateProblem);

// delete problem 

problemRouter.delete("/delete/:id", adminMiddleware , deleteProblem);

// get problem by their id 
problemRouter.get("/problemById/:id", userMiddleware , getProblemById);

// get all problem list 
problemRouter.get("/getAllproblem", userMiddleware , getAllProblem);


problemRouter.get("/problemSolvedByUser", userMiddleware , solvedProblemsbyUser);

problemRouter.get("/submittedProblem/:pid" , userMiddleware , submittedProblem ) ;
// Make sure this is protected by your admin middleware!
problemRouter.get('/admin/problemById/:id', adminMiddleware , adminGetProblemById);

module.exports = problemRouter ;
