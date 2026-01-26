import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, Input, Button } from "../UI";
import { useAuthStore } from "../../stores/authStore";
import { useFormSubmit } from "../../hooks/useApi";
import { ROUTES } from "../../config/routes";
import { THEME } from "../../config/theme";

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo = ROUTES.HOME,
  className = ""
}) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { loading, submitForm } = useFormSubmit();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await submitForm(
      formData,
      (data) => login(data.username, data.password),
      {
        successMessage: "Login successful! Welcome back.",
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(redirectTo);
          }
        }
      }
    );
  };

  return (
    <Card variant="elevated" className={`max-w-md mx-auto ${className}`}>
      <CardBody>
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold text-[${THEME.colors.primary}] mb-2`}>
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to your VoltX account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={handleInputChange("username")}
            error={errors.username}
            placeholder="Enter your username"
            required
            fullWidth
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={errors.password}
            placeholder="Enter your password"
            required
            fullWidth
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`rounded border-gray-300 text-[${THEME.colors.primary}] focus:ring-[${THEME.colors.primary}]`}
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            <Link 
              to="/forgot-password"
              className={`text-sm text-[${THEME.colors.primary}] hover:underline`}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading}
            fullWidth
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link 
              to={ROUTES.REGISTER}
              className={`font-medium text-[${THEME.colors.primary}] hover:underline`}
            >
              Create one here
            </Link>
          </p>
        </div>

        {/* Social Login Options (placeholder for future implementation) */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              size="md"
              disabled
              className="border border-gray-300"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            
            <Button
              variant="ghost"
              size="md"
              disabled
              className="border border-gray-300"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
