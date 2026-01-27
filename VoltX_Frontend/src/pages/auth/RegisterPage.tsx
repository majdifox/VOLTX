import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { RegisterForm } from '../../components/Forms';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes';
import { THEME } from '../../config/theme';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">V</span>
          </div>

          <h1 className={`text-4xl font-bold text-[${THEME.colors.primary}] mb-2`}>
            Join VoltX
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Start your journey into extreme adventures
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Registration Form */}
        <RegisterForm className="px-4 sm:px-0" />

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className={`font-medium text-[${THEME.colors.primary}] hover:underline`}
            >
              Sign in here
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className={`text-[${THEME.colors.primary}] hover:underline`}>
                  Terms of Service
                </Link>
                {' and '}
                <Link to="/privacy" className={`text-[${THEME.colors.primary}] hover:underline`}>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Benefits */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            What You'll Get
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 bg-[${THEME.colors.primary}]/10 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 text-[${THEME.colors.primary}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Adrenaline Points</h4>
              <p className="text-sm text-gray-600">Earn points for every adventure</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 bg-[${THEME.colors.secondary}]/10 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 text-[${THEME.colors.secondary}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Level Up</h4>
              <p className="text-sm text-gray-600">Unlock new challenges</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 bg-[${THEME.colors.success}]/10 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 text-[${THEME.colors.success}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Achievements</h4>
              <p className="text-sm text-gray-600">Collect badges and rewards</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 bg-[${THEME.colors.warning}]/10 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 text-[${THEME.colors.warning}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Community</h4>
              <p className="text-sm text-gray-600">Connect with adventurers</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3">
              <svg className={`w-5 h-5 text-[${THEME.colors.primary}] flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Your data is secure and private
                </p>
                <p className="text-xs text-gray-600">
                  We use industry-standard encryption to protect your information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};