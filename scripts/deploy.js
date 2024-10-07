const { ethers, run } = require("hardhat");
const { writeFileSync } = require("fs");
const ADDRESS = require('../config/address.json');

async function main() {
    // Get network data from Hardhat config (see hardhat.config.ts).
    const network = process.env.NETWORK;
    // Check if the network is supported.
    console.log(`Deploying to ${network} network...`);

    const [owner] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    console.log('Owner wallet:', ownerAddress);

    const beforeBalance = await ethers.provider.getBalance(ownerAddress);
    console.log('Owner balance:', ethers.formatEther(beforeBalance));

    const Contract = await ethers.getContractFactory("AYEKOIN");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("AYEKOIN contract deployed to:", address);

    await run('verify:verify', {
        address: address,
        constructorArguments: []
    });

    const afterBalance = await ethers.provider.getBalance(ownerAddress);
    console.log('Owner balance:', ethers.formatEther(afterBalance));

    const totalSpent = beforeBalance - afterBalance;
    console.log('Total spent:', ethers.formatEther(totalSpent), 'BNB');

    // Write the address to a file.
    ADDRESS[process.env.NETWORK]['AYEKOIN'] = address;
    writeFileSync(
        `./config/address.json`,
        JSON.stringify(ADDRESS, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
