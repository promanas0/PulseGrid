import type { NextApiRequest, NextApiResponse } from 'next';
import { AppKit } from '@circle-fin/app-kit';
import { ArcTestnet } from '@circle-fin/app-kit/chains';
import { createViemAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2';

/**
 * Circle AppKit Swap API Route (Next.js Pages Router: /api/swap)
 * Executes Circle DEX Swap (USDC <-> EURC) on Arc Testnet (Chain ID 5042002)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { tokenIn = 'USDC', tokenOut = 'EURC', amountIn = '1.00', privateKey, slippageBps = 300 } = req.body || {};

    const rawPk = (privateKey || process.env.PRIVATE_KEY || '').trim();
    if (!rawPk) {
      return res.status(400).json({ success: false, error: 'PRIVATE_KEY not provided in request body or .env' });
    }

    const formattedPk = (rawPk.startsWith('0x') ? rawPk : `0x${rawPk}`) as `0x${string}`;
    const viemAdapter = createViemAdapterFromPrivateKey({ privateKey: formattedPk });

    const kit = new AppKit();
    const result = await kit.swap({
      from: { adapter: viemAdapter, chain: ArcTestnet },
      tokenIn,
      tokenOut,
      amountIn: String(amountIn),
      config: {
        slippageBps: Number(slippageBps) || 300,
        allowanceStrategy: 'approve',
      },
    });

    return res.status(200).json({
      success: true,
      result,
      explorerUrl: (result as any)?.explorerUrl || `https://testnet.arcscan.app/tx/${(result as any)?.txHash}`,
    });
  } catch (error: any) {
    console.error('Circle Swap API Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Swap execution failed',
    });
  }
}
