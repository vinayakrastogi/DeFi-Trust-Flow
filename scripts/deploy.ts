/* eslint-disable @typescript-eslint/no-var-requires */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const ethers = hre.ethers;
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  TrustFlow Lending — Deployment");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Network:  ${network.name} (chainId: ${network.chainId})`);
    console.log(`  Deployer: ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`  Balance:  ${ethers.formatEther(balance)} ETH`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (balance === 0n) {
        throw new Error("Deployer has no ETH. Get Sepolia ETH from a faucet.");
    }

    // Deploy TrustFlowLending
    console.log("Deploying TrustFlowLending...");
    const TrustFlowLending = await ethers.getContractFactory("TrustFlowLending");
    const lending = await TrustFlowLending.deploy();
    await lending.waitForDeployment();

    const address = await lending.getAddress();
    console.log(`✅ TrustFlowLending deployed to: ${address}`);

    // Save deployment info
    const deployDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deployDir)) {
        fs.mkdirSync(deployDir, { recursive: true });
    }

    const networkName =
        network.chainId === 11155111n
            ? "sepolia"
            : network.chainId === 31337n
                ? "localhost"
                : `chain-${network.chainId}`;

    const deploymentInfo = {
        network: networkName,
        chainId: Number(network.chainId),
        contract: "TrustFlowLending",
        address: address,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber(),
    };

    const deployFile = path.join(deployDir, `${networkName}.json`);
    fs.writeFileSync(deployFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${deployFile}`);

    // Copy ABI for frontend
    const artifactPath = path.join(
        __dirname,
        "..",
        "artifacts",
        "contracts",
        "TrustFlowLending.sol",
        "TrustFlowLending.json"
    );
    if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const abiDir = path.join(__dirname, "..", "src", "lib");
        const abiFile = path.join(abiDir, "TrustFlowLendingABI.json");
        fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
        console.log(`📄 ABI copied to: ${abiFile}`);
    }

    // Print explorer link
    if (network.chainId === 11155111n) {
        console.log(`\n🔗 Etherscan: https://sepolia.etherscan.io/address/${address}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Next steps:");
    console.log(`  1. Update .env.local with:`);
    console.log(`     NEXT_PUBLIC_LENDING_CONTRACT_ADDRESS="${address}"`);
    console.log(`  2. Restart your dev server: npm run dev`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
