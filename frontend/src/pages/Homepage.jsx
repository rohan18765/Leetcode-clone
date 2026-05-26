import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); 
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const statusMatch = filters.status === 'all' || 
                       (filters.status === 'solved' && isSolved) ||
                       (filters.status === 'unsolved' && !isSolved);
                       
    return difficultyMatch && tagMatch && statusMatch;
  });

  // Reusable styles
  const selectStyle = "bg-[#0d0d0d] border border-gray-800 text-gray-300 text-sm rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none hover:border-gray-600 transition-colors cursor-pointer appearance-none min-w-[140px]";

  return (
    <div className="min-h-screen bg-[#262626] text-gray-200 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation Bar */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* Removed Logo and changed text color to indigo-400 */}
              <NavLink to="/" className="flex items-center gap-2 group">
                {/* LeetCode-style Orange Icon (A simple code bracket icon from Heroicons) */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-7 w-7 text-[#FFA116]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                
                {/* LeetCode-style Typography */}
                <span className="text-[22px]  tracking-tight text-white flex items-center">
                  leet<span className="text-[#FFA116]">code</span>
                </span>
              </NavLink>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-[#0d0d0d] border border-gray-800 px-4 py-2 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {user?.firstName || 'User'}
                  <svg className="w-4 h-4 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="py-2">
                    {user?.role === 'admin' && (
                      <NavLink to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#0d0d0d] hover:text-indigo-400 transition-colors">
                        Admin Dashboard
                      </NavLink>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Filters */}
        <div className="mb-8 space-y-6">
          <div>
            {/* Changed text color to indigo-400 */}
            <h1 className="text-3xl font-sans text-[#bfae90]">Problem List</h1>
            <p className="text-[#cbbda6] mt-2">Practice and improve your coding skills.</p>
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800/60 shadow-lg flex flex-wrap gap-4 items-center">
            <div className="flex items-center text-sm font-medium text-gray-400 mr-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Filters
            </div>

            <select 
              className={selectStyle}
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Status: All</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            <select 
              className={selectStyle}
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all">Difficulty: All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select 
              className={selectStyle}
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all">Tags: All</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">Dynamic Programming</option>
            </select>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-gray-800 border-dashed">
              <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-lg font-medium text-gray-300">No problems found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            filteredProblems.map((problem, index) => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);
              
              return (
                <div key={problem._id} className="group bg-[#1a1a1a] border border-gray-800/60 hover:border-gray-500 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    {/* <div className="flex-shrink-0 w-8 flex justify-center">
                      {isSolved ? (
                        <div className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                      )}
                    </div> */}

                    {/* Title */}
                    <div>
                      <NavLink 
                        to={`/problem/${problem._id}`} 
                        className="text-lg font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors flex items-center gap-3"
                      >
                        <span className="text-[#cdad7a] text-sm font-mono">{index + 1}.</span> 
                        {problem.title}
                      </NavLink>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 pl-12 sm:pl-0">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getDifficultyStyles(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {problem.tags}
                    </span>
                    
                    <NavLink 
                      to={`/problem/${problem._id}`} 
                      className="ml-2 bg-[#0d0d0d] hover:bg-indigo-600 text-gray-400 hover:text-white border border-gray-700 hover:border-indigo-500 p-2 rounded-lg transition-all"
                      aria-label="Solve Problem"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </NavLink>
                  </div>
                  
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Helper for beautiful status colors
const getDifficultyStyles = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': 
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'medium': 
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard': 
      return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default: 
      return 'text-gray-400 bg-gray-800/50 border-gray-700';
  }
};

export default Homepage;