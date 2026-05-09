import React from 'react';

interface TimelineProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
  agents?: any;
}

export default function WorkflowTimeline({ status, agents }: TimelineProps) {
  const isCommsActive = status === 'completed' || agents?.CommunicationAgent?.status === 'running' || agents?.CommunicationAgent?.status === 'done';
  const isFinalPlan = status === 'completed';

  const steps = [
    { name: 'Research & Planning', active: status !== 'pending' },
    { name: 'Logistics & Venues', active: status !== 'pending' },
    { name: 'Communications', active: isCommsActive },
    { name: 'Final Plan', active: isFinalPlan }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-800 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-[#7F77DD] to-[#378ADD] z-0 transition-all duration-1000 ease-in-out"
          style={{ width: isFinalPlan ? '100%' : isCommsActive ? '75%' : status === 'running' ? '50%' : '0%' }}
        ></div>
        
        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${step.active ? 'bg-[#7F77DD] text-white shadow-[0_0_15px_rgba(127,119,221,0.5)]' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
              {index + 1}
            </div>
            <span className={`text-xs font-medium ${step.active ? 'text-gray-200' : 'text-gray-600'} absolute top-10 whitespace-nowrap`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
