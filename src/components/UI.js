import React from "react";

export const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

export const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    className={
      "border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
      className
    }
  />
));

export const Textarea = React.forwardRef(({ className = "", ...props }, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={
      "border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 " +
      className
    }
  />
));

export const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block font-medium mb-1">
    {children}
  </label>
);
