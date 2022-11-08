import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { randomBytes } from "crypto";
import { expect } from "chai";
import signMintRequest from "../../utils/signMintRequest";
import { MockContract } from "@defi-wonderland/smock";

export default function suite() {
  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });

  const evoMinted = 100;
  let evoMintedArray: number[] = [];

  beforeEach(async function () {
    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );

    await ctx.evolutionContract.safeMintTo(ctx.user1.address, evoMinted);
    await ctx.evolutionContract
      .connect(ctx.user1)
      .setApprovalForAll(ctx.valkyriesContract.address, true);

    evoMintedArray = Array(evoMinted)
      .fill(0)
      .map((_, i) => i)
      .sort(() => Math.random() - 0.5);
  });

  it("should mint 1 valkyrie when burning 2 evo apes", async () => {
    const burnTokens = [0, 1];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(1);

    for (var i = 0; i < burnTokens.length / 2; i++) {
      expect(await ctx.valkyriesContract.ownerOf(i)).to.be.eq(
        ctx.user1.address
      );
    }

    expect(
      (await ctx.evolutionContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(evoMinted - burnTokens.length);
  });

  it("should fail to mint 1 valkyrie when burning 3 evo apes", async () => {
    const burnTokens = [0, 1, 2];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.be.revertedWith("BadArrayLength");
  });

  it("should mint 1 valkyrie when burning 2 random selected evo apes", async () => {
    const burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(1);

    for (var i = 0; i < burnTokens.length / 2; i++) {
      expect(await ctx.valkyriesContract.ownerOf(i)).to.be.eq(
        ctx.user1.address
      );
    }

    expect(
      (await ctx.evolutionContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(evoMinted - burnTokens.length);
  });

  it("should mint 2 valkyrie when burning 4 random selected evo apes", async () => {
    const burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(2);

    for (var i = 0; i < burnTokens.length / 2; i++) {
      expect(await ctx.valkyriesContract.ownerOf(i)).to.be.eq(
        ctx.user1.address
      );
    }

    expect(
      (await ctx.evolutionContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(evoMinted - burnTokens.length);
  });

  it("should mint 4 valkyrie when burning 8 random selected evo apes", async () => {
    const burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(4);

    for (var i = 0; i < burnTokens.length / 2; i++) {
      expect(await ctx.valkyriesContract.ownerOf(i)).to.be.eq(
        ctx.user1.address
      );
    }

    expect(
      (await ctx.evolutionContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(evoMinted - burnTokens.length);
  });

  it("should fail to mint 5 valkyrie when burning 10 random selected evo apes", async () => {
    const burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.be.revertedWith("WalletMintLimit");
  });

  it("should fail to mint more than wallet mint limit", async () => {
    let burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(4);

    for (var i = 0; i < burnTokens.length / 2; i++) {
      expect(await ctx.valkyriesContract.ownerOf(i)).to.be.eq(
        ctx.user1.address
      );
    }

    expect(
      (await ctx.evolutionContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(evoMinted - burnTokens.length);

    burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.be.revertedWith("WalletMintLimit");
  });

  it("should fail to mint when minting with non owned tokens", async () => {
    let burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user2).mint(burnTokens)
    ).to.be.revertedWith("NotOwnerOfToken");
  });

  it.skip("WARNING SLOW: should mint all valkyries", async () => {
    const wallets = await Promise.all(
      Array(555)
        .fill(0)
        .map((_) =>
          (async () => {
            return ethers.Wallet.createRandom().connect(ethers.provider);
          })()
        )
    );

    await Promise.all(
      wallets.map((wallet, i) =>
        (async (wallet, i) => {
          await ctx.owner.sendTransaction({
            to: wallet.address,
            value: ethers.utils.parseEther("0.1"),
          });
          await ctx.evolutionContract.safeMintTo(wallet.address, 4);
          await ctx.evolutionContract
            .connect(wallet)
            .setApprovalForAll(ctx.valkyriesContract.address, true);
          const j = i * 4 + 100;

          const burnTokens = [j, j + 1, j + 2, j + 3];

          await expect(
            ctx.valkyriesContract.connect(wallet).mint(burnTokens)
          ).to.emit(ctx.valkyriesContract, "Transfer");
        })(wallet, i)
      )
    );

    const burnTokens = [
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
      evoMintedArray.pop() as number,
    ];

    // Mint
    await expect(
      ctx.valkyriesContract.connect(ctx.user1).mint(burnTokens)
    ).to.be.revertedWith("SoldOut()");
  });
}
