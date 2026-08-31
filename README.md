# PulseGrid (ArchPulse) - High-Performance Circle Arc L1 Web3 Ecosystem Suite

Next-Generation Institutional-Grade Web3 Infrastructure, Telemetry Matrix, PulsePay Invoicing, Liquid Staking, DEX AMM, and AI Intelligence Engine for Circle Arc L1.

Live Application: https://pulsegrid-hub.vercel.app  
Arc Documentation: https://docs.arc.network  
ArcScan Explorer: https://testnet.arcscan.app  
Circle Faucet: https://faucet.circle.com  

---

## Table of Contents
- [Executive Overview](#executive-overview)
- [Circle Arc L1 Network Specifications](#circle-arc-l1-network-specifications)
- [Verified Smart Contract Addresses](#verified-smart-contract-addresses)
- [Complete Feature Breakdown](#complete-feature-breakdown)
  - [1. PulsePay - Instant USDC Invoicing & QR Settlement Engine](#1-pulsepay---instant-usdc-invoicing--qr-settlement-engine)
  - [2. PulseStake - Validator Liquid Staking & Yield Protocol](#2-pulsestake---validator-liquid-staking--yield-protocol)
  - [3. Precision DEX AMM Swap Engine](#3-precision-dex-amm-swap-engine)
  - [4. ERC-20 Token Creator & Factory](#4-erc-20-token-creator--factory)
  - [5. NFT Studio & Genesis Passes](#5-nft-studio--genesis-passes)
  - [6. Live Telemetry & Network Pulse](#6-live-telemetry--network-pulse)
  - [7. Daily Quests, Streaks & Builder XP](#7-daily-quests-streaks--builder-xp)
  - [8. AI Copilot & Market Forecasting](#8-ai-copilot--market-forecasting)
  - [9. Developer Tools Matrix](#9-developer-tools-matrix)
- [Architecture and Standards Compliance](#architecture-and-standards-compliance)
- [Repository Structure](#repository-structure)
- [Quick Start and Local Setup](#quick-start-and-local-setup)
- [License](#license)

---

## Executive Overview

PulseGrid (ArchPulse) is an institutional-grade, decentralized Web3 ecosystem and full workstation built specifically for Circle Arc L1. Circle Arc L1 is a high-throughput, sub-second finality Layer-1 blockchain featuring native USDC as its gas and settlement currency.

PulseGrid provides a comprehensive suite of Web3 applications, including merchant payment-link invoicing (PulsePay), validator liquid staking (PulseStake), decentralized token swapping, instant ERC-20 token generation, NFT minting, real-time JSON-RPC network telemetry, EIP-4361 authenticated community quests, and AI-powered contract analysis.

---

## Circle Arc L1 Network Specifications

| Parameter | Value |
| :--- | :--- |
| Network Name | Circle Arc L1 Testnet |
| Chain ID | `5042002` (Hex: `0x4CEF52`) |
| Native Gas Token | **USDC** (USD Coin by Circle) |
| Decimals | `18` (Wei scale for EVM RPC compatibility) |
| Finality | `~0.4s` (Sub-Second BFT Finality) |
| Throughput | `1,400+ TPS` with deterministic micro-gas model |
| RPC Endpoint | `https://rpc.testnet.arc.network` |
| Block Explorer | `https://testnet.arcscan.app` |
| Official Faucet | `https://faucet.circle.com` |

---

## Verified Smart Contract Addresses

All contracts are deployed and verified on Circle Arc L1 Testnet (Chain ID 5042002):

| Protocol Module | Contract Name | Deployed Contract Address | Explorer Link |
| :--- | :--- | :--- | :--- |
| **PulsePay Engine** | `PulsePay.sol` | `0x236c9EbdC863fAAA0d47D4FE2B7C18978dFa7947` | [View on ArcScan](https://testnet.arcscan.app/address/0x236c9EbdC863fAAA0d47D4FE2B7C18978dFa7947) |
| **PulseStake Protocol** | `PulseStake.sol` | `0x9F6baFB6961aAd0fC133d32A559CaFdf32582801` | [View on ArcScan](https://testnet.arcscan.app/address/0x9F6baFB6961aAd0fC133d32A559CaFdf32582801) |
| **Liquid Staking Token** | `PulseUSDC ($pUSDC)` | `0x9EE52CC50435aa46b51092fCC964debDb21C6510` | [View on ArcScan](https://testnet.arcscan.app/address/0x9EE52CC50435aa46b51092fCC964debDb21C6510) |
| **Swap Router** | `PulseSwapRouter` | `0xD651528Ec9a15A1702fFf015949a0DFFD48b9C43` | [View on ArcScan](https://testnet.arcscan.app/address/0xD651528Ec9a15A1702fFf015949a0DFFD48b9C43) |
| **Official EURC Token** | `EURC Token` | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | [View on ArcScan](https://testnet.arcscan.app/address/0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a) |

---

## Complete Feature Breakdown

### 1. PulsePay - Instant USDC Invoicing & QR Settlement Engine
PulsePay provides instantaneous, trustless payment link generation and dynamic QR checkout for merchants and peer-to-peer commerce on Arc L1.
- **Link & Dynamic QR Generator**: Input custom payment amounts (USDC/EURC), invoice reference codes, and custom memo notes for the payer.
- **Shareable Web Checkout**: Generates lightweight payment URLs (`pay.html?to=...&amt=...&token=USDC&msg=...&ref=...`) enabling 1-click MetaMask checkout.
- **My Created Payment Links**: Persistent link manager allowing users to store generated payment links, copy URLs to clipboard, display dynamic QR modals, or open checkout pages directly.
- **Received Payments History**: Live transaction ledger recording all real settled on-chain payments received. Displays payer address, settled amount, memo note, reference ID, timestamp, cryptographic receipt modal, and direct ArcScan explorer verification links.
- **Sub-Second Finality**: Settlements confirm on Circle Arc L1 in approximately 0.4 seconds with predictable micro-gas (~0.001 USDC).

### 2. PulseStake - Validator Liquid Staking & Yield Protocol
PulseStake allows users to stake native USDC gas assets across Arc L1 consensus validators to secure the network while earning yield.
- **Validator Delegation**: Stake native USDC with leading consortium validator nodes.
- **Liquid Derivative Token ($pUSDC)**: Receive 1:1 liquid staking derivative tokens (`0x9EE52CC50435aa46b51092fCC964debDb21C6510`) that remain usable across DeFi applications while earning yield.
- **Real-Time Reward Accrual**: On-chain reward accumulation with instant reward claim and unstake functionality.
- **Protocol Analytics**: Real-time tracking of total value staked, active stakers, validator distributions, and historical protocol APY.

### 3. Precision DEX AMM Swap Engine
Decentralized constant-product automated market maker tailored for stablecoin and asset liquidity on Arc L1.
- **Deterministic Stablecoin Routing**: Algorithmic exchange rates supporting instant conversion between native USDC, Circle EURC, and wrapped tokens.
- **Configurable Slippage Tolerance**: Precision controls ranging from 0.1% to 1.0% with automated price impact calculation.
- **Sub-Second Execution**: Swap execution settled directly through `PulseSwapRouter` on Arc L1 with instant receipt logging.

### 4. ERC-20 Token Creator & Factory
A no-code token deployment suite designed for developers and project founders on Arc L1.
- **1-Click Token Deployment**: Configure token name, symbol, total supply, and decimal precision.
- **Standard EVM Compatibility**: Generates standard, audited OpenZeppelin-compatible ERC-20 bytecode directly on Arc Testnet.
- **Wallet & Explorer Integration**: Automatic token import configuration for MetaMask and instant ArcScan contract verification.

### 5. NFT Studio & Genesis Passes
Digital asset creation and collection management engine.
- **Arc Genesis Builder Pass**: Mint exclusive on-chain proof-of-builder NFTs with cryptographic metadata.
- **Interactive NFT Gallery**: Inspect owned digital collectibles, token IDs, metadata attributes, and on-chain ownership history.

### 6. Live Telemetry & Network Pulse
Real-time infrastructure and consensus monitoring dashboard.
- **Live JSON-RPC Telemetry Stream**: Continuously polls Arc L1 testnet nodes for block height, block time cadence, transaction velocity, and current throughput (TPS).
- **Consensus Health Matrix**: Visualizes validator consortium block production health, network latency, and average finality.
- **Gas Indexing**: Tracks deterministic micro-gas fees in real-time.

### 7. Daily Quests, Streaks & Builder XP
Gamified on-chain activity tracker designed for community engagement and testnet participation.
- **Cryptographic Daily Check-In**: Streak verification secured by EIP-4361 Sign-In with Ethereum (`personal_sign`) signature requests.
- **On-Chain Builder XP**: Dynamic XP calculation rewarded for completing actions across swaps, staking, and payment link generation.
- **Real-Time Leaderboard**: Transparent ranking of top network participants and builder achievements.

### 8. AI Copilot & Market Forecasting
Integrated machine learning and LLM intelligence layer powered by Google Gemini.
- **Smart Contract Auditing**: Paste Solidity code or contract addresses for automated vulnerability analysis and gas optimization suggestions.
- **On-Chain Analytics**: Natural language queries for Arc L1 network statistics, transaction deciphering, and wallet history interpretation.
- **Market Forecast Matrix**: Predictive price trend analysis, support and resistance mapping, and volatility metrics for major cryptocurrency assets.

### 9. Developer Tools Matrix
Essential utilities for developers building on Circle Arc L1.
- **Keccak-256 Hasher**: Compute cryptographic hashes for Solidity function selectors and event signatures.
- **Unit Converter**: Instant two-way conversion between Wei, Gwei, and Ether / USDC decimal scales.
- **ABI Encoder / Decoder**: Format and inspect function calldata and complex tuple parameters.
- **Address & Checksum Inspector**: Validate EIP-55 mixed-case checksums and verify public key derivations.

---

## Architecture and Standards Compliance

- **EIP-1193**: Standardized Ethereum provider compatibility (MetaMask, WalletConnect v2, Rabby, Coinbase Wallet).
- **EIP-191 & EIP-4361 (SIWE)**: Clean, domain-matched Sign-In with Ethereum standard preventing phishing and security warnings.
- **ERC-20 & ERC-721**: Standard token and non-fungible asset interfaces for maximum interoperability.
- **Sub-Second BFT Finality**: Eliminates mempool reorganization and pending transaction stalling.

---

## Repository Structure

```plaintext
archpulse/
|-- contracts/                    # Solidity Smart Contracts
|   |-- PulsePay.sol              # Payment Links & QR settlement engine
|   |-- PulseStake.sol            # Liquid staking & yield distributor
|   |-- PulseToken.sol            # Standard ERC-20 token implementation
|   `-- PulseSwapRouter.sol       # DEX swap and liquidity router
|-- scripts/                      # Deployment and Web3 automation scripts
|   |-- deploy_pulsepay.mjs       # PulsePay deployment script
|   |-- deploy_pulsestake.mjs     # PulseStake deployment script
|   `-- check_balances.mjs        # Wallet balance and RPC test script
|-- PulseGrid.html                # Main ecosystem dApp (Staking, DEX, Tokens, AI)
|-- archpulse.html                # Full synchronized standalone dApp entrypoint
|-- index.html                    # Official Neo-Brutalist Landing Page
|-- pay.html                      # Lightweight web checkout page for payment links
|-- app.js                        # Core Web3 controller, state, and RPC engine
|-- package.json                  # Project dependencies and npm scripts
`-- README.md                     # Official project documentation
```

---

## Quick Start and Local Setup

### Prerequisites
- Node.js version 18.0 or higher
- MetaMask or any standard EVM Web3 wallet configured with Circle Arc L1 Testnet

### Arc Testnet RPC Configuration
- **Network Name**: Circle Arc L1 Testnet
- **New RPC URL**: `https://rpc.testnet.arc.network`
- **Chain ID**: `5042002`
- **Currency Symbol**: `USDC`
- **Block Explorer URL**: `https://testnet.arcscan.app`

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/promanas0/PulseGrid.git
   cd PulseGrid
   ```

2. Start a local HTTP server:
   ```bash
   npx serve .
   ```
   Or using Python:
   ```bash
   python -m http.server 3000
   ```

3. Open your browser and navigate to `http://localhost:3000` to access the landing page, or `http://localhost:3000/archpulse.html` to launch the full dApp.

---

## License

This project is open-source software licensed under the **MIT License**.
Distributed freely for the Circle Arc L1 developer ecosystem.
