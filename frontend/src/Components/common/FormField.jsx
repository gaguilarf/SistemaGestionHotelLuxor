// src/Components/common/FormField.jsx
import React from 'react';

const FormField = ({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  disabled = false,
  required = false,
  className = "",
  variant = "default", // "default" | "modal" | "edituser"
  borderColor = "green" // "green" | "blue" | "amber" | "purple"
}) => {
  const getInputClasses = () => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
    
    if (variant === "modal") {
      return `${baseClasses} focus:ring-green-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`;
    }
    
    if (variant === "edituser") {
      const colorClasses = {
        green: error 
          ? 'border-red-400 focus:border-red-500' 
          : 'border-green-200 focus:border-green-500',
        blue: error 
          ? 'border-red-400 focus:border-red-500' 
          : 'border-green-200 focus:border-green-500',
        amber: error 
          ? 'border-red-400 focus:border-red-500' 
          : 'border-green-200 focus:border-green-500',
        purple: error 
          ? 'border-red-400 focus:border-red-500' 
          : 'border-green-200 focus:border-green-500'
      };
      
      const ringClasses = {
        green: 'focus:ring-green-200',
        blue: 'focus:ring-green-200',
        amber: 'focus:ring-green-200',
        purple: 'focus:ring-green-200'
      };
      
      return `w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 shadow-md hover:shadow-lg ${colorClasses[borderColor]} ${ringClasses[borderColor]}`;
    }
    
    // Default variant
    return `${baseClasses} px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 transition-all duration-300 shadow-md hover:shadow-lg ${
      error 
        ? 'border-red-400 focus:border-red-500' 
        : 'border-green-200 focus:border-green-500'
    }`;
  };

  const getLabelClasses = () => {
    if (variant === "modal") {
      return "block text-sm font-medium text-gray-700 mb-2";
    }
    return "block text-sm font-bold text-gray-700 mb-2";
  };

  return (
    <div className={className}>
      <label htmlFor={id} className={getLabelClasses()}>
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className={getInputClasses()}
        placeholder={placeholder}
      />
      {error && (
        <p className={`mt-${variant === 'modal' ? '1' : '2'} text-sm text-red-600 ${variant === 'modal' ? '' : 'font-medium'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;