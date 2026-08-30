import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.ARC_TESTNET_RPC || 'https://rpc.testnet.arc.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function deployPulsePay() {
    console.log('🚀 Compiling PulsePay.sol with solc 0.8.20...');

    const contractPath = path.resolve('contracts', 'PulsePay.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'PulsePay.sol': {
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

    const contractObj = output.contracts['PulsePay.sol']['PulsePay'];
    const abi = contractObj.abi;
    const bytecode = contractObj.evm.bytecode.object;

    console.log('✅ Compilation Successful! ABI generated.');

    // Save ABI and bytecode to artifacts
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync(
        path.resolve('artifacts', 'PulsePay.json'),
        JSON.stringify({ abi, bytecode: '0x' + bytecode }, null, 2)
    );
    console.log('📦 Saved to artifacts/PulsePay.json');

    if (!PRIVATE_KEY) {
        console.log('⚠️ No PRIVATE_KEY in .env. ABI & bytecode prepared for in-app browser wallet execution.');
        return;
    }

    console.log('📡 Connecting to Arc Testnet L1 (' + RPC_URL + ')...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log('Deployer address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'USDC');

    const factory = new ethers.ContractFactory(abi, '0x' + bytecode, wallet);
    console.log('⏳ Deploying PulsePay contract to Arc L1...');

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log('🎉 PulsePay Successfully Deployed on Arc Testnet!');
    console.log('📍 Contract Address:', deployedAddress);
    console.log('🔗 Explorer:', `https://testnet.arcscan.app/address/${deployedAddress}`);
}

deployPulsePay().catch(console.error);
