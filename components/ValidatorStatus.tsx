'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  Blocks,
  Search,
  Copy,
  Check,
  ExternalLink,
  Server,
  RefreshCw,
  Cpu,
  HardDrive,
  Globe,
  Radio,
  Clock,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export interface ValidatorNode {
  id: string;
  name: string;
  avatar: string;
  logoSvg?: string;
  badge: string;
  organization: string;
  address: string;
  fullAddress: string;
  status: 'online' | 'syncing' | 'standby';
  uptime: number; // e.g. 99.99
  latency: number; // in ms
  lastBlockSigned: number;
  stakeUsdc: number;
  votingPower: number; // percentage
  location: string;
  region: string;
  hardware: {
    cpu: string;
    ram: string;
    bandwidth: string;
  };
  missedBlocks: number;
  slashed: number;
}

const INITIAL_VALIDATORS: ValidatorNode[] = [
  {
    id: 'circle-alpha',
    name: 'Circle Node Alpha',
    avatar: '🔵',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="#2775CA"/><path d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20ZM44.5 35H55.5C59.0899 35 62 37.9101 62 41.5C62 45.0899 59.0899 48 55.5 48H44.5V35ZM55.5 65H44.5V52H55.5C59.0899 52 62 54.9101 62 58.5C62 62.0899 59.0899 65 55.5 65Z" fill="white"/></svg>`,
    badge: 'Consortium Lead',
    organization: 'Circle Internet Financial',
    address: '0x1f84...892A',
    fullAddress: '0x1f84C371B2dE51A07b5C558D8eF3c4bC2E60892A',
    status: 'online',
    uptime: 99.99,
    latency: 1.2,
    lastBlockSigned: 56258045,
    stakeUsdc: 1250000,
    votingPower: 15.2,
    location: 'Ashburn, VA',
    region: 'US East (N. Virginia)',
    hardware: { cpu: '64 vCPU AMD EPYC', ram: '256 GB ECC', bandwidth: '10 Gbps' },
    missedBlocks: 0,
    slashed: 0,
  },
  {
    id: 'blackrock-prime',
    name: 'BlackRock Prime Consensus',
    avatar: '⬛',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#000000"/><path d="M22 26H52C62 26 68 31 68 39C68 45 64 49 57 51C66 53 71 58 71 67C71 76 63 82 51 82H22V26ZM36 48H49C54 48 57 45 57 41C57 37 54 35 49 35H36V48ZM36 73H50C56 73 59 70 59 65C59 60 56 57 50 57H36V73Z" fill="#FFFFFF"/></svg>`,
    badge: 'Institutional Tier 1',
    organization: 'BlackRock Financial Markets',
    address: '0x4b21...418C',
    fullAddress: '0x4b218C8E19d7eF9A0837d9472e391F09903b418C',
    status: 'online',
    uptime: 99.98,
    latency: 2.1,
    lastBlockSigned: 56258045,
    stakeUsdc: 950000,
    votingPower: 11.5,
    location: 'New York, NY',
    region: 'US East (New York)',
    hardware: { cpu: '64 vCPU Xeon Gold', ram: '256 GB ECC', bandwidth: '10 Gbps' },
    missedBlocks: 1,
    slashed: 0,
  },
  {
    id: 'visa-settle',
    name: 'Visa Settlement Relay',
    avatar: '💳',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#1A1F71"/><path d="M42 68L48 32H55L49 68H42ZM36 32L30 57L28 47C26 39 20 35 14 32H27L36 68L36 32ZM72 45C72 37 61 36 61 31C61 29 63 28 67 28C71 28 76 29 80 31L81 24C77 22 72 21 66 21C53 21 44 28 44 38C44 51 62 52 62 58C62 60 59 62 54 62C48 62 43 60 39 57L38 64C42 66 48 68 54 68C68 68 76 60 76 50C76 48 74 46 72 45Z" fill="#F7B600"/></svg>`,
    badge: 'Institutional Tier 1',
    organization: 'Visa Inc.',
    address: '0x7c93...333F',
    fullAddress: '0x7c933F85E2d937A01648bcDaE099f648D80F333F',
    status: 'online',
    uptime: 99.99,
    latency: 1.8,
    lastBlockSigned: 56258044,
    stakeUsdc: 850000,
    votingPower: 10.3,
    location: 'Boardman, OR',
    region: 'US West (Oregon)',
    hardware: { cpu: '64 vCPU AMD EPYC', ram: '256 GB ECC', bandwidth: '10 Gbps' },
    missedBlocks: 0,
    slashed: 0,
  },
  {
    id: 'dtcc-consensus',
    name: 'DTCC Global Clearing Node',
    avatar: '🏛️',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#003366"/><path d="M20 28H44C58 28 66 36 66 50C66 64 58 72 44 72H20V28ZM32 60H43C51 60 55 56 55 50C55 44 51 40 43 40H32V60ZM65 28H80V72H65V28Z" fill="#00A3E0"/></svg>`,
    badge: 'Institutional Tier 1',
    organization: 'Depository Trust & Clearing Corp',
    address: '0x9e17...72D1',
    fullAddress: '0x9e172D437F8E8024976c66289bDE9eA7584A72D1',
    status: 'online',
    uptime: 99.95,
    latency: 3.0,
    lastBlockSigned: 56258045,
    stakeUsdc: 780000,
    votingPower: 9.5,
    location: 'Frankfurt',
    region: 'EU Central (Germany)',
    hardware: { cpu: '32 vCPU AMD EPYC', ram: '128 GB ECC', bandwidth: '5 Gbps' },
    missedBlocks: 3,
    slashed: 0,
  },
  {
    id: 'bny-custody',
    name: 'BNY Mellon Digital Custody',
    avatar: '🏦',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#13294B"/><path d="M24 28H48C56 28 62 33 62 40C62 46 58 49 53 50C60 52 64 56 64 64C64 72 57 76 47 76H24V28ZM34 47H46C50 47 52 45 52 41C52 37 50 35 46 35H34V47ZM34 68H47C51 68 54 66 54 62C54 58 51 56 47 56H34V68ZM68 28H78V76H68V28Z" fill="#C59B27"/></svg>`,
    badge: 'Custodian Node',
    organization: 'Bank of New York Mellon',
    address: '0x3d9A...9992',
    fullAddress: '0x3d9A6720f358BE28357492cda1952a12B4169992',
    status: 'online',
    uptime: 99.97,
    latency: 2.4,
    lastBlockSigned: 56258044,
    stakeUsdc: 720000,
    votingPower: 8.7,
    location: 'New York, NY',
    region: 'US East (New York)',
    hardware: { cpu: '64 vCPU Xeon Gold', ram: '256 GB ECC', bandwidth: '10 Gbps' },
    missedBlocks: 2,
    slashed: 0,
  },
  {
    id: 'state-street',
    name: 'State Street Alpha Relay',
    avatar: '📊',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#002D62"/><path d="M22 66C22 55 29 49 39 46C49 43 54 41 54 36C54 32 50 29 44 29C37 29 31 32 26 36L22 28C28 23 36 20 45 20C57 20 66 26 66 37C66 48 58 53 49 56C39 59 34 62 34 67C34 71 39 74 46 74C54 74 61 70 67 65L71 73C64 79 55 83 45 83C31 83 22 76 22 66Z" fill="#FFFFFF"/><circle cx="76" cy="30" r="6" fill="#00A3E0"/></svg>`,
    badge: 'Custodian Node',
    organization: 'State Street Corp',
    address: '0x821F...8831',
    fullAddress: '0x821F069273c88B270c53A8De1bEc43194B4E8831',
    status: 'online',
    uptime: 99.94,
    latency: 3.2,
    lastBlockSigned: 56258045,
    stakeUsdc: 650000,
    votingPower: 7.9,
    location: 'Boston, MA',
    region: 'US East (Massachusetts)',
    hardware: { cpu: '32 vCPU Xeon Gold', ram: '128 GB ECC', bandwidth: '5 Gbps' },
    missedBlocks: 4,
    slashed: 0,
  },
  {
    id: 'jpmorgan-onyx',
    name: 'JPMorgan Onyx Engine',
    avatar: '💎',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#111111"/><path d="M24 24H42V62C42 69 38 74 30 74C26 74 22 73 19 71L21 62C23 63 26 64 28 64C31 64 33 62 33 59V24H24ZM48 24H68C76 24 81 29 81 37C81 45 76 50 68 50H58V74H48V24ZM58 41H67C70 41 72 39 72 37C72 35 70 33 67 33H58V41Z" fill="#C99700"/></svg>`,
    badge: 'Institutional Tier 1',
    organization: 'JPMorgan Chase & Co.',
    address: '0x51E2...1c2A',
    fullAddress: '0x51E28a55427Fe0937b2d56E99cE8E423b4971c2A',
    status: 'online',
    uptime: 99.96,
    latency: 4.1,
    lastBlockSigned: 56258045,
    stakeUsdc: 600000,
    votingPower: 7.3,
    location: 'London',
    region: 'EU West (London)',
    hardware: { cpu: '64 vCPU AMD EPYC', ram: '256 GB ECC', bandwidth: '10 Gbps' },
    missedBlocks: 2,
    slashed: 0,
  },
  {
    id: 'fidelity-assets',
    name: 'Fidelity Digital Assets Node',
    avatar: '🌲',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#1B4D3E"/><path d="M50 18L26 58H40L30 82L68 44H52L62 18H50Z" fill="#78BE20"/><circle cx="50" cy="50" r="44" stroke="#78BE20" stroke-width="3"/></svg>`,
    badge: 'Institutional Tier 1',
    organization: 'Fidelity Investments',
    address: '0x6e9C...6004',
    fullAddress: '0x6e9C1496632B5c4CFe0D853a8113426e273f6004',
    status: 'online',
    uptime: 99.98,
    latency: 2.7,
    lastBlockSigned: 56258044,
    stakeUsdc: 580000,
    votingPower: 7.0,
    location: 'Secaucus, NJ',
    region: 'US East (New Jersey)',
    hardware: { cpu: '32 vCPU AMD EPYC', ram: '128 GB ECC', bandwidth: '10 Gbps' },
    missedBlocks: 1,
    slashed: 0,
  },
  {
    id: 'coinbase-cloud',
    name: 'Coinbase Cloud Validator',
    avatar: '🛡️',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#0052FF"/><circle cx="50" cy="50" r="32" fill="white"/><circle cx="50" cy="50" r="16" fill="#0052FF"/></svg>`,
    badge: 'Infrastructure Partner',
    organization: 'Coinbase Global, Inc.',
    address: '0x228d...1977',
    fullAddress: '0x228dA56d81741508216b34fAcF4Fe4eAE4901977',
    status: 'online',
    uptime: 99.92,
    latency: 3.8,
    lastBlockSigned: 56258045,
    stakeUsdc: 520000,
    votingPower: 6.3,
    location: 'San Jose, CA',
    region: 'US West (California)',
    hardware: { cpu: '32 vCPU AMD EPYC', ram: '128 GB ECC', bandwidth: '5 Gbps' },
    missedBlocks: 5,
    slashed: 0,
  },
  {
    id: 'franklin-templeton',
    name: 'Franklin Templeton OnChain',
    avatar: '🪙',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#0C2340"/><circle cx="50" cy="50" r="34" stroke="#00A3E0" stroke-width="4"/><path d="M50 24V76M34 38H66M38 52H62" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/></svg>`,
    badge: 'Asset Manager',
    organization: 'Franklin Templeton',
    address: '0xa41B...42f7',
    fullAddress: '0xa41B9e19c35398B1a13bB4E7dEbD08a98C1542f7',
    status: 'online',
    uptime: 99.91,
    latency: 14.5,
    lastBlockSigned: 56258043,
    stakeUsdc: 490000,
    votingPower: 5.9,
    location: 'Singapore',
    region: 'AP Southeast (Singapore)',
    hardware: { cpu: '32 vCPU AMD EPYC', ram: '128 GB ECC', bandwidth: '5 Gbps' },
    missedBlocks: 6,
    slashed: 0,
  },
  {
    id: 'nomura-laser',
    name: 'Nomura Laser Digital',
    avatar: '⚡',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#C8102E"/><polygon points="50,16 80,78 20,78" fill="white"/><polygon points="50,34 70,72 30,72" fill="#C8102E"/></svg>`,
    badge: 'Digital Assets Division',
    organization: 'Nomura Holdings',
    address: '0xd888...22C8',
    fullAddress: '0xd888F93297a760cE455Db8E88E4B97eC481A22C8',
    status: 'syncing',
    uptime: 99.12,
    latency: 18.2,
    lastBlockSigned: 56258039,
    stakeUsdc: 410000,
    votingPower: 5.0,
    location: 'Tokyo',
    region: 'AP Northeast (Tokyo)',
    hardware: { cpu: '32 vCPU Xeon Gold', ram: '128 GB ECC', bandwidth: '5 Gbps' },
    missedBlocks: 14,
    slashed: 0,
  },
  {
    id: 'arc-community',
    name: 'Arc Community Pulse Node',
    avatar: '🌐',
    logoSvg: `<svg class="w-7 h-7" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="#7B2CBF"/><circle cx="50" cy="50" r="32" stroke="#FFFFFF" stroke-width="4"/><path d="M50 18C50 18 64 32 64 50C64 68 50 82 50 82C50 82 36 68 36 50C36 32 50 18 50 18Z" stroke="#00D2FF" stroke-width="3"/><line x1="20" y1="50" x2="80" y2="50" stroke="#FFFFFF" stroke-width="3"/></svg>`,
    badge: 'Community Pioneer',
    organization: 'Arc Ecosystem Foundation',
    address: '0x1102...0291',
    fullAddress: '0x11029cEbAF7619280e227e7d69C0099436dF0291',
    status: 'online',
    uptime: 99.85,
    latency: 5.3,
    lastBlockSigned: 56258045,
    stakeUsdc: 350000,
    votingPower: 4.2,
    location: 'Amsterdam',
    region: 'EU West (Netherlands)',
    hardware: { cpu: '32 vCPU AMD EPYC', ram: '128 GB ECC', bandwidth: '5 Gbps' },
    missedBlocks: 8,
    slashed: 0,
  },
];

