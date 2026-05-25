import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });   // useAuth().login handles service call + state
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50'>

      <div className='absolute inset-0 bg-[radial-gradient(#bae6fd_1px,transparent_1px)] [background-size:16px_16px] opacity-40' />

      <div className='relative w-full max-w-md px-6'>
        <div className='bg-white/85 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-xl shadow-sky-200/40 p-10'>
          {/*header*/}
          <div className='text-center mb-10'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 shadow-lg shadow-sky-500/30 mb-4'>
              <Bot className='w-8 h-8 text-white' strokeWidth={1.75} />
            </div>
            <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Welcome Back!</h1>
            <p className='text-slate-500'>Sign in to continue your Sessions.</p>
          </div>
          {/*form*/}
          <div className='space-y-5'>
            {/*Email Field*/}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>Email</label>
              <div className='relative group'>
                <div className={'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ' + (focusedField === 'email' ? 'text-sky-500' : 'text-slate-400')}>
                  <Mail className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:bg-white focus:border-sky-400 focus:shadow-lg focus:shadow-sky-500/10'
                  placeholder='Enter your email'
                />
              </div>
            </div>
            {/*Password Field*/}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>Password</label>
              <div className='relative group'>
                <div className={'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ' + (focusedField === 'password' ? 'text-sky-500' : 'text-slate-400')}>
                  <Lock className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:bg-white focus:border-sky-400 focus:shadow-lg focus:shadow-sky-500/10'
                  placeholder='Enter your password'
                />
              </div>
            </div>
            {/*Error Message*/}
            {error && (
              <div className='rounded-lg bg-red-50 border border-red-200 p-3'>
                <p className='text-xs text-red-600 font-medium text-center'>{error}</p>
              </div>)}
            {/*Submit Button*/}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='group relative w-full h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-sky-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-sky-500/25 overflow-hidden'
              >
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  {loading ? (
                    <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'/>
                    signing in... 
                    </>
                  ) : (
                    <>
                    Sign In 
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200
                    ' strokeWidth={2.5} />
                    </>
                  )}
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full opacity-0 group-hover:translate-x-full transition-transform duration-700' />
              </button>
          </div>

          {/*footer*/}
          <div className='mt-8 pt-6 border-t border-slate-200/60'>
            <p className='text-center text-sm text-slate-600'>
              Don't have an account? <Link to='/register' className='font-semibold text-sky-600 hover:text-sky-700 transition-colors duration-200'>Sign Up</Link>
            </p>
          </div>
        </div>

    
        </div>
      </div> 
  )
}

export default LoginPage;