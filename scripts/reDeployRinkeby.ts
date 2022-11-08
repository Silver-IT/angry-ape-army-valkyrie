import * as dotenv from "dotenv";
import { BigNumber } from "ethers";
import hre, { ethers } from "hardhat";
import { StandardERC721A, OKJILMPC2 } from "../typechain";
import { contractDeployment, keypress, writeContractData } from "./utils";

dotenv.config();

const network = hre.network.name;

// Settings //////////////////////////////////////////////////////////////

const settingsNetwork = "rinkeby";

const contractOwner = { address: "0xcCfE4D7C203491a0eF8283E00f8f5D05bf49C41F" };

const contractAdmin = {
  address: "0x859010BaAD3E7f51A5EF1e43550056ea29542Fb0",
};

const evolutionContract = {
  address: "0xe3CACaD44aa0e7559358202A66B81ff269543D7D",
};

const date = new Date().toJSON().replace(/-|:|T|\..*/g, "");
const dir = `deployment/${network}`;
const filename = `deployment-${date}.json`;

//////////////////////////////////////////////////////////////////////////

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
    const [localUser] = await ethers.getSigners();
    localUser.sendTransaction({
      to: await contractDeployer.getAddress(),
      value: ethers.utils.parseEther("200"),
    });
  }

  let initialBalance: BigNumber;
  let currentBalance: BigNumber;
  // let rrContract: RoyaltyReceiver;
  // let evolutionContract: StandardERC721A;
  let valkyriesContract: OKJILMPC2;

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
    console.log("\n");

    writeContractData(dir, filename, {
      date,
      network,
      contractOwnerAddress: contractOwner.address,
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

    // await keypress();
  }

  // // Royalty Receiver Deployment
  // {
  //   rrContract = (await contractDeployment(
  //     contractDeployer,
  //     "FalloutFreaksRoyaltyReceiver",
  //     "Royalty Receiver"
  //   )) as FalloutFreaksRoyaltyReceiver;

  //   writeContractData(dir, filename, {
  //     royaltyReceiverAddress: rrContract.address,
  //   });

  //   // await keypress();
  // }

  // // AAA Evolution Collection Deployment
  // {
  //   evolutionContract = (await contractDeployment(
  //     contractDeployer,
  //     "StandardERC721A",
  //     "Evolution Collection"
  //   )) as StandardERC721A;

  //   writeContractData(dir, filename, {
  //     evolutionAddress: evolutionContract.address,
  //   });

  //   // await keypress();
  // }

  // AAA Valkyries Deployment
  {
    const args = [
      contractAdmin.address,
      contractOwner.address,
      evolutionContract.address,
      [],
    ];
    valkyriesContract = (await contractDeployment(
      contractDeployer,
      "Valkyries",
      "Valkyries",
      args
    )) as OKJILMPC2;

    writeContractData(dir, filename, {
      valkyriesAddress: valkyriesContract.address,
      valkyriesArgs: args,
    });

    // await keypress();
  }

  // Transfer ownership
  {
    let tx;
    console.log("Transfer Ownership to: " + contractOwner.address);

    // // await keypress("Press any key to continue and ctrl-C to cancel");
    // tx = await rrContract
    //   .connect(contractDeployer)
    //   .transferOwnership(contractOwner.address);
    // console.log("Royalty Receiver owner tx hash:", tx.hash);
    // await tx.wait();

    tx = await valkyriesContract
      .connect(contractDeployer)
      .transferOwnership(contractOwner.address);
    console.log("Valkyries Contract owner tx hash:", tx.hash);
    await tx.wait();
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
