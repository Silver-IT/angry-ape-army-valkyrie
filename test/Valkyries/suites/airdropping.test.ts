import { expect } from "chai";
import { randomBytes } from "crypto";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import signMintRequest from "../../utils/signMintRequest";

export default function suite() {
  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });
  let quantity: number;
  beforeEach(async function () {
    // Default mints
    quantity = await ctx.valkyriesContract.MAX_SUPPLY();
  });

  it("should mint 20 airdropped from owner to user1", async () => {
    const quantity = 20;
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [quantity])
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(quantity);

    for (var i = 0; i < quantity; i++) {
      expect(await ctx.valkyriesContract.ownerOf(i)).to.be.eq(
        ctx.user1.address
      );
    }
  });

  it("should mint all tokens from owner to user1", async () => {
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [quantity])
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(quantity);
  });

  it("should fail to mint from user1", async () => {
    await expect(
      ctx.valkyriesContract
        .connect(ctx.user1)
        .airdrop([ctx.user1.address], [quantity])
    ).to.be.revertedWith("NotAdminOrOwner()");
  });

  it("should mint max supply", async () => {
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [quantity])
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(quantity);

    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [1])
    ).to.be.revertedWith("SoldOut");
  });

  it("should not mint more than max supply", async () => {
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [quantity + 1])
    ).to.be.revertedWith("SoldOut");
  });

  it("should mint tokens from owner to users 1-8", async () => {
    const quantity = 40;
    const wallets = [
      ctx.user1.address,
      ctx.user2.address,
      ctx.user3.address,
      ctx.user4.address,
      ctx.user5.address,
      ctx.user6.address,
      ctx.user7.address,
      ctx.user8.address,
    ];
    await expect(
      ctx.valkyriesContract.airdrop(
        wallets,
        new Array(wallets.length).fill(quantity)
      )
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(quantity);

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user8.address)).toNumber()
    ).to.be.eq(quantity);

    expect((await ctx.valkyriesContract.totalSupply()).toNumber()).to.be.eq(
      quantity * wallets.length
    );
  });

  it("should not mint because array lengths are different", async () => {
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [1, 2])
    ).to.be.revertedWith("ArrayLengthMismatch");
  });

  it("should not mint because arrays are empty", async () => {
    await expect(ctx.valkyriesContract.airdrop([], [])).to.be.revertedWith(
      "MustMintMinimumOne"
    );
  });

  it("should mint all tokens from owner to users 1-8", async () => {
    const wallets = [
      ctx.user1.address,
      ctx.user2.address,
      ctx.user3.address,
      ctx.user4.address,
    ];

    quantity = quantity / wallets.length;

    await expect(
      ctx.valkyriesContract.airdrop(
        wallets,
        new Array(wallets.length).fill(quantity)
      )
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user1.address)).toNumber()
    ).to.be.eq(quantity);

    expect(
      (await ctx.valkyriesContract.balanceOf(ctx.user4.address)).toNumber()
    ).to.be.eq(quantity);

    expect((await ctx.valkyriesContract.totalSupply()).toNumber()).to.be.eq(
      quantity * wallets.length
    );
  });

  it.skip("try to find <2 million gas per transaction", async () => {
    const wallets = new Array(33)
      .fill("")
      .map(
        (_) => ethers.Wallet.createRandom().connect(ethers.provider).address
      );

    quantity = 4;

    await expect(
      ctx.valkyriesContract.airdrop(
        wallets,
        new Array(wallets.length).fill(quantity)
      )
    ).to.emit(ctx.valkyriesContract, "Transfer");
  });
}
