import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LoginForm } from '../../components/Forms';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes';
import { THEME } from '../../config/theme';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">V</span>
          </div>

          <h1 className={`text-4xl font-bold text-[${THEME.colors.primary}] mb-2`}>
            VoltX
          </h1>
          <p className="text-gray-600 text-lg">
            Your gateway to extreme adventures
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Login Form */}
        <LoginForm className="px-4 sm:px-0" />

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <div className="text-sm text-gray-600">
            New to VoltX?{' '}
            <Link
              to={ROUTES.REGISTER}
              className={`font-medium text-[${THEME.colors.primary}] hover:underline`}
            >
              Create your account
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                <Link to="/terms" className="hover:text-gray-700">
                  Terms of Service
                </Link>
                {' • '}
                <Link to="/privacy" className="hover:text-gray-700">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link to="/help" className="hover:text-gray-700">
                  Help Center
                </Link>
                {' • '}
                <Link to="/contact" className="hover:text-gray-700">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Why Choose VoltX?
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-[${THEME.colors.primary}]/10 rounded-lg flex items-center justify-center`}>
                <svg className={`w-4 h-4 text-[${THEME.colors.primary}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Extreme Adventures</p>
                <p className="text-sm text-gray-600">Discover thrilling experiences</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-[${THEME.colors.secondary}]/10 rounded-lg flex items-center justify-center`}>
                <svg className={`w-4 h-4 text-[${THEME.colors.secondary}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Safety First</p>
                <p className="text-sm text-gray-600">Professional safety standards</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-[${THEME.colors.success}]/10 rounded-lg flex items-center justify-center`}>
                <svg className={`w-4 h-4 text-[${THEME.colors.success}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Community</p>
                <p className="text-sm text-gray-600">Connect with fellow adventurers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};