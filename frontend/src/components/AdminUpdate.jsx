
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams } from 'react-router';


// const {
//     register,
//     control,
//     handleSubmit,
//     reset, 
//     formState: { errors }
//   } = useForm({
//     resolver: zodResolver(problemSchema),
//     // ADD THIS: It prevents the form from crashing while waiting for data
//     defaultValues: {
//       title: "",
//       description: "",
//       difficulty: "easy",
//       tags: "array",
//       visibleTestCases: [],
//       hiddenTestCases: [],
//       startCode: [],
//       driverCode: [],
//       referenceSolution: []
//     }
//   });


// 1. Zod Schema (Exactly the same as Create)
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'c++', 'Javascript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  driverCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'c++', 'Javascript']),
      code: z.string().min(1, 'Driver code is required (Must include {{USER_CODE}})')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'c++', 'Javascript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminUpdate() {
  const navigate = useNavigate();
  const { problemId } = useParams(); // Get ID from URL (e.g., /admin/update/:problemId)
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset, // <-- We need this to fill the form with existing data!
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    // We don't need defaultValues here because reset() will provide them after fetch
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  // 2. Fetch the existing problem data
useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setIsLoading(true); // Added to ensure loading state resets if problemId changes
        
        // IMPORTANT: Ensure this backend route returns ALL fields, including driverCode and hiddenTestCases
        const response = await axiosClient.get(`/problem/admin/problemById/${problemId}`);
        const data = response.data;

        if (data) {
          // Safeguard: Make sure arrays exist even if old DB documents didn't have them yet
          const defaultLanguages = ['c++', 'Java', 'Javascript'];
          
          const safeDriverCode = defaultLanguages.map(lang => {
            const existing = data.driverCode?.find(d => d.language.toLowerCase() === lang.toLowerCase());
            return existing || { language: lang, code: '' };
          });

          const safeStartCode = defaultLanguages.map(lang => {
            const existing = data.startCode?.find(d => d.language.toLowerCase() === lang.toLowerCase());
            return existing || { language: lang, initialCode: '' };
          });

          const safeRefSolution = defaultLanguages.map(lang => {
            const existing = data.referenceSolution?.find(d => d.language.toLowerCase() === lang.toLowerCase());
            return existing || { language: lang, completeCode: '' };
          });

          // INSTEAD OF ...data, explicitly map fields with fallbacks to guarantee no Zod errors
          reset({
            title: data.title || '',
            description: data.description || '',
            difficulty: data.difficulty || 'easy',
            tags: data.tags || 'array',
            visibleTestCases: data.visibleTestCases || [],
            hiddenTestCases: data.hiddenTestCases || [],
            startCode: safeStartCode,
            driverCode: safeDriverCode,
            referenceSolution: safeRefSolution
          });
        }

      } catch (error) {
        alert("Failed to load problem data. Check console.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (problemId) fetchProblemData();
  }, [problemId, reset]);

  // 3. Submit the updated data
  const onSubmit = async (data) => {
    try {
      // Make sure this matches your Express route for updating (PUT or POST)
      await axiosClient.put(`/problem/update/${problemId}`, data);
      alert('Problem updated successfully!');
      navigate('/'); // Or wherever your admin dashboard is
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.response?.data || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Problem</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                {...register('title')}
                className={`input input-bordered ${errors.title && 'input-error'}`}
              />
              {errors.title && (
                <span className="text-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
              />
              {errors.description && (
                <span className="text-error">{errors.description.message}</span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered ${errors.difficulty && 'select-error'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Tag</span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered ${errors.tags && 'select-error'}`}
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          
          {/* Visible Test Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Visible Case
              </button>
            </div>
            
            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                <textarea
                  {...register(`visibleTestCases.${index}.input`)}
                  placeholder="Input (Press Enter for new line)"
                  className="textarea textarea-bordered w-full font-mono"
                  rows={3}
                />
                
                <textarea
                  {...register(`visibleTestCases.${index}.output`)}
                  placeholder="Expected Output"
                  className="textarea textarea-bordered w-full font-mono"
                  rows={2}
                />
                
                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Hidden Case
              </button>
            </div>
            
            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                <textarea
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder="Input (Press Enter for new line)"
                  className="textarea textarea-bordered w-full font-mono"
                  rows={3}
                />

                <textarea
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Expected Output"
                  className="textarea textarea-bordered w-full font-mono"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Code Templates */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          
          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2 border-b pb-6 border-base-300 last:border-0">
                <h3 className="font-bold text-lg text-primary">
                  {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                </h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Initial Code (User sees this)</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg">
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="w-full bg-transparent font-mono outline-none"
                      rows={4}
                    />
                  </pre>
                </div>
                
                {/* Driver Code Wrapper */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Driver Code Wrapper (MUST include <code className="bg-base-300 px-1 rounded text-error">{`{{USER_CODE}}`}</code>)</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg border border-base-300 focus-within:border-primary">
                    <textarea
                      {...register(`driverCode.${index}.code`)}
                      placeholder={`// Example:\nconst fs = require('fs');\n\n{{USER_CODE}}\n\nfunction main() {\n  // testing logic \n}`}
                      className="w-full bg-transparent font-mono outline-none"
                      rows={6}
                    />
                  </pre>
                  {errors?.driverCode?.[index]?.code && (
                    <span className="text-error text-sm mt-1">{errors.driverCode[index].code.message}</span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Reference Solution (Complete working code)</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg">
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      className="w-full bg-transparent font-mono outline-none"
                      rows={4}
                    />
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full text-lg">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default AdminUpdate;