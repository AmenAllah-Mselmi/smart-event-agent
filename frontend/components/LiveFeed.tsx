import React, { useEffect, useRef } from 'react';

interface Log {
  agent_name: string;
  level: string;
  message: string;
  timestamp: string;
}

export default function LiveFeed({ logs }: { logs: Log[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-inner h-64 flex flex-col">
      <h3 className="text-[#378ADD] font-semibold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
        <span className="w-2 h-2 rounded-full bg-[#378ADD] animate-ping"></span>
        Live Execution Feed
      </h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-sm space-y-2 pr-2">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-gray-500 whitespace-nowrap">
              {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
            </span>
            <span className={`font-semibold ${log.level === 'error' ? 'text-red-400' : 'text-[#7F77DD]'}`}>
              [{log.agent_name}]
            </span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-600 italic">No logs yet. The agents are getting ready...</div>
        )}
      </div>
    </div>
  );
}
