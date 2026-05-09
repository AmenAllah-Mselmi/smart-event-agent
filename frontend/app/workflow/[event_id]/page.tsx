"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentCard from '@/components/AgentCard';
import LiveFeed from '@/components/LiveFeed';
import WorkflowTimeline from '@/components/WorkflowTimeline';

type AgentStatus = 'idle' | 'running' | 'done' | 'error';

interface WorkflowLogEntry {
  event_id: string;
  agent_name: string;
  status: AgentStatus;
  message: string;
  timestamp: string;
  level: string;
}

export default function WorkflowDashboard({ params }: { params: { event_id: string } }) {
  const router = useRouter();
  const eventId = params.event_id;
  
  const [agents, setAgents] = useState({
    RouterAgent: { status: 'running' as const, lastLog: 'Initializing...' },
    ResearchAgent: { status: 'idle' as const, lastLog: '' },
    LogisticsAgent: { status: 'idle' as const, lastLog: '' },
    CommunicationAgent: { status: 'idle' as const, lastLog: '' }
  });
  
  const [logs, setLogs] = useState<WorkflowLogEntry[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<'pending' | 'running' | 'completed' | 'failed'>('running');

  useEffect(() => {
    // Check if event is already completed
    fetch(`http://localhost:8000/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'completed') {
          router.push(`/result/${eventId}`);
        }
      })
      .catch(err => console.error(err));

    const eventSource = new EventSource(`http://localhost:8000/api/workflow/${eventId}/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.event_id !== eventId) return;
      
      const workflowLog = {
        ...data,
        level: data.level || 'info',
        timestamp: data.timestamp || new Date().toISOString()
      } as WorkflowLogEntry;

      setLogs(prev => [...prev, workflowLog]);
      
      if (data.agent_name === 'RouterAgent' && data.status === 'done') {
        setWorkflowStatus('completed');
        setTimeout(() => {
          router.push(`/result/${eventId}`);
        }, 2000);
      }
      
      setAgents(prev => ({
        ...prev,
        [data.agent_name]: {
          status: data.status as AgentStatus,
          lastLog: data.message
        }
      }));
    };

    return () => eventSource.close();
  }, [eventId, router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Operations</h1>
            <p className="text-gray-400">Event ID: <span className="font-mono text-xs">{eventId}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">Agents Online</span>
          </div>
        </header>

        <WorkflowTimeline status={workflowStatus} agents={agents} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AgentCard name="Router" status={agents.RouterAgent.status} lastLog={agents.RouterAgent.lastLog} />
          <AgentCard name="Research" status={agents.ResearchAgent.status} lastLog={agents.ResearchAgent.lastLog} />
          <AgentCard name="Logistics" status={agents.LogisticsAgent.status} lastLog={agents.LogisticsAgent.lastLog} />
          <AgentCard name="Communication" status={agents.CommunicationAgent.status} lastLog={agents.CommunicationAgent.lastLog} />
        </div>

        <div className="mt-8">
          <LiveFeed logs={logs} />
        </div>
      </div>
    </div>
  );
}
