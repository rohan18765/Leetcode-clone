import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser, clearError } from "../authSlice";
import { useEffect, useState } from 'react';

// IMPROVEMENT 1: Changed min(8) to min(1) for login specifically
const loginSchema = z.object({
  emailId: z.string().min(1, "Email is required").email("Invalid Email"),
  password: z.string().min(1, "Password is required") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  // Reusable custom input styles based on your theme
  const inputBaseStyle = "w-full bg-[#262626] border border-gray-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#cbbda6] focus:ring-1 focus:ring-[#cbbda6] transition-colors";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#201f1f] font-sans selection:bg-[#cbbda6]/30">
      
      <div className="w-full max-w-md bg-[#2e2d2d] rounded-2xl shadow-2xl p-8 border border-gray-700/50">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-[#cbbda6]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg> */}
            <h2 className="text-3xl font-bold text-white tracking-tight">
              leet<span className="text-[#cbbda6]">code</span>
            </h2>
          </div>
          <p className="text-gray-400 text-sm">Welcome back! Please enter your details.</p>
        </div>

        {/* IMPROVEMENT 2: Display the Redux error if the backend rejects the login! */}
        {typeof error === 'string' && error.trim() !== '' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`${inputBaseStyle} ${errors.emailId ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''}`} 
              {...register('emailId')}
            />
            {errors.emailId && (
              <span className="text-red-400 text-sm mt-1.5 block">{errors.emailId.message}</span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className={labelStyle}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputBaseStyle} pr-12 ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-[#cbbda6] transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-sm mt-1.5 block">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#f1efe6] hover:bg-[#b5a790] text-[#262626] font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#cbbda6]/10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#262626]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-700/50">
          <span className="text-gray-400 text-sm">
            Don't have an account?{' '} 
            <NavLink to="/signup" className="text-[#dcab5b] hover:text-white font-semibold transition-colors">
              Sign Up
            </NavLink>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;