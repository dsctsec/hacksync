"use client";

import React, { useState } from 'react';

type Intake = {
  campaignGoal: string;
  productDescription: string;
  oneLiner?: string;
  audience?: string;
  startDate?: string;
  durationWeeks?: number;
  budget?: string;
  primaryChannels?: string[];
  tone?: string;
};

export default function IntakeForm() {
  const [intake, setIntake] = useState<Intake>({ campaignGoal: 'awareness', productDescription: '', oneLiner: '', audience: '', startDate: '', durationWeeks: 4, budget: 'medium', primaryChannels: ['instagram'], tone: 'friendly' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Intake>(key: K, value: Intake[K]) {
    setIntake(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch('/api/strategist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || JSON.stringify(data));
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const channels = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'];

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Campaign Goal</label>
          <select value={intake.campaignGoal} onChange={e => update('campaignGoal', e.target.value)} className="mt-1 block w-full">
            <option value="awareness">Awareness</option>
            <option value="launch">Product Launch</option>
            <option value="reposition">Repositioning</option>
            <option value="engagement">Engagement</option>
            <option value="conversion">Conversion</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Product / Brand Description</label>
          <textarea value={intake.productDescription} onChange={e => update('productDescription', e.target.value)} className="mt-1 block w-full" rows={4} />
        </div>

        <div>
          <label className="block font-medium">One-liner</label>
          <input value={intake.oneLiner} onChange={e => update('oneLiner', e.target.value)} className="mt-1 block w-full" />
        </div>

        <div>
          <label className="block font-medium">Audience (brief)</label>
          <input value={intake.audience} onChange={e => update('audience', e.target.value)} className="mt-1 block w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Start Date</label>
            <input type="date" value={intake.startDate} onChange={e => update('startDate', e.target.value)} className="mt-1 block w-full" />
          </div>
          <div>
            <label className="block font-medium">Duration (weeks)</label>
            <input type="number" value={intake.durationWeeks} onChange={e => update('durationWeeks', Number(e.target.value))} className="mt-1 block w-full" />
          </div>
        </div>

        <div>
          <label className="block font-medium">Budget</label>
          <select value={intake.budget} onChange={e => update('budget', e.target.value)} className="mt-1 block w-full">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Primary Channels</label>
          <div className="flex gap-2 mt-1">
            {channels.map(ch => (
              <label key={ch} className="inline-flex items-center">
                <input type="checkbox" checked={intake.primaryChannels?.includes(ch)} onChange={e => {
                  const checked = e.target.checked;
                  const prev = intake.primaryChannels || [];
                  if (checked) update('primaryChannels', Array.from(new Set([...prev, ch])));
                  else update('primaryChannels', prev.filter(c => c !== ch));
                }} />
                <span className="ml-2">{ch}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium">Tone</label>
          <input value={intake.tone} onChange={e => update('tone', e.target.value)} className="mt-1 block w-full" />
        </div>

        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Generating…' : 'Generate Strategy'}</button>
        </div>
      </form>

      <div className="mt-6">
        {error && <div className="text-red-600">{error}</div>}
        {result && (
          <div>
            <h3 className="font-semibold">Result</h3>
            <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
