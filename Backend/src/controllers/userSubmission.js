const Problem = require("../models/problem");
const { Submission } = require("../models/Submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");

// --- NEW ENCODING HELPER ---
const encodeBase64 = (str) => {
    if (str === null || str === undefined) return null;
    return Buffer.from(String(str)).toString("base64");
};

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id; 
        const problemId = req.params.id;
        const { code, language } = req.body;
        
        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some field missing");
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).send("Problem not found in database");
        }

        let parsedLanguage = language === 'cpp' ? 'c++' : language;

        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language : parsedLanguage ,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });

        const languageId = getLanguageById(parsedLanguage);

        const normalizeLang = (l) => {
            if (!l) return '';
            const lower = l.toLowerCase();
            if (lower === 'c++' || lower === 'cpp') return 'cpp';
            if (lower === 'javascript' || lower === 'js') return 'javascript';
            return lower;
        };

        const requestLang = normalizeLang(language); 
        const driverObj = problem.driverCode?.find(dc => normalizeLang(dc.language) === requestLang);
        let finalExecutableCode = code; 

        if (driverObj && driverObj.code) {
            finalExecutableCode = driverObj.code.replace('{{USER_CODE}}', code);
        } else {
            console.warn(`[WARNING] No driver code found for normalized language '${requestLang}' on problem ${problemId}`);
        }

        // --- ENCODING APPLIED HERE ---
        const base64Code = encodeBase64(finalExecutableCode);
        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: base64Code, 
            language_id: languageId,
            stdin: encodeBase64(testcase.input),
            expected_output: encodeBase64(testcase.output)
        }));

        let testResult;
        try {
            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            testResult = await submitToken(resultToken);
        } catch (compilerError) {
            console.error("Judge0 API Error:", compilerError.message);
            submittedResult.status = 'error';
            submittedResult.errorMessage = "Compiler API failed or rate limit exceeded.";
            await submittedResult.save();
            return res.status(500).send("Compiler API Error. Submission saved as 'error'.");
        }

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = '';

        for (const test of testResult) {
            if (test.status_id == 3) { 
                testCasesPassed++;
                runtime += parseFloat(test.time || 0); 
                memory = Math.max(memory, test.memory || 0);
            } else {
                if (test.status_id == 4) {
                    status = 'wrong';
                    errorMessage = test.stderr || "Wrong Answer";
                } else {
                    status = 'error'; 
                    errorMessage = test.stderr || test.compile_output || "Compilation/Runtime Error";
                }
            }
        }

        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        const accepted = (status === 'accepted');
        
        if (accepted && !req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }
        
        return res.status(201).json({
            accepted,
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory,
            errorMessage
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const runCode = async (req, res) => {
    try {
        const userId = req.result._id; 
        const problemId = req.params.id;
        const { code, language } = req.body;
        
        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some field missing");
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).send("Problem not found in database");
        }
        
        let parsedLanguage = language === 'cpp' ? 'c++' : language;
        const languageId = getLanguageById(parsedLanguage);

        const normalizeLang = (l) => {
            if (!l) return '';
            const lower = l.toLowerCase();
            if (lower === 'c++' || lower === 'cpp') return 'cpp';
            if (lower === 'javascript' || lower === 'js') return 'javascript';
            return lower;
        };

        const requestLang = normalizeLang(language); 
        const driverObj = problem.driverCode?.find(dc => normalizeLang(dc.language) === requestLang);
        let finalExecutableCode = code; 

        if (driverObj && driverObj.code) {
            finalExecutableCode = driverObj.code.replace('{{USER_CODE}}', code);
        } else {
            console.warn(`[WARNING] No driver code found for normalized language '${requestLang}' on problem ${problemId}`);
        }

        // --- ENCODING APPLIED HERE ---
        const base64Code = encodeBase64(finalExecutableCode);
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: base64Code, 
            language_id: languageId,
            stdin: encodeBase64(testcase.input),
            expected_output: encodeBase64(testcase.output)
        }));

        try {
            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);
            
            let testCasesPassed = 0;
            let runtime = 0;
            let memory = 0;
            let status = true;
            let errorMessage = null;

            for (const test of testResult) {
                if (test.status_id == 3) {
                    testCasesPassed++;
                    runtime += parseFloat(test.time || 0);
                    memory = Math.max(memory, test.memory || 0);
                } else {
                    status = false;
                    errorMessage = test.stderr || test.compile_output || "Error";
                }
            }

            return res.status(200).json({
                success: status,
                testCasesPassed,
                totalTestCases: problem.visibleTestCases.length,
                testCases: testResult, 
                runtime,
                memory,
                errorMessage
            });

        } catch (compilerError) {
            console.error("Judge0 API Error:", compilerError.message);
            return res.status(500).send("Compiler API failed. Please try again later.");
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

module.exports = { submitCode, runCode };