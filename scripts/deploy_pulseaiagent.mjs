import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URLS = [
    'https://rpc.testnet.arc.io',
    'https://rpc.drpc.testnet.arc.io',
    'https://rpc.quicknode.testnet.arc.io',
    'https://rpc.testnet.arc.network'
];
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function deployPulseAIAgent() {
    console.log('🚀 Compiling PulseAIAgent.sol with solc 0.8.20...');

    const contractPath = path.resolve('contracts', 'PulseAIAgent.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'PulseAIAgent.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode'],
                },
            },
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        let hasFatal = false;
        output.errors.forEach(err => {
            console.log(err.formattedMessage);
            if (err.severity === 'error') hasFatal = true;
        });
        if (hasFatal) throw new Error('Solidity compilation failed.');
    }

    const contractObj = output.contracts['PulseAIAgent.sol']['PulseAIAgent'];
    const abi = contractObj.abi;
    const bytecode = contractObj.evm.bytecode.object;

    console.log('✅ Compilation Successful! ABI generated.');

    // Save ABI and bytecode to artifacts
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync(
        path.resolve('artifacts', 'PulseAIAgent.json'),
        JSON.stringify({ abi, bytecode: '0x' + bytecode }, null, 2)
    );

    if (!PRIVATE_KEY) {
        console.log('\n⚠️ PRIVATE_KEY not found in .env. Contract compiled and artifact saved to artifacts/PulseAIAgent.json');
        console.log('👉 To deploy automatically, set PRIVATE_KEY in .env or deploy via Remix / Metamask.');
        return;
    }

    let provider = null;
    let connectedRpc = '';

    for (const rpc of RPC_URLS) {
        try {
            console.log('📡 Trying RPC:', rpc);
            const p = new ethers.JsonRpcProvider(rpc, { chainId: 5042002, name: 'arc-testnet' });
            await p.getBlockNumber();
            provider = p;
            connectedRpc = rpc;
            console.log('✅ Connected to live RPC:', rpc);
            break;
        } catch (e) {
            console.log('⚠️ Failed connecting to:', rpc);
        }
    }

    if (!provider) {
        throw new Error('Could not connect to any Arc L1 RPC endpoint.');
    }

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('👤 Deployer Address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Deployer Native USDC Gas Balance:', ethers.formatEther(balance), 'USDC');

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log('⏳ Broadcasting deployment transaction to Arc L1...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log('\n🎉 ==============================================');
    console.log('🔥 PulseAIAgent Contract Deployed Successfully!');
    console.log('📍 Contract Address:', deployedAddress);
    console.log('🔍 ArcScan Explorer: https://testnet.arcscan.app/address/' + deployedAddress);
    console.log('🎉 ==============================================\n');
}

deployPulseAIAgent().catch(err => {
    console.error('❌ Deployment Error:', err);
    process.exit(1);
});
