import * as dotenv from "dotenv";
import hre, { ethers } from "hardhat";
import { LedgerSigner } from "@anders-t/ethers-ledger";
import {
  contractDeployment,
  etherscanVerification,
  keypress,
  writeContractData,
} from "./utils";
import { BigNumber } from "ethers";
import {
  AngryApeArmyValkyrieCollection,
  ValkyriesRoyaltyReceiver,
} from "../typechain";

dotenv.config();

const network = hre.network.name;

// Settings //////////////////////////////////////////////////////////////

const settingsNetwork = "mainnet";

const contractOwner = { address: "0x6ab71C2025442B694C8585aCe2fc06D877469D30" };

const contractAdmin = {
  address: "0x3984DB1beE5b386f0211822A5Bdf67fc6c7abC66", // Confirmed (Heather's contract admin account.)
};

const evoContract = {
  address: "0x74F1716A9F452dD36d945368d806cD491290B240",
};

const date = new Date().toJSON().replace(/-|:|T|\..*/g, "");
const dir = `deployment/${network}`;
const filename = `deployment-${date}.json`;

/////////////////////////////////////////////////////////////////////////

async function main() {
  // Global(ish) vars
  const [contractDeployer] = await ethers.getSigners();
  // const contractDeployer = new LedgerSigner(hre.ethers.provider);
  await contractDeployer.getAddress().catch((e) => {
    console.log("\nERROR: Ledger needs to be unlocked\n");
    process.exit(1);
  });
  await contractDeployer.getChainId().catch((e) => {
    console.log("\nERROR: Open Etheruem app on the Ledger.\n");
    process.exit(1);
  });

  if (["hardhat", "localhost"].includes(network)) {
    const [testUser] = await ethers.getSigners();
    testUser.sendTransaction({
      to: await contractDeployer.getAddress(),
      value: ethers.utils.parseEther("200"),
    });
  }

  let initialBalance: BigNumber;
  let currentBalance: BigNumber;
  let rrContract: ValkyriesRoyaltyReceiver;
  let contract: AngryApeArmyValkyrieCollection;

  console.log("***************************");
  console.log("*   Contract Deployment   *");
  console.log("***************************");
  console.log("\n");

  // Confirm Settings
  {
    console.log("Settings");
    console.log("Network:", network, settingsNetwork == network);
    console.log(
      "Contract Owner Address:",
      contractOwner.address,
      ethers.utils.isAddress(contractOwner.address)
    );
    console.log(
      "Contract Admin Address:",
      contractAdmin.address,
      ethers.utils.isAddress(contractAdmin.address)
    );
    console.log("\n");

    writeContractData(dir, filename, {
      date,
      network,
      contractOwnerAddress: contractOwner.address,
      contractAdminAddress: contractAdmin.address,
    });

    await keypress();
  }

  // Confirm Deployer
  {
    initialBalance = await contractDeployer.getBalance();

    console.log("Deployment Wallet");
    console.log("Address:", await contractDeployer.getAddress());
    console.log("Chainid: ", await contractDeployer.getChainId());
    console.log("Balance:", ethers.utils.formatEther(initialBalance), "Ether");
    console.log("\n");

    writeContractData(dir, filename, {
      deployerAddress: await contractDeployer.getAddress(),
    });

    await keypress();
  }

  // Royalty Receiver Deployment
  {
    rrContract = (await contractDeployment(
      contractDeployer,
      "ValkyriesRoyaltyReceiver",
      "Royalty Receiver"
    )) as ValkyriesRoyaltyReceiver;

    writeContractData(dir, filename, {
      royaltyReceiverAddress: rrContract.address,
    });

    // Verify on etherscan
    await etherscanVerification(rrContract.address);

    await keypress();
  }

  // Valkyries Contract Deployment
  {
    // address admin_,
    // address royaltyReceiver_,
    // ERC721ABurnable evoContract_,
    // address[] preAuthorised_
    const args = [
      contractAdmin.address,
      rrContract.address,
      evoContract.address,
      [],
    ];
    contract = (await contractDeployment(
      contractDeployer,
      "AngryApeArmyValkyrieCollection",
      "AngryApeArmyValkyrieCollection",
      args
    )) as AngryApeArmyValkyrieCollection;

    writeContractData(dir, filename, {
      ValkyriesAddress: contract.address,
      ValkyriesArguments: args,
    });

    // Verify on etherscan
    await etherscanVerification(contract.address, args);

    await keypress();
  }

  // Transfer ownership
  {
    console.log("Transfer Ownership to: " + contractOwner.address);

    await keypress("Press any key to continue and ctrl-C to cancel");
    const rrTx = await rrContract
      .connect(contractDeployer)
      .transferOwnership(contractOwner.address);
    console.log("Royalty Receiver owner tx hash:", rrTx.hash);
    await rrTx.wait();

    const Tx = await contract
      .connect(contractDeployer)
      .transferOwnership(contractOwner.address);
    console.log("Valkyries owner tx hash:", rrTx.hash);
    await Tx.wait();
  }

  // Deployment Costs
  {
    currentBalance = await contractDeployer.getBalance();
    console.log(
      "Deployment Cost:",
      ethers.utils.formatEther(initialBalance.sub(currentBalance)),
      "Ether"
    );
    console.log("\n");

    writeContractData(dir, filename, {
      deploymentCost: ethers.utils.formatEther(
        initialBalance.sub(currentBalance)
      ),
    });

    console.log("Completed Successfully");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
