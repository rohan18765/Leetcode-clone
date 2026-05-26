const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "python": 71,
        "javascript": 93
    }
    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'true' // 👈 CHANGED TO TRUE
        },
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Judge0 Error Details:", JSON.stringify(error.response.data));
            } else {
                console.error("Axios Network Error:", error.message);
            }
            throw error;
        }
    }

    return await fetchData();
}

const waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timer);
    });
};

// --- NEW DECODING HELPER ---
const decodeBase64 = (str) => {
    if (!str) return str;
    return Buffer.from(str, 'base64').toString('utf-8');
};

const submitToken = async (resultToken) => {
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'true', // 👈 CHANGED TO TRUE
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Judge0 Batch Error Details:", error.response.data);
            } else {
                console.error("Axios Network Error:", error.message);
            }
            throw error;
        }
    }

    while (true) {
        const result = await fetchData();
        const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

        if (IsResultObtained) {
            // 👈 Decode the outputs from Judge0 back to normal text before sending to frontend!
            return result.submissions.map(sub => ({
                ...sub,
                stdout: decodeBase64(sub.stdout),
                stderr: decodeBase64(sub.stderr),
                compile_output: decodeBase64(sub.compile_output),
                message: decodeBase64(sub.message),
                stdin: decodeBase64(sub.stdin),
                expected_output: decodeBase64(sub.expected_output)
            }));
        }

        await waiting(1000);
    }
}

module.exports = { getLanguageById, submitBatch, submitToken };