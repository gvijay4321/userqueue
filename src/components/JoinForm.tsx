import React, { useState } from "react";
import { User, Phone, Users, ArrowRight } from "lucide-react";
import { JoinFormState, CreateQueueTokenPayload } from "../types/queue";

interface JoinFormProps {
  orgId: string;
  onSubmit: (data: CreateQueueTokenPayload) => Promise<void>;
  isLoading: boolean;
  error: string;
}

// ✅ Indian phone validator
const normalizePhone = (input: string): string => {
  let cleaned = input.replace(/\D/g, ""); // remove non-digits
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.slice(-10); // strip country code if present
  }
  return cleaned;
};

const isValidIndianPhone = (phone: string): boolean => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};

export const JoinForm: React.FC<JoinFormProps> = ({
  orgId,
  onSubmit,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState<JoinFormState>({
    name: "",
    phone: "",
    count: 1,
  });

  type JoinFormErrors = { [K in keyof JoinFormState]?: string };
  const [errors, setErrors] = useState<JoinFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: JoinFormErrors = {};

    const name = formData.name.trim();
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      newErrors.name = "Only letters and spaces are allowed";
    } else if ((name.match(/[a-zA-Z]/g) || []).length < 4) {
      newErrors.name = "Name must contain at least 4 letters";
    }

    const phone = normalizePhone(formData.phone);
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!isValidIndianPhone(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (formData.count === "" || formData.count < 1 || formData.count > 20) {
      newErrors.count = "Number of people must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: CreateQueueTokenPayload = {
      org_id: orgId,
      name: formData.name.trim(),
      phone: normalizePhone(formData.phone),
      people_count: formData.count === "" ? 1 : formData.count,
    };

    await onSubmit(payload);
  };

  const handleInputChange = (
    field: keyof JoinFormState,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Join the Queue
        </h1>
        <p className="text-gray-600">Enter your details to get your token</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.name
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your full name"
              disabled={isLoading}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onBlur={() =>
                handleInputChange("phone", normalizePhone(formData.phone))
              }
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.phone
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="10-digit Mobile Number"
              disabled={isLoading}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {/* People Count Field */}
        <div>
          <label
            htmlFor="count"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Number of People
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="count"
              min="1"
              max="20"
              value={formData.count}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange(
                  "count",
                  value === "" ? "" : parseInt(value, 10)
                );
              }}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.count
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="1"
              disabled={isLoading}
              aria-describedby={errors.count ? "count-error" : undefined}
            />
          </div>
          {errors.count && (
            <p id="count-error" className="mt-1 text-sm text-red-600">
              {errors.count}
            </p>
          )}
        </div>

        {/* Server Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Joining Queue...
            </>
          ) : (
            <>
              Join Queue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
