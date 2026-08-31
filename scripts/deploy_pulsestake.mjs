import { ethers } from 'ethers';
import fs from 'fs';
import solc from 'solc';

const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
    console.log("⚡ Compiling PulseStake.sol...");
    const source = fs.readFileSync('contracts/PulseStake.sol', 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'PulseStake.sol': { content: source }
        },
        settings: {
            optimizer: { enabled: true, runs: 200 },
            outputSelection: { '*': { '*': ['*'] } }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error("Compilation errors:", errors);
            process.exit(1);
        }
    }

    const contractFile = output.contracts['PulseStake.sol']['PulseStake'];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    console.log("✓ Contract compiled successfully!");

    if (!PRIVATE_KEY) {
        console.log("\n[INFO] To deploy via this CLI script, set your PRIVATE_KEY:");
        console.log("PRIVATE_KEY=\"0x...\" node scripts/deploy_pulsestake.mjs\n");
        console.log("OR deploy using Remix IDE (recommended for MetaMask 1-click deploy)!");
        return;
    }

    console.log(`Connecting to Circle Arc Testnet (${ARC_RPC_URL})...`);
    const provider = new ethers.providers.JsonRpcProvider(ARC_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deployer Address: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Deployer Native USDC Balance: ${ethers.utils.formatEther(balance)} USDC`);

    if (balance.eq(0)) {
        console.error("❌ Deployer balance is 0 USDC. Get testnet USDC from faucet first.");
        process.exit(1);
    }

    console.log("\n🚀 Deploying PulseStake.sol to Circle Arc L1 Testnet...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy({
        gasLimit: 3000000
    });

    console.log(`Transaction sent! TX Hash: ${contract.deployTransaction.hash}`);
    console.log("Waiting for block confirmation on Arc L1...");
    await contract.deployed();

    console.log("\n🎉 PULSESTAKE DEPLOYED SUCCESSFULLY ON CIRCLE ARC L1!");
    console.log(`Contract Address: ${contract.address}`);
    console.log(`ArcScan Explorer: https://testnet.arcscan.app/address/${contract.address}`);

    const pUsdcAddress = await contract.pUsdcToken();
    console.log(`pUSDC Token Address: ${pUsdcAddress}`);
    console.log(`pUSDC ArcScan: https://testnet.arcscan.app/address/${pUsdcAddress}`);

    fs.writeFileSync('scripts/pulsestake_deployed.json', JSON.stringify({
        network: 'Arc Testnet L1',
        chainId: 5042002,
        pulseStakeAddress: contract.address,
        pUsdcAddress: pUsdcAddress,
        deployer: wallet.address,
        txHash: contract.deployTransaction.hash,
        timestamp: new Date().toISOString()
    }, null, 2));

    console.log("\nSaved deployment artifact to scripts/pulsestake_deployed.json");
}

main().catch(err => {
    console.error("Deploy script error:", err);
    process.exit(1);
});
