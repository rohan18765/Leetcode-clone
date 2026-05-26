import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ReactMarkdown from 'react-markdown';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  // Helper to map Database language strings to Monaco/State strings
  const normalizeLanguage = (dbLang) => {
    const lang = dbLang.toLowerCase();
    if (lang === 'c++') return 'cpp';
    if (lang === 'javascript' || lang === 'js') return 'javascript';
    if (lang === 'java') return 'java';
    return lang;
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);

        // Safely find initial code using the normalizer
        const initialSnippet = response.data.startCode?.find(
          (sc) => normalizeLanguage(sc.language) === selectedLanguage
        );
        
        setCode(initialSnippet ? initialSnippet.initialCode : '// Start coding here');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem && problem.startCode) {
      const languageSnippet = problem.startCode.find(
        (sc) => normalizeLanguage(sc.language) === selectedLanguage
      );
      setCode(languageSnippet ? languageSnippet.initialCode : '');
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveRightTab('testcase'); 
    
    try {
      const response = await axiosClient.post(`/submission/runcode/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        errorMessage: 'Internal server error or compiler timeout'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveRightTab('result'); 
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        errorMessage: 'Submission failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-gray-400 bg-gray-800/50 border-gray-700';
    }
  };

  // Reusable Spinner
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-[#cbbda6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Tab Styles
  const getTabStyle = (isActive) => 
    `px-5 py-3 text-sm font-medium transition-colors border-b-2 outline-none flex items-center gap-2 ${
      isActive 
        ? 'border-[#cbbda6] text-[#cbbda6] bg-[#262626]' 
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#262626]/50'
    }`;

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#2a2929] text-gray-200 font-sans overflow-hidden selection:bg-[#cbbda6]/30">
      
      {/* ---------------- LEFT PANEL ---------------- */}
      <div className="w-1/2 flex flex-col border-r border-gray-700">
        
        {/* Left Tabs */}
        <div className="flex bg-[#222121] border-b border-gray-700 overflow-x-auto custom-scrollbar">
          <button className={getTabStyle(activeLeftTab === 'description')} onClick={() => setActiveLeftTab('description')}>
            Description
          </button>
          <button className={getTabStyle(activeLeftTab === 'editorial')} onClick={() => setActiveLeftTab('editorial')}>
            Editorial
          </button>
          <button className={getTabStyle(activeLeftTab === 'solutions')} onClick={() => setActiveLeftTab('solutions')}>
            Solutions
          </button>
          <button className={getTabStyle(activeLeftTab === 'submissions')} onClick={() => setActiveLeftTab('submissions')}>
            Submissions
          </button>
          <button className={getTabStyle(activeLeftTab === 'chatAI')} onClick={() => setActiveLeftTab('chatAI')}>
            ✨ Chat AI
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#262626] custom-scrollbar">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{problem.title}</h1>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getDifficultyStyles(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none prose-pre:bg-[#333333] prose-pre:border prose-pre:border-gray-700 text-gray-300 text-sm leading-relaxed">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-semibold mb-4 text-white">Examples</h3>
                    <div className="space-y-5">
                      {problem.visibleTestCases?.map((example, index) => (
                        <div key={index} className="bg-[#333333] p-5 rounded-xl border border-gray-700 shadow-sm">
                          <h4 className="font-semibold mb-3 text-[#cbbda6]">Example {index + 1}:</h4>
                          <div className="space-y-3 text-sm font-mono">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <strong className="text-gray-400 min-w-[100px]">Input:</strong> 
                              <span className="text-gray-200 whitespace-pre-wrap">{example.input}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <strong className="text-gray-400 min-w-[100px]">Output:</strong> 
                              <span className="text-gray-200 whitespace-pre-wrap">{example.output}</span>
                            </div>
                            {example.explanation && (
                              <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2 border-t border-gray-700/50">
                                <strong className="text-gray-400 min-w-[100px] font-sans">Explanation:</strong> 
                                <span className="text-gray-300 font-sans">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-xl font-bold mb-4 text-[#cbbda6]">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                 <div>
                   <h2 className="text-xl font-bold mb-4 text-[#cbbda6]">Community Solutions</h2>
                   <p className="text-gray-400">Solutions feature coming soon.</p>
                 </div>
              )}

               {activeLeftTab === 'submissions' && (
                 <div>
                  <h2 className="text-xl font-bold mb-4 text-[#cbbda6]">My Submissions</h2>
                  <div className="text-gray-300">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                 </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div>
                  <h2 className="text-xl font-bold mb-2 text-[#b2a084]">✨ Chat with AI</h2>
                  <p className="text-sm text-gray-400 mb-6">Ask the AI tutor for hints or explanations!</p>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <div className="w-1/2 flex flex-col bg-[#262626]">
        
        {/* Right Tabs */}
        <div className="flex bg-[#282727] border-b border-gray-700 overflow-x-auto custom-scrollbar">
          <button className={getTabStyle(activeRightTab === 'code')} onClick={() => setActiveRightTab('code')}>
            Code Editor
          </button>
          <button className={getTabStyle(activeRightTab === 'testcase')} onClick={() => setActiveRightTab('testcase')}>
            Console
          </button>
          <button className={getTabStyle(activeRightTab === 'result')} onClick={() => setActiveRightTab('result')}>
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Language Selector */}
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-[#262626]">
                <div className="flex gap-2">
                  {['cpp', 'java', 'javascript'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                        selectedLanguage === lang 
                          ? 'bg-[#38362a] text-[#cbbda6] border-gray-600 shadow-sm' 
                          : 'text-white border-transparent hover:text-gray-200 hover:bg-[#7b7272]'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-0 py-2">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    padding: { top: 10 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }}
                />
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 border-t border-gray-700 flex justify-between items-center bg-[#2e2c2c]">
                <button 
                  className="text-gray-400 hover:text-[#cbbda6] px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#262626]"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M4 17h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Console
                  </span>
                </button>
                <div className="flex gap-3">
                  <button
                    className="flex justify-center items-center gap-2  bg-white border border-white hover:bg-amber-100 text-black  px-6 py-2 rounded-lg text-sm font-semibold transition-all min-w-[90px]"
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {loading && activeRightTab === 'testcase' ? <Spinner /> : 'Run'}
                  </button>
                  <button
                    className="flex justify-center items-center gap-2 bg-[#61993f] hover:bg-[#408513] text-[#262626] px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#cbbda6]/10 min-w-[100px]"
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {loading && activeRightTab === 'result' ? <Spinner /> : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#262626] custom-scrollbar">
              <h3 className="font-semibold mb-6 text-xl text-white">Console Output</h3>
              
              {loading ? (
                 <div className="flex justify-center mt-20"><Spinner /></div>
              ) : runResult ? (
                <div className="space-y-6">
                  {!runResult.success && runResult.errorMessage && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap">
                      {runResult.errorMessage}
                    </div>
                  )}

                  <div className={`text-2xl font-bold tracking-tight ${runResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {runResult.success ? 'Accepted' : 'Wrong Answer / Error'}
                  </div>
                  
                  {runResult.runtime !== undefined && (
                    <div className="flex gap-6 text-sm font-medium text-gray-400 bg-[#333333] p-3 rounded-lg inline-flex border border-gray-700">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {runResult.runtime} ms
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        {runResult.memory} KB
                      </span>
                    </div>
                  )}

                  <div className="mt-8 space-y-5">
                    {runResult.testCases?.map((tc, i) => (
                      <div key={i} className="bg-[#333333] p-5 rounded-xl text-sm border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-white">Test Case {i + 1}</h4>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${tc.status_id === 3 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {tc.status_id === 3 ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="font-mono space-y-4">
                          <div>
                            <strong className="text-gray-500 block mb-1">Input:</strong>
                            <div className="bg-[#262626] p-3 rounded-lg border border-gray-700 text-gray-300 whitespace-pre-wrap">{tc.stdin}</div>
                          </div>
                          <div>
                            <strong className="text-gray-500 block mb-1">Expected:</strong>
                            <div className="bg-[#262626] p-3 rounded-lg border border-gray-700 text-gray-300 whitespace-pre-wrap">{tc.expected_output}</div>
                          </div>
                          <div>
                            <strong className="text-gray-500 block mb-1">Your Output:</strong>
                            <div className={`bg-[#262626] p-3 rounded-lg border text-gray-300 whitespace-pre-wrap ${tc.status_id === 3 ? 'border-gray-700' : 'border-rose-500/30'}`}>
                              {tc.stdout || tc.stderr || tc.compile_output || "null"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center h-full pb-20">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9l3 3-3 3m5 0h3M4 17h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <p>Run your code to see console output here.</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-8 overflow-y-auto bg-[#262626] custom-scrollbar">
              {loading ? (
                 <div className="flex justify-center mt-20"><Spinner /></div>
              ) : submitResult ? (
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center pb-6 border-b border-gray-700">
                    <h2 className={`text-4xl font-extrabold tracking-tight mb-2 ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {submitResult.accepted ? 'Accepted!' : 'Rejected'}
                    </h2>
                    <p className="text-gray-400">
                      {submitResult.accepted ? 'Great job! You successfully solved this problem.' : 'Don\'t give up. Check the error and try again.'}
                    </p>
                  </div>
                  
                  {!submitResult.accepted && submitResult.errorMessage && (
                    <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-5 rounded-xl font-mono text-sm whitespace-pre-wrap shadow-sm">
                      {submitResult.errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#333333] p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-gray-500 text-sm font-medium mb-1">Test Cases</span>
                      <span className="text-2xl font-bold text-white">
                        {submitResult.passedTestCases} <span className="text-gray-500 text-lg font-normal">/ {submitResult.totalTestCases}</span>
                      </span>
                    </div>
                    
                    {submitResult.runtime !== undefined && (
                      <div className="bg-[#333333] p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-gray-500 text-sm font-medium mb-1">Runtime</span>
                        <span className="text-2xl font-bold text-white">
                          {submitResult.runtime} <span className="text-gray-500 text-base font-normal">ms</span>
                        </span>
                      </div>
                    )}
                    
                    {submitResult.memory !== undefined && (
                      <div className="bg-[#333333] p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-gray-500 text-sm font-medium mb-1">Memory</span>
                        <span className="text-2xl font-bold text-white">
                          {submitResult.memory} <span className="text-gray-500 text-base font-normal">KB</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center h-full pb-20">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p>Submit your code to see final evaluation here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Optional: Add custom scrollbar styling in your global CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
      `}} />
    </div>
  );
};

export default ProblemPage;