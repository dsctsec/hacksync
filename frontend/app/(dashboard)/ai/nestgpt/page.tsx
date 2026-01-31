import React from 'react';
import IntakeForm from '../../../../components/ai/nestgpt/IntakeForm';

export const metadata = {
  title: 'NestGPT — Strategist',
};

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">NestGPT — Campaign Strategist</h1>
      <p className="mb-6 text-sm text-gray-600">Fill the brief and generate a campaign plan.</p>
      <IntakeForm />
    </div>
  );
}
