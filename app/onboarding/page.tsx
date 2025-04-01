"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Mail, Phone, Building, Globe, MapPin, Check, Sparkles } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormProvider, useFormContext } from "../utils/FormContext";
import { FormInput } from "../components/FormInput";
import { FormRadioGroup } from "../components/FormRadioGroup";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Wrapper component to use context
const OnboardingForm = () => {
  const { formData, errors, updateFormData, validateForm, handleSubmit } = useFormContext();
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleStripeCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          plan: 'pro',
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFormSubmit = async () => {
    // Use the form context's handleSubmit method which now handles Google Sheets integration
    const success = await handleSubmit();
    
    if (success) {
      if (formData.plan === 'pro') {
        await handleStripeCheckout();
      } else {
        // Redirect to dashboard for free plan
        router.push('/dashboard');
      }
    }
  };

  const shouldSuggestPro = () => {
    const employeeCount = formData.employeeCount;
    const locationCount = formData.locationCount;
    
    return (
      (employeeCount === "51-200" || employeeCount === "200+") ||
      (locationCount === "6-20" || locationCount === "20+")
    );
  };

  const handleNext = () => {
    if (validateForm(step)) {
      setStep((s) => Math.min(5, s + 1));
    }
  };

  const handlePrevious = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="min-h-screen bg-[#e9e2fe] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Image 
              src="/images/main-logo.png" 
              alt="Hospitality Hub Logo" 
              width={180} 
              height={50} 
              priority
            />
          </div>
          <div className="text-sm text-gray-500">
            Step {step} of 5
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    placeholder="John"
                    error={errors.firstName}
                    required
                  />
                  <FormInput
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="Doe"
                    error={errors.lastName}
                    required
                  />
                </div>
                <FormInput
                  id="role"
                  label="Role / Title"
                  value={formData.role}
                  onChange={(e) => updateFormData("role", e.target.value)}
                  placeholder="General Manager"
                />
                <FormInput
                  id="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="john@example.com"
                  type="email"
                  error={errors.email}
                  required
                />
                <FormInput
                  id="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  error={errors.phone}
                  required
                />
                <FormInput
                  id="password"
                  label="Create Password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  error={errors.password}
                  required
                />
                <FormInput
                  id="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  error={errors.confirmPassword}
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Business Details</h2>
                <FormInput
                  id="businessName"
                  label="Business Name"
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                  placeholder="Sunset Hotel & Resort"
                  error={errors.businessName}
                  required
                />
                <FormInput
                  id="website"
                  label="Website"
                  value={formData.website}
                  onChange={(e) => updateFormData("website", e.target.value)}
                  placeholder="https://www.example.com"
                  error={errors.website}
                />
                <FormRadioGroup
                  id="businessType"
                  label="Business Type"
                  value={formData.businessType}
                  onChange={(value) => {
                    updateFormData("businessType", value);
                    if (value !== "other") {
                      updateFormData("otherBusinessType", "");
                    }
                  }}
                  options={[
                    { value: "restaurant", label: "Restaurant" },
                    { value: "hotel", label: "Hotel" },
                    { value: "resort", label: "Resort" },
                    { value: "retail", label: "Retail" },
                    { value: "club", label: "Club" },
                    { value: "other", label: "Other" },
                  ]}
                  error={errors.businessType}
                  required
                />
                {formData.businessType === "other" && (
                  <FormInput
                    id="otherBusinessType"
                    label="Please specify"
                    value={formData.otherBusinessType}
                    onChange={(e) => updateFormData("otherBusinessType", e.target.value)}
                    placeholder="Enter your business type"
                    error={errors.otherBusinessType}
                    required
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Business Profile</h2>
                <FormRadioGroup
                  id="locationCount"
                  label="Number of Locations"
                  value={formData.locationCount}
                  onChange={(value) => updateFormData("locationCount", value)}
                  options={[
                    { value: "1", label: "Single Location" },
                    { value: "2-5", label: "2-5 Locations" },
                    { value: "6-20", label: "6-20 Locations" },
                    { value: "20+", label: "20+ Locations" },
                  ]}
                  error={errors.locationCount}
                  required
                />
                <FormRadioGroup
                  id="employeeCount"
                  label="Number of Employees"
                  value={formData.employeeCount}
                  onChange={(value) => updateFormData("employeeCount", value)}
                  options={[
                    { value: "1-10", label: "1-10" },
                    { value: "11-50", label: "11-50" },
                    { value: "51-200", label: "51-200" },
                    { value: "200+", label: "200+" },
                  ]}
                  error={errors.employeeCount}
                  required
                />
                <FormInput
                  id="location"
                  label="Primary Business Location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="123 Hospitality Ave, City, State"
                  error={errors.location}
                  required
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Choose Your Plan</h2>
                {errors.plan && <p className="text-sm text-red-500">{errors.plan}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card 
                    className={`p-6 cursor-pointer transition-all ${
                      formData.plan === 'free' ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => updateFormData('plan', 'free')}
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Free Trial</h3>
                      <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-gray-600">/month</span></p>
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Basic staff management</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Up to 10 staff members</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Standard support</span>
                        </li>
                      </ul>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer transition-all ${
                      formData.plan === 'pro' ? 'ring-2 ring-blue-500' : ''
                    } ${shouldSuggestPro() ? 'bg-blue-50' : ''}`}
                    onClick={() => updateFormData('plan', 'pro')}
                  >
                    <div className="space-y-4">
                      {shouldSuggestPro() && (
                        <div className="flex items-center text-blue-600 mb-2">
                          <Sparkles className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Recommended for your business</span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">Pro</h3>
                      <p className="text-3xl font-bold">$49<span className="text-sm font-normal text-gray-600">/month</span></p>
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Unlimited staff members</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Advanced scheduling</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Priority support</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Multi-location management</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Advanced analytics</span>
                        </li>
                      </ul>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Review & Submit</h2>
                <p className="text-gray-600">
                  Please review your information before submitting. Once submitted, you'll receive
                  download codes for your staff to access the mobile app.
                </p>
                <Button
                  onClick={handleFormSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {formData.plan === 'pro' ? 'Proceed to Payment' : 'Complete Setup'}
                </Button>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={step === 5}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="p-6 bg-white shadow-lg rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Business Profile</h3>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>

                {(formData.firstName || formData.lastName) && (
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="text-gray-900">
                        {formData.firstName} {formData.lastName}
                      </p>
                      {formData.role && (
                        <p className="text-sm text-gray-500">{formData.role}</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{formData.email}</p>
                    </div>
                  </div>
                )}

                {formData.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{formData.phone}</p>
                    </div>
                  </div>
                )}

                {formData.businessName && (
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Business</p>
                      <p className="text-gray-900">{formData.businessName}</p>
                      {formData.website && (
                        <p className="text-sm text-gray-500">
                          <Globe className="h-4 w-4 inline mr-1" />
                          {formData.website}
                        </p>
                      )}
                      {formData.businessType && (
                        <p className="text-sm text-gray-500 mt-1">
                          Type: {formData.businessType === "other" ? formData.otherBusinessType : formData.businessType}
                        </p>
                      )}
                      {formData.locationCount && (
                        <p className="text-sm text-gray-500">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {formData.locationCount} {formData.locationCount === "1" ? "Location" : "Locations"}
                        </p>
                      )}
                      {formData.employeeCount && (
                        <p className="text-sm text-gray-500">
                          Staff: {formData.employeeCount} employees
                        </p>
                      )}
                      {formData.location && (
                        <p className="text-sm text-gray-500">{formData.location}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">
                      Your profile is complete! {formData.plan === 'pro' ? 'Proceed to payment to activate your account.' : 'Submit to complete setup.'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main page component with context provider
export default function OnboardingPage() {
  return (
    <FormProvider>
      <OnboardingForm />
    </FormProvider>
  );
}
