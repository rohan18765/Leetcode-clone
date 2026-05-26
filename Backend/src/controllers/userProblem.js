const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const { Submission } = require("../models/Submission");

const SolutionVideo = require("../models/solutionVideo");

const encodeBase64 = (str) => {
    if (str === null || str === undefined) return null;
    return Buffer.from(String(str)).toString("base64");
};

const createProblem = async (req,res)=>{
    const {
        title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode,
        referenceSolution, driverCode, problemCreator 
    } = req.body;

    try{
        for (const {language, completeCode} of referenceSolution) {
            const languageId = getLanguageById(language);
            
            const matchingDriver = driverCode.find(
                (dc) => dc.language.toLowerCase() === language.toLowerCase()
            );

            let executableCode = completeCode;

            if (matchingDriver && matchingDriver.code) {
                executableCode = matchingDriver.code.replace('{{USER_CODE}}', completeCode);
            } else {
                return res.status(400).send(`Missing driver code for language: ${language}`);
            }
            
            // --- ENCODING APPLIED HERE ---
            const submissions = visibleTestCases.map((testcase)=>({
                source_code: encodeBase64(executableCode), 
                language_id: languageId,
                stdin: encodeBase64(testcase.input),
                expected_output: encodeBase64(testcase.output)
            }));

            const submitResult = await submitBatch(submissions);

            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).send("Failed to get a valid response from the compiler API");
            }

            const resultToken = submitResult.map((value)=> value.token);
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send(`Reference solution for ${language} does not pass all visible test cases`);
                }
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+ err);
    }
}

const updateProblem = async ( req , res) => {
    const {id} = req.params;
    const {
        title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode,
        referenceSolution, driverCode, problemCreator
    } = req.body;

    try { 
        if(!id) {
            return res.status(400).send("Missing Id Field");
        }

        const DsaProblem = await Problem.findById(id);

        if(!DsaProblem)
            return res.status(404).send("Problem is not present")

        for (const {language, completeCode} of referenceSolution) {
            const languageId = getLanguageById(language);
            
            const matchingDriver = driverCode.find(
                (dc) => dc.language.toLowerCase() === language.toLowerCase()
            );

            let executableCode = completeCode;

            if (matchingDriver && matchingDriver.code) {
                executableCode = matchingDriver.code.replace('{{USER_CODE}}', completeCode);
            } else {
                return res.status(400).send(`Missing driver code for language: ${language}`);
            }
            
            // --- ENCODING APPLIED HERE ---
            const submissions = visibleTestCases.map((testcase)=>({
                source_code: encodeBase64(executableCode), 
                language_id: languageId,
                stdin: encodeBase64(testcase.input),
                expected_output: encodeBase64(testcase.output)
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value)=> value.token);
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if(test.status_id != 3) {
                    return res.status(400).send(`Reference solution for ${language} does not pass test cases. Update Failed.`);
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate( id , {...req.body} , {runValidators:true , new:true} );
        
        res.status(200).send(newProblem);

    }
    catch(err){
        res.status(500).send("Error is " + err); // Changed from 404 to 500 for catch block
    }
}


const deleteProblem = async( req , res) =>
{
    const {id} = req.params ;

    try
    {
        if( !id)
        {
           return res.status(400).send("Missing Id Field");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem)
        {
            res.status(404).send("problem is missing") ;
        }

        res.status(200).send("problem deleted successfully");

    }
    catch(err)
    {
       res.status(500).send("Error is " + err);
    }

}

const getProblemById = async( req , res) =>
{

    const {id} = req.params ;

    try{
     
        if(!id){
            return res.status(404).send("Missing Id Field");
        }
        

        // .select()---> we are selecting only the fields that a user can see 
        // otherwise user can see all details 
        const getProblem = await Problem.findById(id).select(' _id title description difficulty tags visibleTestCases  startCode');

        if(!getProblem)
        {
            return res.status(404).send("Problem is missing");
        }

        const videos = await SolutionVideo.findOne({problemId:id});

        if(videos){   
            
        const responseData = {
            ...getProblem.toObject(),
            secureUrl:videos.secureUrl,
            thumbnailUrl : videos.thumbnailUrl,
            duration : videos.duration,
        } 
        
        return res.status(200).send(responseData);
        }


        res.status(200).send(getProblem);

    }
    catch(err){
        res.status(500).send("Error is " + err);
    }
}

const getAllProblem = async(req , res )=>
{
      
    
    try{
     

        const allProblem = await Problem.find({}).select('_id title difficulty tags');

        if(!allProblem)
        {
            return res.status(404).send("Sorry there is no problems");
        }

        res.status(200).send(allProblem);

    }
    catch(err){
        res.status(500).send("Error is " + err);
    }



}

const solvedProblemsbyUser = async(req , res)=>
{
   
    try{
     
       const userId = req.result._id ;
       
       const user = await User.findById(userId).populate('problemSolved' , 'title difficulty tags ');  
    
    // const count = req.result.problemSolved.length ;

       res.status(200).send(user.problemSolved);
        
        


    }
    catch(err)
    {
        res.status(500).send("Internal Server Error"); 
    }

}

const submittedProblem = async(req , res)=>
{  
   
    try{

        const userId = req.result._id ;
        const problemId = req.params.pid ;

        const answer = await Submission.find({userId , problemId});

        // if( answer.length == 0){
        //    res.status(200).send("No Submission yet")
        // }

        // res.status(200).send(answer);

        res.status(200).json(answer);
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }

   
  


}

// NEW CONTROLLER: Admin-only fetch that gets EVERYTHING
const adminGetProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        // Notice we do NOT use .select() here! We want the whole document.
        const problem = await Problem.findById(id); 
        
        if (!problem) {
            return res.status(404).send("Problem not found");
        }
        
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).send("Server Error: " + err);
    }
};






module.exports = {createProblem , updateProblem  , deleteProblem , getProblemById , getAllProblem ,solvedProblemsbyUser , submittedProblem , adminGetProblemById} ;

