import React from 'react';
import ValidatorStatus from '@/components/ValidatorStatus';

export const metadata = {
  title: 'Validator Status & Consensus Telemetry — Arc L1',
  description: 'Real-time telemetry, node latency, uptime, and BFT consensus health across Arc L1 consortium validators.',
};

export default function ValidatorsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ValidatorStatus />
    </main>
  );
}
