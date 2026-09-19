import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { C, FONT } from '../constants/theme';

export const Unauthorized = () => {
  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12"
      style={{ fontFamily: FONT }}
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
          Access Denied
        </h1>
        
        <p className="mb-8 text-lg text-gray-500">
          You do not have the required permissions to view this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
