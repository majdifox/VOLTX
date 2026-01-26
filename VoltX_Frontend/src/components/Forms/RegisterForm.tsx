import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, Input, Button } from "../UI";
import { useAuthStore } from "../../stores/authStore";
import { useFormSubmit } from "../../hooks/useApi";
import { ROUTES } from "../../config/routes";
import { THEME } from "../../config/theme";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { loading, submitForm } = useFormSubmit();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { confirmPassword, ...registerData } = formData;
    
    await submitForm(registerData, register, {
      successMessage: "Registration successful!",
      onSuccess: () => navigate(ROUTES.HOME)
    });
  };

  return (
    <Card variant="elevated" className="max-w-lg mx-auto">
      <CardBody>
        <h2 className="text-2xl font-bold text-center mb-6">Join VoltX</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange("firstName")}
              error={errors.firstName}
              required
              fullWidth
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange("lastName")}
              error={errors.lastName}
              required
              fullWidth
            />
          </div>

          <Input
            label="Username"
            value={formData.username}
            onChange={handleInputChange("username")}
            error={errors.username}
            required
            fullWidth
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            error={errors.email}
            required
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={errors.password}
            required
            fullWidth
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            error={errors.confirmPassword}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading}
            fullWidth
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};
