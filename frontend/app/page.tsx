import Link from 'react-router-dom';
// wait, Next.js uses next/link
import LinkNext from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden text-white selection:bg-[#7F77DD] selection:text-white">
      {/* Animated background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7F77DD] opacity-20 blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#378ADD] opacity-20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="z-10 text-center max-w-4xl px-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#378ADD] animate-ping"></span>
          <span className="text-sm font-medium text-gray-300">Powered by Gemini 2.0 & Google ADK</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
          Smart Event <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F77DD] to-[#378ADD]">Operator</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
          "AI is no longer assisting. <span className="text-white font-medium">It is operating.</span>"
        </p>
        
        <LinkNext href="/create" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#7F77DD] to-[#378ADD] rounded-xl hover:shadow-[0_0_40px_rgba(127,119,221,0.4)] hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:animate-[shine_1.5s_ease-in-out_infinite] -skew-x-12 -translate-x-full"></div>
          <span className="relative flex items-center gap-2">
            Initialize Event Workflow
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </span>
        </LinkNext>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          100% { transform: translateX(200%); }
        }
      `}} />
    </main>
  );
}
