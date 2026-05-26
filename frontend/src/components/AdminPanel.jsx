import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

// 1. Updated Zod schema to include driverCode
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

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'c++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'Javascript', initialCode: '' }
      ],
      driverCode: [
        { language: 'c++', code: '' },
        { language: 'Java', code: '' },
        { language: 'Javascript', code: '' }
      ],
      referenceSolution: [
        { language: 'c++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'Javascript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Reusable input styles
  const inputBaseStyle = "w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";
  const inputErrorStyle = "border-red-500/50 focus:border-red-500 focus:ring-red-500";
  const labelStyle = "block text-sm font-medium text-gray-400 mb-1.5";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Create New Problem</h1>
          <p className="text-gray-500 mt-2">Configure problem details, test cases, and language environments.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-800/60">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-sm mr-3">01</span>
              Basic Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className={labelStyle}>Title</label>
                <input
                  {...register('title')}
                  placeholder="e.g. Two Sum"
                  className={`${inputBaseStyle} ${errors.title ? inputErrorStyle : ''}`}
                />
                {errors.title && <span className="text-red-400 text-sm mt-1.5 block">{errors.title.message}</span>}
              </div>

              <div>
                <label className={labelStyle}>Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Markdown supported..."
                  className={`${inputBaseStyle} min-h-[160px] resize-y ${errors.description ? inputErrorStyle : ''}`}
                />
                {errors.description && <span className="text-red-400 text-sm mt-1.5 block">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelStyle}>Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className={`${inputBaseStyle} appearance-none ${errors.difficulty ? inputErrorStyle : ''}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Tag</label>
                  <select
                    {...register('tags')}
                    className={`${inputBaseStyle} appearance-none ${errors.tags ? inputErrorStyle : ''}`}
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-800/60">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-sm mr-3">02</span>
              Test Cases
            </h2>
            
            {/* Visible Test Cases */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-300">Visible Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="bg-[#0d0d0d] hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  + Add Visible Case
                </button>
              </div>
              
              <div className="space-y-4">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-5 relative group transition-all hover:border-gray-700">
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="absolute top-4 right-4 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-3 py-1 rounded text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                    
                    <div className="space-y-4 mt-2">
                      <textarea
                        {...register(`visibleTestCases.${index}.input`)}
                        placeholder="Input (Press Enter for new line)"
                        className={`${inputBaseStyle} font-mono text-sm bg-[#1a1a1a]`}
                        rows={2}
                      />
                      <textarea
                        {...register(`visibleTestCases.${index}.output`)}
                        placeholder="Expected Output"
                        className={`${inputBaseStyle} font-mono text-sm bg-[#1a1a1a]`}
                        rows={2}
                      />
                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        placeholder="Explanation (Optional)"
                        className={`${inputBaseStyle} text-sm bg-[#1a1a1a]`}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                {errors.visibleTestCases?.root && <span className="text-red-400 text-sm">{errors.visibleTestCases.root.message}</span>}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-300">Hidden Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="bg-[#0d0d0d] hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  + Add Hidden Case
                </button>
              </div>
              
              <div className="space-y-4">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-5 relative group transition-all hover:border-gray-700">
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="absolute top-4 right-4 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-3 py-1 rounded text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                    
                    <div className="space-y-4 mt-2">
                      <textarea
                        {...register(`hiddenTestCases.${index}.input`)}
                        placeholder="Input"
                        className={`${inputBaseStyle} font-mono text-sm bg-[#1a1a1a]`}
                        rows={2}
                      />
                      <textarea
                        {...register(`hiddenTestCases.${index}.output`)}
                        placeholder="Expected Output"
                        className={`${inputBaseStyle} font-mono text-sm bg-[#1a1a1a]`}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                {errors.hiddenTestCases?.root && <span className="text-red-400 text-sm">{errors.hiddenTestCases.root.message}</span>}
              </div>
            </div>
          </div>

          {/* Code Templates */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-800/60">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-sm mr-3">03</span>
              Code Templates
            </h2>
            
            <div className="space-y-10">
              {[0, 1, 2].map((index) => {
                const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                return (
                  <div key={index} className="border-b border-gray-800/60 pb-10 last:border-0 last:pb-0">
                    <h3 className="font-bold text-lg text-indigo-400 mb-5">{langName} Setup</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className={labelStyle}>Initial Code (Visible to user)</label>
                        <div className="bg-[#0d0d0d] p-1 rounded-lg border border-gray-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                          <textarea
                            {...register(`startCode.${index}.initialCode`)}
                            className="w-full bg-transparent font-mono text-sm text-gray-300 p-4 outline-none resize-y min-h-[120px]"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={labelStyle}>
                          Driver Code Wrapper (MUST include <code className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded mx-1">{`{{USER_CODE}}`}</code>)
                        </label>
                        <div className={`bg-[#0d0d0d] p-1 rounded-lg border focus-within:ring-1 transition-all ${errors?.driverCode?.[index]?.code ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500' : 'border-gray-800 focus-within:border-indigo-500 focus-within:ring-indigo-500'}`}>
                          <textarea
                            {...register(`driverCode.${index}.code`)}
                            placeholder={`// Example:\nconst fs = require('fs');\n\n{{USER_CODE}}\n\nfunction main() {\n  // testing logic \n}`}
                            className="w-full bg-transparent font-mono text-sm text-gray-300 p-4 outline-none resize-y min-h-[160px]"
                            spellCheck="false"
                          />
                        </div>
                        {errors?.driverCode?.[index]?.code && (
                          <span className="text-red-400 text-sm mt-1.5 block">{errors.driverCode[index].code.message}</span>
                        )}
                      </div>

                      <div>
                        <label className={labelStyle}>Reference Solution (Complete working code)</label>
                        <div className="bg-[#0d0d0d] p-1 rounded-lg border border-gray-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                          <textarea
                            {...register(`referenceSolution.${index}.completeCode`)}
                            className="w-full bg-transparent font-mono text-sm text-gray-300 p-4 outline-none resize-y min-h-[120px]"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-[0.99] text-lg"
            >
              Deploy Problem
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;