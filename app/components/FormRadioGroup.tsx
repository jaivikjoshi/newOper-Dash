"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioGroupProps {
  id: string;
  label: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  columns?: number;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  columns = 2,
}) => {
  return (
    <div className="space-y-4">
      <Label className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={`grid grid-cols-${columns} gap-4`}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
