import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import HexagonLogo from '../components/Logo';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 dark:bg-primary-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <HexagonLogo size={64} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            HetChat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time messaging, reimagined
          </p>
        </motion.div>

        {isLogin ? (
          <Login onToggle={() => setIsLogin(false)} />
        ) : (
          <Signup onToggle={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;