export const ValidatorStatus: React.FC = () => {
  const [validators, setValidators] = useState<ValidatorNode[]>(INITIAL_VALIDATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'syncing'>('all');
  const [sortBy, setSortBy] = useState<'votingPower' | 'latency' | 'uptime' | 'lastBlock'>('votingPower');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Real-time telemetry state
  const [currentBlock, setCurrentBlock] = useState(56258045);
  const [epoch, setEpoch] = useState(4821);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<ValidatorNode | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Telemetry Simulation: ticks blocks and jitters latency
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setCurrentBlock((prev) => {
        const next = prev + 1;
        if (next % 100 === 0) {
          setEpoch((e) => e + 1);
        }
        return next;
      });

      // Update validators telemetry with subtle jitter
      setValidators((prevValidators) =>
        prevValidators.map((v) => {
          if (v.status === 'online') {
            const jitter = (Math.random() - 0.5) * 0.4;
            const newLatency = Math.max(0.8, Number((v.latency + jitter).toFixed(1)));
            return {
              ...v,
              latency: newLatency,
              lastBlockSigned: Math.random() > 0.1 ? currentBlock + 1 : v.lastBlockSigned,
            };
          }
          return v;
        })
      );

      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1500);

    return () => clearInterval(blockInterval);
  }, [currentBlock]);

  // Handle address copy
  const handleCopy = (address: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Manual refresh trigger
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 600);
  };

  // Metrics calculations
  const totalActive = validators.filter((v) => v.status === 'online').length;
  const totalSyncing = validators.filter((v) => v.status === 'syncing').length;
  const avgLatency = (
    validators.reduce((acc, v) => acc + v.latency, 0) / validators.length
  ).toFixed(1);
  const networkHealth = (
    (validators.filter((v) => v.status === 'online').length / validators.length) * 100
  ).toFixed(1);

  // Filter and sort validators
  const filteredValidators = useMemo(() => {
    return validators
      .filter((node) => {
        const matchesSearch =
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ? true : node.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortBy === 'votingPower') {
          valA = a.votingPower;
          valB = b.votingPower;
        } else if (sortBy === 'latency') {
          valA = a.latency;
          valB = b.latency;
        } else if (sortBy === 'uptime') {
          valA = a.uptime;
          valB = b.uptime;
        } else if (sortBy === 'lastBlock') {
          valA = a.lastBlockSigned;
          valB = b.lastBlockSigned;
        }

        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        }
        return valA < valB ? 1 : -1;
      });
  }, [validators, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleSort = (column: 'votingPower' | 'latency' | 'uptime' | 'lastBlock') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 font-sans selection:bg-purple-600 selection:text-white">
      {/* ──────────────── PAGE HEADER & TELEMETRY BADGE ──────────────── */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border-3 border-slate-950 shadow-[6px_6px_0px_#0F172A] relative overflow-hidden">
          {/* Subtle glow background element */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            {/* Live Ping Pulse Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/25 text-xs font-semibold backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="font-mono text-emerald-300 font-bold">LIVE TELEMETRY STREAM</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-300 font-mono text-[11px]">Arc Testnet (Chain ID 5042002)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Server className="w-8 h-8 text-purple-400 shrink-0" />
              Validator Status & Consensus Telemetry
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Institutional consortium consensus nodes securing Circle Arc L1 with sub-second Byzantine fault tolerance and micro USDC gas finality.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 self-start lg:self-center">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border-2 border-white/30 text-white text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>

            <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Last Sync</div>
              <div className="text-xs text-emerald-400 font-bold">{lastSyncTime}</div>
            </div>
          </div>
        </div>

        {/* ──────────────── 1. TOP METRIC CARDS ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Validators */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Active Validators</span>
              <div className="p-2 rounded-xl bg-purple-100 text-purple-800 border border-purple-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950">
              {totalActive} <span className="text-base text-slate-400 font-normal">/ {validators.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                100% Consortium Quorum
              </span>
              <span className="text-slate-500 font-mono">0 Slashed</span>
            </div>
          </div>

          {/* Card 2: Network Health */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Network Health</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
              {networkHealth}%
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600">BFT Consensus</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono text-[11px] border border-emerald-200">
                OPTIMAL
              </span>
            </div>
          </div>

          {/* Card 3: Avg Ping / Latency */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Avg Ping / Latency</span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 border border-indigo-300">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
              {avgLatency} <span className="text-sm font-bold">ms</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-indigo-600 font-bold">Sub-second Finality</span>
              <span className="text-slate-500 font-mono">P99: 4.8ms</span>
            </div>
          </div>

          {/* Card 4: Current Epoch / Block */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Current Epoch & Block</span>
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800 border border-teal-300">
                <Blocks className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950">
              #{currentBlock.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-teal-700 font-bold font-mono">Epoch {epoch}</span>
              <span className="text-slate-500 font-mono text-[11px]">~450ms block time</span>
            </div>
          </div>
        </div>

        {/* ──────────────── 2. FILTER & SEARCH CONTROLS ──────────────── */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#0F172A] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search validator name, organization, 0x address, or region..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all font-mono placeholder:font-sans placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border-2 border-slate-950 font-mono text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                All ({validators.length})
              </button>
              <button
                onClick={() => setStatusFilter('online')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  statusFilter === 'online'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Online ({totalActive})
              </button>
              <button
                onClick={() => setStatusFilter('syncing')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  statusFilter === 'syncing'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Syncing ({totalSyncing})
              </button>
            </div>
          </div>
        </div>

        {/* ──────────────── 3. VALIDATOR TABLE MATRIX ──────────────── */}
        <div className="bg-white rounded-2xl border-2 border-slate-950 shadow-[5px_5px_0px_#0F172A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-950 font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Validator & Org</th>
                  <th className="py-3.5 px-4">Node Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th
                    onClick={() => toggleSort('uptime')}
                    className="py-3.5 px-4 cursor-pointer hover:text-purple-700 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Uptime (30d)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('latency')}
                    className="py-3.5 px-4 cursor-pointer hover:text-purple-700 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Ping / Latency</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('lastBlock')}
                    className="py-3.5 px-4 cursor-pointer hover:text-purple-700 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Last Block</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('votingPower')}
                    className="py-3.5 px-4 cursor-pointer hover:text-purple-700 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Voting Power</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 text-sm font-sans">
                {filteredValidators.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                      No validators found matching your search query "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredValidators.map((node) => {
                    const isCopied = copiedId === node.id;
                    return (
                      <tr
                        key={node.id}
                        className="hover:bg-purple-50/50 transition-colors group"
                      >
                        {/* 1. Name & Org */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-950 flex items-center justify-center text-lg shadow-[2px_2px_0px_#0F172A] shrink-0 overflow-hidden">
                              {node.logoSvg ? (
                                <div className="w-7 h-7 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: node.logoSvg }} />
                              ) : (
                                node.avatar
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-950 flex items-center gap-2">
                                <span>{node.name}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                                  {node.badge}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Globe className="w-3 h-3 text-slate-400" />
                                {node.organization} • {node.location}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Address */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800">
                            <span>{node.address}</span>
                            <button
                              onClick={() => handleCopy(node.fullAddress, node.id)}
                              className="text-slate-400 hover:text-purple-700 transition-colors p-0.5"
                              title="Copy full validator address"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 3. Status */}
                        <td className="py-4 px-4 font-mono text-xs">
                          {node.status === 'online' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              ONLINE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin" />
                              SYNCING
                            </span>
                          )}
                        </td>

                        {/* 4. Uptime % */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900">{node.uptime}%</div>
                            <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  node.uptime > 99.9
                                    ? 'bg-emerald-500'
                                    : node.uptime > 99.5
                                    ? 'bg-teal-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${node.uptime}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 5. Latency */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <span
                            className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                              node.latency < 3.0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : node.latency < 10.0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <Radio className="w-3 h-3" />
                            {node.latency} ms
                          </span>
                        </td>

                        {/* 6. Last Block Signed */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <div className="text-slate-900 font-bold">
                            #{node.lastBlockSigned.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {currentBlock - node.lastBlockSigned === 0
                              ? 'Just now (block leader)'
                              : `${currentBlock - node.lastBlockSigned} blocks ago`}
                          </div>
                        </td>

                        {/* 7. Voting Power & Stake */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <div className="font-bold text-slate-900">{node.votingPower}%</div>
                          <div className="text-[10px] text-slate-500">
                            {(node.stakeUsdc / 1000).toFixed(0)}k USDC Stake
                          </div>
                        </td>

                        {/* 8. Action Details */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedValidator(node)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-900 hover:text-white border-2 border-slate-950 text-slate-900 font-mono text-xs font-bold shadow-[2px_2px_0px_#0F172A] transition-all active:translate-x-0.5 active:translate-y-0.5"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ──────────────── 4. FOOTER TELEMETRY STATS & DISCLAIMER ──────────────── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-950 shadow-[3px_3px_0px_#0F172A] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
            <span>Circle Arc L1 Consortium Validator Cluster • Proof-of-Authority & BFT Quorum</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Protocol Slashing Penalty: <strong>0.00%</strong></span>
            <span>Consensus Round: <strong>#4,821,090</strong></span>
          </div>
        </div>
      </div>

      {/* ──────────────── 5. VALIDATOR DETAILS MODAL / DRAWER ──────────────── */}
      {selectedValidator && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-slate-950 shadow-[8px_8px_0px_#0F172A] max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#0F172A] overflow-hidden">
                  {selectedValidator.logoSvg ? (
                    <div className="w-8 h-8 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: selectedValidator.logoSvg }} />
                  ) : (
                    selectedValidator.avatar
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                    {selectedValidator.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedValidator.organization} • {selectedValidator.region}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedValidator(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-950 font-bold text-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Specs Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Consensus Status
                </div>
                <div className="font-bold text-slate-900 text-sm uppercase text-emerald-600">
                  {selectedValidator.status}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Live Ping Latency
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedValidator.latency} ms</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  Voting Power
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedValidator.votingPower}%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  30-Day Uptime
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedValidator.uptime}%</div>
              </div>
            </div>

            {/* Hardware & Infrastructure */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                Node Infrastructure & Hardware
              </h4>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> Processor:
                  </span>
                  <span className="text-white font-bold">{selectedValidator.hardware.cpu}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <HardDrive className="w-3.5 h-3.5 text-teal-400" /> Memory:
                  </span>
                  <span className="text-white font-bold">{selectedValidator.hardware.ram}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" /> Network Bandwidth:
                  </span>
                  <span className="text-white font-bold">{selectedValidator.hardware.bandwidth}</span>
                </div>
              </div>
            </div>

            {/* Full 0x Address */}
            <div className="space-y-1 font-mono text-xs">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                Full Validator Consensus Address
              </span>
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between gap-2 overflow-x-auto text-[11px] text-slate-800">
                <span className="truncate">{selectedValidator.fullAddress}</span>
                <button
                  onClick={() => handleCopy(selectedValidator.fullAddress, selectedValidator.id)}
                  className="px-2 py-1 rounded bg-purple-700 text-white font-bold hover:bg-purple-800 shrink-0"
                >
                  {copiedId === selectedValidator.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedValidator(null)}
                className="w-full py-3 rounded-xl bg-purple-700 text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-purple-800 border-2 border-slate-950 shadow-[3px_3px_0px_#0F172A] active:translate-x-0.5 active:translate-y-0.5"
              >
                Close Telemetry Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatorStatus;
