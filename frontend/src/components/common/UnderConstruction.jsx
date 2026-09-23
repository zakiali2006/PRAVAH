import React from 'react';
import { Construction } from 'lucide-react';
import { C } from '../../constants/theme';

export function UnderConstruction({ title = "Under Development" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
        <Construction size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: C.navyDeep }}>
        {title}
      </h2>
      <p className="text-gray-500 max-w-md">
        This page is currently under development according to our sequential build plan. 
        It will be implemented in a future phase.
      </p>
    </div>
  );
}
