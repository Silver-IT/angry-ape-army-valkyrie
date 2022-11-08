import { expect } from "chai";
import { ethers } from "hardhat";

export default function suite() {
  const NOT_STARTED = 0;
  const ACTIVE = 1;
  const PAUSED = 2;
  const FINISHED = 3;

  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });

  it("should end sale after mint", async () => {
    await expect(ctx.valkyriesContract.endMint()).to.be.revertedWith(
      "NoActiveSale"
    );

    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );

    await expect(ctx.valkyriesContract.endMint()).to.emit(
      ctx.valkyriesContract,
      "MintEnds"
    );
  });

  it("end sale no longer allows change of sale state", async () => {
    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );

    await expect(ctx.valkyriesContract.endMint()).to.emit(
      ctx.valkyriesContract,
      "MintEnds"
    );

    await expect(ctx.valkyriesContract.startMint()).to.be.revertedWith(
      "AllSalesFinished"
    );

    await expect(ctx.valkyriesContract.endMint()).to.be.revertedWith(
      "NoActiveSale"
    );
  });

  it("should set correct values for each sale state", async () => {
    expect(await ctx.valkyriesContract.getSaleType()).to.eql("None");

    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );
    expect(await ctx.valkyriesContract.getSaleType()).to.be.eql("Mint");

    await expect(ctx.valkyriesContract.endMint()).to.emit(
      ctx.valkyriesContract,
      "MintEnds"
    );
    expect(await ctx.valkyriesContract.getSaleType()).to.be.eql("Finished");
    expect(await ctx.valkyriesContract.getSaleState()).to.be.eql(FINISHED);
  });

  it("pauses a sale state", async () => {
    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );
    await expect(ctx.valkyriesContract.pauseMint()).to.not.be.reverted;
    expect(await ctx.valkyriesContract.getSaleState()).to.be.eql(PAUSED);
  });

  it("unpauses a paused sale state", async () => {
    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );
    await expect(ctx.valkyriesContract.pauseMint()).to.not.be.reverted;
    expect(await ctx.valkyriesContract.getSaleState()).to.be.eql(PAUSED);
    expect(await ctx.valkyriesContract.getSaleType()).to.be.eql("Mint");
    await expect(ctx.valkyriesContract.unpauseMint()).to.not.be.reverted;
    expect(await ctx.valkyriesContract.getSaleState()).to.be.eql(ACTIVE);
    expect(await ctx.valkyriesContract.getSaleType()).to.be.eql("Mint");
  });

  it("can not pause a paused sale state", async () => {
    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );
    await expect(ctx.valkyriesContract.pauseMint()).to.not.be.reverted;
    await expect(ctx.valkyriesContract.pauseMint()).to.be.revertedWith(
      "NoActiveSale"
    );
  });

  it("can not unpause an active sale state", async () => {
    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );

    await expect(ctx.valkyriesContract.unpauseMint()).to.be.revertedWith(
      "NoPausedSale"
    );
  });

  it("can not change pause state when no sale active", async () => {
    await expect(ctx.valkyriesContract.pauseMint()).to.be.revertedWith(
      "NoActiveSale"
    );
    await expect(ctx.valkyriesContract.unpauseMint()).to.be.revertedWith(
      "NoPausedSale"
    );

    await expect(ctx.valkyriesContract.startMint()).to.emit(
      ctx.valkyriesContract,
      "MintBegins"
    );
    await expect(ctx.valkyriesContract.endMint()).to.emit(
      ctx.valkyriesContract,
      "MintEnds"
    );

    await expect(ctx.valkyriesContract.pauseMint()).to.be.revertedWith(
      "NoActiveSale"
    );
    await expect(ctx.valkyriesContract.unpauseMint()).to.be.revertedWith(
      "NoPausedSale"
    );
  });
  describe("moderator permissions", async () => {
    beforeEach(async () => {
      const modRole = await ctx.valkyriesContract.MODERATOR_ROLE();
      expect(
        ctx.valkyriesContract
          .connect(ctx.admin)
          .grantRole(modRole, ctx.mod.address)
      );
    });
    it("can start mint", async () => {
      await expect(ctx.valkyriesContract.connect(ctx.mod).startMint()).to.emit(
        ctx.valkyriesContract,
        "MintBegins"
      );
    });
    it("can pause minting", async () => {
      await expect(ctx.valkyriesContract.connect(ctx.mod).startMint()).to.emit(
        ctx.valkyriesContract,
        "MintBegins"
      );
      await expect(ctx.valkyriesContract.connect(ctx.mod).pauseMint()).to.not.be
        .reverted;
    });

    it("can unpause minting", async () => {
      await expect(ctx.valkyriesContract.connect(ctx.mod).startMint()).to.emit(
        ctx.valkyriesContract,
        "MintBegins"
      );
      await expect(ctx.valkyriesContract.connect(ctx.mod).pauseMint()).to.not.be
        .reverted;
      await expect(ctx.valkyriesContract.connect(ctx.mod).unpauseMint()).to.not
        .be.reverted;
    });

    it("fails to start mint due to permissions", async () => {
      await expect(
        ctx.valkyriesContract.connect(ctx.user1).startMint()
      ).to.be.revertedWith("NotAdminOrModerator");
    });
    it("fails to end minting", async () => {
      await expect(ctx.valkyriesContract.connect(ctx.mod).startMint()).to.emit(
        ctx.valkyriesContract,
        "MintBegins"
      );
      await expect(
        ctx.valkyriesContract.connect(ctx.user1).endMint()
      ).to.be.revertedWith("NotAdminOrOwner");
    });
  });
}
