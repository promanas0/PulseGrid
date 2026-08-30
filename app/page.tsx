'use client';

import React from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { arcTestnet } from '../components/AppKitProvider';

export default function HomePage() {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black text-xl border-2 border-slate-900 shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-950 font-mono">PulseGrid Web3</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Arc Testnet L1 (Chain ID: 5042002)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          {/* Official Reown AppKit Web Component Button */}
          {/* @ts-ignore */}
          <appkit-button />
          <a
            href="/archpulse.html"
            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span>Launch dApp</span>
            <span>➔</span>
          </a>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Network Telemetry */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-purple-700 uppercase tracking-wider">Active Network</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-mono font-bold">Circle L1</span>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {chainId === arcTestnet.id ? 'Arc Testnet' : `Chain #${chainId || 5042002}`}
          </div>
          <p className="text-xs text-slate-500">
            Native gas token is <strong className="text-slate-900 font-mono">USDC</strong> with sub-second block finality.
          </p>
        </div>

        {/* Card 2: Wallet Native Gas Balance */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider">USDC Gas Balance</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold">Arc L1 RPC</span>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {isConnected ? (
              isBalanceLoading ? 'Loading...' : `${Number(balance?.formatted || 0).toFixed(4)} ${balance?.symbol || 'USDC'}`
            ) : (
              '0.0000 USDC'
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time balance fetched via <strong className="text-slate-900 font-mono">Wagmi useBalance()</strong> hook.
          </p>
        </div>

        {/* Card 3: Reown AppKit Status */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-sky-700 uppercase tracking-wider">Reown AppKit</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-mono font-bold">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono capitalize">
            {status}
          </div>
          <p className="text-xs text-slate-500 truncate">
            {address ? `Connected: ${address.substring(0, 8)}...${address.substring(address.length - 6)}` : 'Connect via Reown AppKit modal'}
          </p>
        </div>
      </div>

      {/* Live Features Banner */}
      <div className="p-6 rounded-3xl bg-purple-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-mono">PulseGrid Arc L1 Ecosystem Live</h2>
          <p className="text-xs text-purple-200">
            Official Reown AppKit + Multi-Wallet integration with sub-second USDC gas.
          </p>
        </div>
        <a
          href="/archpulse.html"
          className="px-5 py-2.5 rounded-xl bg-white text-purple-950 font-bold text-xs font-mono hover:bg-purple-50 transition-colors shrink-0"
        >
          Open PulseGrid ➔
        </a>
      </div>
    </main>
  );
}
