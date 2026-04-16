import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">

      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 z-0"
        options={{
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: ['#6366f1', '#8b5cf6', '#06b6d4'] },
            shape: { type: 'circle' },
            opacity: { value: 0.3, random: true },
            size: { value: { min: 1, max: 3 }, random: true },
            links: {
              enable: true,
              distance: 150,
              color: '#6366f1',
              opacity: 0.15,
              width: 1,
            },
            move: {
              enable: true,
              speed: 0.8,
              direction: 'none',
              random: true,
              outModes: { default: 'bounce' },
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'repulse' },
            },
            modes: {
              repulse: { distance: 80, duration: 0.4 },
            },
          },
          detectRetina: true,
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-md">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faFolder} className="text-white text-sm" />
          </div>
          <span className="text-white font-bold text-xl">DocVault</span>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="text-slate-400 hover:text-white text-sm transition"
        >
          ← Back to Home
        </button>
      </nav>

      {/* Login Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 shadow-lg">
              <FontAwesomeIcon icon={faFolder} className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Welcome to DocVault
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to your account
            </p>
          </motion.div>

          {/* Card */}
          <GlassCard className="p-4 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </motion.button>

            </form>
          </GlassCard>

          <p className="text-center text-slate-500 text-sm mt-6">
            DocVault — File Sharing System © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;