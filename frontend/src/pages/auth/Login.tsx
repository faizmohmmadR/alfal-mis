import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Footer } from '@/components/layout/Footer';

const Login = () => {

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary-dark via-primary to-primary relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent rounded-full"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent rounded-full"></div>
          <div className="absolute -bottom-32 right-1/4 w-72 h-72 bg-white rounded-full"></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 w-full max-w-md">
          {/* Login form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default Login;