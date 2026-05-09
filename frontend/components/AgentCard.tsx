import React from 'react';

interface AgentCardProps {
  name: string;
  status: 'idle' | 'running' | 'done' | 'error';
  lastLog?: string;
}

export default function AgentCard({ name, status, lastLog }: AgentCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'idle': return 'bg-gray-700 text-gray-300';
      case 'running': return 'bg-blue-600 text-white animate-pulse';
      case 'done': return 'bg-green-600 text-white';
      case 'error': return 'bg-red-600 text-white';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex flex-col gap-4 transition-all hover:border-[#7F77DD]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor()}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-400 min-h-[40px] italic">
        {lastLog || 'Waiting for tasks...'}
      </p>
    </div>
  );
}
