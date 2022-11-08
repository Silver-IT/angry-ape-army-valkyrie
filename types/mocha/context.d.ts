import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MerkleTree } from "merkletreejs";
import {
  Valkyries__factory,
  Valkyries,
  StandardERC721A,
  StandardERC721A__factory,
} from "../../typechain";

declare module "mocha" {
  export interface Context {
    owner: SignerWithAddress;
    signer: SignerWithAddress;
    approved: SignerWithAddress;
    admin: SignerWithAddress;
    mod: SignerWithAddress;
    user1: SignerWithAddress;
    user2: SignerWithAddress;
    user3: SignerWithAddress;
    user4: SignerWithAddress;
    user5: SignerWithAddress;
    user6: SignerWithAddress;
    user7: SignerWithAddress;
    user8: SignerWithAddress;
    user9: SignerWithAddress;
    evolutionContractFactory: StandardERC721A__factory;
    evolutionContract: StandardERC721A;
    valkyriesContractFactory: Valkyries__factory;
    valkyriesContract: Valkyries;
    // rrContract: RoyaltyReceiver;
  }
}
