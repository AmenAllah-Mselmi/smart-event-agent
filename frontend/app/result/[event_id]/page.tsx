"use client";
import { useEffect, useState } from 'react';

type Venue = {
  name: string;
  address: string;
  capacity: number;
  price_estimate: number;
  rating?: number;
};

type EventPlan = {
  event_type?: string;
  city?: string;
  theme?: string;
  target_audience?: string;
  tracks?: string[];
  agenda?: string[];
  linkedin_post?: string;
  twitter_post?: string;
  email_html?: string;
  budget?: number;
  estimated_attendance?: number;
  format?: string;
  meet_link?: string;
  venues?: Venue[];
  detail?: string;
};

export default function ResultPlan({ params }: { params: { event_id: string } }) {
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${params.event_id}/plan`)
      .then(res => res.json())
      .then(data => {
        setPlan(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.event_id]);

  if (loading) {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading final plan...</div>;
  }

  if (!plan || plan.detail) {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Plan not found or not ready yet.</div>;
  }

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6 print:border-gray-300">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7F77DD] to-[#378ADD] print:text-black">
              Final Event Plan
            </h1>
            <p className="text-gray-400 mt-2 print:text-gray-600">{plan.event_type} in {plan.city}</p>
          </div>
          <button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors print:hidden flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Download PDF
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 print:border-gray-300 print:bg-white">
              <h2 className="text-xl font-semibold mb-4 text-[#7F77DD] print:text-black">Theme & Strategy</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1 print:text-gray-500">Event Theme</h3>
                  <p className="text-lg">{plan.theme}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1 print:text-gray-500">Target Audience</h3>
                  <p>{plan.target_audience}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1 print:text-gray-500">Tracks</h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {plan.tracks?.map((track: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm border border-gray-700 print:border-gray-300">{track}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 print:border-gray-300 print:bg-white">
              <h2 className="text-xl font-semibold mb-4 text-[#7F77DD] print:text-black">Agenda</h2>
              <ul className="space-y-3">
                {plan.agenda?.map((item: string, i: number) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-[#378ADD] print:bg-gray-200">
                      {i + 1}
                    </span>
                    <p className="pt-1">{item}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 print:border-gray-300 print:bg-white">
              <h2 className="text-xl font-semibold mb-4 text-[#7F77DD] print:text-black">Communications</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider print:text-gray-500">LinkedIn Post</h3>
                    <button onClick={() => plan.linkedin_post && navigator.clipboard.writeText(plan.linkedin_post)} className="text-[#378ADD] text-sm hover:underline print:hidden">Copy</button>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg italic text-gray-300 print:bg-gray-50 print:text-black">
                    {plan.linkedin_post}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider print:text-gray-500">Twitter Post</h3>
                    <button onClick={() => plan.twitter_post && navigator.clipboard.writeText(plan.twitter_post)} className="text-[#378ADD] text-sm hover:underline print:hidden">Copy</button>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg italic text-gray-300 print:bg-gray-50 print:text-black">
                    {plan.twitter_post}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider print:text-gray-500">Email Invitation</h3>
                    <button onClick={() => plan.email_html && navigator.clipboard.writeText(plan.email_html)} className="text-[#378ADD] text-sm hover:underline print:hidden">Copy HTML</button>
                  </div>
                  <div className="bg-white text-black p-6 rounded-lg border border-gray-200" dangerouslySetInnerHTML={{ __html: plan.email_html || '' }} />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-gradient-to-b from-[#1a1c2c] to-gray-900 border border-[#7F77DD]/30 rounded-xl p-6 print:border-gray-300 print:bg-white">
              <h2 className="text-xl font-semibold mb-4 text-white print:text-black">Logistics Overview</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-800 pb-2 print:border-gray-200">
                  <span className="text-gray-400">Total Budget</span>
                  <span className="font-semibold">${plan.budget}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2 print:border-gray-200">
                  <span className="text-gray-400">Est. Attendance</span>
                  <span className="font-semibold">{plan.estimated_attendance} pax</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2 print:border-gray-200">
                  <span className="text-gray-400">Format</span>
                  <span className="font-semibold capitalize">{plan.format}</span>
                </div>
                
                {plan.meet_link && (
                  <div className="pt-2">
                    <span className="text-gray-400 block mb-1 text-sm">Google Meet Link</span>
                    <a href={plan.meet_link} target="_blank" rel="noreferrer" className="text-[#378ADD] hover:underline break-all">
                      {plan.meet_link}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {plan.venues && plan.venues.length > 0 && (
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 print:border-gray-300 print:bg-white">
                <h2 className="text-xl font-semibold mb-4 text-[#7F77DD] print:text-black">Recommended Venues</h2>
                <div className="space-y-4">
                  {plan.venues.map((venue: Venue, i: number) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 print:border-gray-300 print:bg-gray-50">
                      <h4 className="font-semibold text-white print:text-black">{venue.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{venue.address}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Cap: {venue.capacity}</span>
                        <span className="text-[#7F77DD] font-medium">${venue.price_estimate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
