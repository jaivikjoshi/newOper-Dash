"use client";

import React, { createContext, useContext, useState } from "react";
import { FormErrors, validateEmail, validatePhone, validateRequired, validateUrl, validateAddress } from "./validation";
import { useUser, UserProfile } from "./UserContext";
import * as sheetsApiClient from './sheetsApiClient';
import { GOOGLE_SHEETS_CONFIG } from './googleSheetsConfig';

// Define form data plan type to match UserProfile PlanType
type FormPlanType = 'free' | 'basic' | 'premium' | 'enterprise' | 'pro';

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  businessName: string;
  website: string;
  businessType: string;
  otherBusinessType: string;
  locationCount: string;
  employeeCount: string;
  location: string;
  plan: FormPlanType | null;
  password: string;
  confirmPassword: string;
}

interface FormContextType {
  formData: FormData;
  errors: FormErrors;
  updateFormData: (field: keyof FormData, value: any) => void;
  validateForm: (step: number) => boolean;
  clearErrors: (field?: keyof FormData) => void;
  handleSubmit: () => Promise<boolean>;
  submitting: boolean;
}

const defaultFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  businessName: "",
  website: "",
  businessType: "",
  otherBusinessType: "",
  locationCount: "",
  employeeCount: "",
  location: "",
  plan: null,
  password: "",
  confirmPassword: "",
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { updateUserProfile, userProfile, saveOnboardingData } = useUser();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const clearErrors = (field?: keyof FormData) => {
    if (field) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  };

  const validateForm = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    // Step 1: Personal Information
    if (step === 1) {
      const firstNameError = validateRequired(formData.firstName, "First name");
      if (firstNameError) newErrors.firstName = firstNameError;
      
      const lastNameError = validateRequired(formData.lastName, "Last name");
      if (lastNameError) newErrors.lastName = lastNameError;
      
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
      
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
      
      const passwordError = validateRequired(formData.password, "Password");
      if (passwordError) {
        newErrors.password = passwordError;
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      
      if (formData.password && formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    // Step 2: Business Details
    else if (step === 2) {
      const businessNameError = validateRequired(formData.businessName, "Business name");
      if (businessNameError) newErrors.businessName = businessNameError;
      
      const websiteError = validateUrl(formData.website);
      if (websiteError) newErrors.website = websiteError;
      
      const businessTypeError = validateRequired(formData.businessType, "Business type");
      if (businessTypeError) newErrors.businessType = businessTypeError;
      
      if (formData.businessType === "other") {
        const otherError = validateRequired(formData.otherBusinessType, "Business type");
        if (otherError) newErrors.otherBusinessType = otherError;
      }
    }
    
    // Step 3: Business Profile
    else if (step === 3) {
      const locationCountError = validateRequired(formData.locationCount, "Number of locations");
      if (locationCountError) newErrors.locationCount = locationCountError;
      
      const employeeCountError = validateRequired(formData.employeeCount, "Number of employees");
      if (employeeCountError) newErrors.employeeCount = employeeCountError;
      
      const locationError = validateAddress(formData.location);
      if (locationError) newErrors.location = locationError;
    }
    
    // Step 4: Plan Selection
    else if (step === 4) {
      if (!formData.plan) {
        newErrors.plan = "Please select a plan";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<boolean> => {
    try {
      if (!validateForm(4)) {
        return false;
      }
      
      setSubmitting(true);
      
      // If a user profile already exists, update it with the onboarding data
      if (userProfile) {
        const success = await saveOnboardingData(formData);
        setSubmitting(false);
        return success;
      }
      
      // Create user profile from form data for new users
      const userProfileData: Omit<UserProfile, 'id' | 'createdAt'> = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType === 'other' 
          ? formData.otherBusinessType 
          : formData.businessType,
        website: formData.website,
        location: formData.location,
        plan: (formData.plan as any) || 'free', // Cast to any to work around type issue
        passwordHash: formData.password, // In a real app, this would be hashed
        metadata: {
          role: formData.role,
          locationCount: formData.locationCount,
          employeeCount: formData.employeeCount,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        }
      };
      
      // First try to save to Google Sheets
      let savedToSheets = false;
      try {
        // Prepare data with proper formatting and handling of empty values
        const sheetsData: Record<string, any> = {
          ...userProfileData,
          // Website handling - ensure it's not undefined when empty
          website: userProfileData.website || '',
          // Format phone to be a string without any special parsing
          phone: userProfileData.phone ? String(userProfileData.phone) : '',
          // Flatten metadata for sheets storage
          role: userProfileData.metadata?.role || '',
          locationCount: userProfileData.metadata?.locationCount || '',
          employeeCount: userProfileData.metadata?.employeeCount || '',
          onboardingCompleted: true,
          onboardingCompletedAt: userProfileData.metadata?.onboardingCompletedAt || new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        // Remove any undefined fields but keep empty strings
        Object.keys(sheetsData).forEach(key => {
          if (sheetsData[key] === undefined) {
            delete sheetsData[key];
          }
        });
        
        // Add to Google Sheets
        await sheetsApiClient.addRow(
          GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES,
          sheetsData
        );
        savedToSheets = true;
      } catch (sheetsError) {
        console.error('Error saving to Google Sheets:', sheetsError);
        // Continue with local storage fallback
      }
      
      // Save to UserContext (which will handle localStorage fallback)
      await updateUserProfile(userProfileData);
      
      // For free plan, we're done
      if (formData.plan !== 'pro') {
        setSubmitting(false);
        return true;
      }
      
      // For pro plan, proceed with Stripe checkout
      // This will be handled by the onboarding component
      
      return true;
    } catch (error) {
      console.error('Error during form submission:', error);
      setSubmitting(false);
      return false;
    }
  };

  return (
    <FormContext.Provider value={{ formData, errors, updateFormData, validateForm, clearErrors, handleSubmit, submitting }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
