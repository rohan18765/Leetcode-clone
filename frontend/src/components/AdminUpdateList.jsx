
import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { Edit } from 'lucide-react';

function AdminUpdateList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // Assuming this route returns a list of your problems
        const response = await axiosClient.get('/problem/getAllproblem'); 
        setProblems(response.data);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Select Problem to Update</h1>
      
      {problems.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <span>No problems found in the database.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem._id} className="hover">
                  <td className="font-semibold">{problem.title}</td>
                  <td>
                    <div className={`badge ${
                      problem.difficulty === 'easy' ? 'badge-success' : 
                      problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {problem.difficulty}
                    </div>
                  </td>
                  <td><div className="badge badge-outline">{problem.tags}</div></td>
                  <td className="text-right">
                    <button 
                      onClick={() => navigate(`/admin/update/${problem._id}`)}
                      className="btn btn-sm btn-primary"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUpdateList;