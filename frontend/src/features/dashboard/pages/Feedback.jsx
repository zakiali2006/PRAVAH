import React from 'react';
import { MessageSquare } from 'lucide-react';
import { C } from '../../../constants/theme';
import { SectionHead } from '../../../components/common/SectionHead';

export const Feedback = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare size={28} style={{ color: C.navy }} />
        <SectionHead title="Feedback & Ratings" />
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 p-8 text-center text-slate-500">
        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No feedback requests pending</h3>
        <p>You have not received any feedback requests from departments recently.</p>
      </div>
    </div>
  );
};
