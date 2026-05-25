import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
  
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({ username, email, password });
      toast.success('Registration successful! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to Register. Please try again.');
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50'>
  
        <div className='absolute inset-0 bg-[radial-gradient(#bae6fd_1px,transparent_1px)] [background-size:16px_16px] opacity-40' />
  
        <div className='relative w-full max-w-md px-6'>
          <div className='bg-white/85 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-xl shadow-sky-200/40 p-10'>
            {/*header*/}
            <div className='text-center mb-10'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 shadow-lg shadow-sky-500/30 mb-4'>
                <Bot className='w-8 h-8 text-white' strokeWidth={1.75} />
              </div>
              <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Create an Account</h1>
              <p className='text-slate-500'>Join our community and start learning with AI today!</p>
            </div>

            {/*form*/}
            <div className='space-y-5'>
              {/*Username Field*/}
              <div className='space-y-2'>
                <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>Username</label>
                <div className='relative group'>
                  <div className={'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ' + (focusedField === 'username' ? 'text-sky-500' : 'text-slate-400')}>
                    <Bot className='h-5 w-5' strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className='w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-200'
                    placeholder='Choose a username'
                  />
                </div>
              </div>

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
                    className='w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-200'
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
                    className='w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-200'
                    placeholder='Create a password'
                  />
                </div>
              </div>
              {/*Error Message*/}
              {error && (
                <div className='rounded-lg bg-red-50 border border-red-200 p-3'>
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              )}
              {/*Submit Button*/}
              <button
                type='submit'
                onClick={handleSubmit}
                disabled={loading}
                className='group relative w-full h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:from-sky-300 disabled:to-cyan-300 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' strokeWidth={2} />
                  </>
                )}
              </button>

                  {/*footer*/}
                      <div className='mt-8 pt-6 border-t border-slate-200/60'>
                        <p className='text-center text-sm text-slate-600'>
                          Already have an account? <Link to='/login' className='font-semibold text-sky-600 hover:text-sky-700 transition-colors duration-200'>Sign In</Link>
                        </p>
                      </div>
                    </div>
            
            </div>

             {/*subtle footer text*/}
        <div className='text-center text-xs text-slate-500 mt-6'>
          <p>By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
};

export default RegisterPage; 