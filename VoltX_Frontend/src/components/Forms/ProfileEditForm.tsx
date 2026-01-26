import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Input, Button } from "../UI";
import { useAuthStore } from "../../stores/authStore";
import { useFormSubmit } from "../../hooks/useApi";
import type { UserDTO } from "../../types/user";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface ProfileEditFormProps {
  user: UserDTO;
  onSuccess?: (updatedUser: UserDTO) => void;
  onCancel?: () => void;
  className?: string;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSuccess,
  onCancel,
  className = ""
}) => {
  const { updateProfile } = useAuthStore();
  const { loading, submitForm } = useFormSubmit<UserDTO>();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    email: user.email || ""
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Check if form has changes
  useEffect(() => {
    const isChanged =
      formData.firstName !== (user.firstName || "") ||
      formData.lastName !== (user.lastName || "") ||
      formData.username !== (user.username || "") ||
      formData.email !== (user.email || "");

    setHasChanges(isChanged);
  }, [formData, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, underscores, and dashes";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData) => (
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !hasChanges) return;

    await submitForm(
      { ...formData, id: user.id },
      (data) => updateProfile(user.id!, data),
      {
        successMessage: "Profile updated successfully!",
        onSuccess: onSuccess
      }
    );
  };

  const handleReset = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || ""
    });
    setErrors({});
  };

  return (
    <Card variant="outlined" className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">Edit Profile</h3>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Account Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Level: {user.level}</div>
              <div>Points: {user.adrenalinePoints?.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
              )}
              <Button variant="secondary" onClick={handleReset} disabled={!hasChanges}>
                Reset
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!hasChanges}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};