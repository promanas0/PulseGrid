import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const ARC_RPC_URL = 'https://rpc.testnet.arc.network';
const CHAIN_ID = 5042002;

async function main() {
    console.log('🚀 Compiling ArcPulsePredictionMarket.sol...');

    const contractPath = path.resolve('ArcPulsePredictionMarket.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'ArcPulsePredictionMarket.sol': {
                content: source,
            },
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation Errors:');
            errors.forEach(e => console.error(e.formattedMessage));
            process.exit(1);
        }
    }

    console.log('✅ ArcPulsePredictionMarket.sol compiled successfully!');

    const contractFile = output.contracts['ArcPulsePredictionMarket.sol']['ArcPulsePredictionMarket'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    fs.writeFileSync('ArcPulsePredictionMarket.json', JSON.stringify({ abi, bytecode }, null, 2));
    console.log('📄 Saved ABI & Bytecode to ArcPulsePredictionMarket.json');

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ PRIVATE_KEY missing in .env file');
        process.exit(1);
    }

    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const provider = new ethers.JsonRpcProvider(ARC_RPC_URL, {
        name: 'Arc Testnet',
        chainId: CHAIN_ID,
    });

    const wallet = new ethers.Wallet(formattedKey, provider);
    console.log(`🔑 Deployer Wallet Address: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Native USDC Balance: ${ethers.formatEther(balance)} USDC`);

    console.log('⏳ Deploying ArcPulsePredictionMarket to Arc Testnet...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    const contract = await factory.deploy({
        gasLimit: 3500000,
    });

    console.log(`📡 Deployment Transaction Hash: ${contract.deploymentTransaction().hash}`);
    console.log('⏳ Waiting for block confirmation on Arc Testnet...');

    await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();

    console.log('\n======================================================');
    console.log(`🎉 ArcPulsePredictionMarket DEPLOYED SUCCESSFULLY!`);
    console.log(`📍 Contract Address: ${deployedAddress}`);
    console.log(`🌐 ArcScan Explorer: https://testnet.arcscan.io/address/${deployedAddress}`);
    console.log('======================================================\n');

    console.log('🌱 Seeding Default Flagship Markets into contract...');
    const seedTx = await contract.seedDefaultMarkets({ gasLimit: 2500000 });
    console.log(`📡 Seeding Tx: ${seedTx.hash}`);
    await seedTx.wait();
    console.log('✅ Default Markets Seeded on-chain successfully!');

    const count = await contract.marketCount();
    console.log(`📊 Active On-Chain Markets Count: ${count.toString()}`);
}

main().catch(err => {
    console.error('❌ Deployment Failed:', err);
    process.exit(1);
});
