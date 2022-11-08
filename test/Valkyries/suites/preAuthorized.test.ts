import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export default function suite() {
  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });

  it("should burn a token because it's called by a pre authorized user", async () => {
    const quantity = 10;
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

    await expect(ctx.valkyriesContract.connect(ctx.user7).burn(5)).to.be
      .reverted;

    await expect(ctx.valkyriesContract.connect(ctx.user8).burn(5)).to.emit(
      ctx.valkyriesContract,
      "Transfer"
    );

    expect((await ctx.valkyriesContract.totalSupply()).toNumber()).to.be.eq(
      quantity - 1
    );

    await expect(ctx.valkyriesContract.connect(ctx.user9).burn(6)).to.emit(
      ctx.valkyriesContract,
      "Transfer"
    );

    expect((await ctx.valkyriesContract.totalSupply()).toNumber()).to.be.eq(
      quantity - 2
    );
  });

  it("should set new authorized address by admin or owner", async () => {
    const quantity = 10;
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [quantity])
    ).to.emit(ctx.valkyriesContract, "Transfer");

    await expect(ctx.valkyriesContract.connect(ctx.user7).burn(5)).to.be
      .reverted;

    await expect(
      ctx.valkyriesContract
        .connect(ctx.mod)
        .setAuthorizedAddress(ctx.user7.address, true)
    ).to.be.revertedWith("NotAdminOrOwner()");

    await expect(
      ctx.valkyriesContract.setAuthorizedAddress(ctx.user7.address, true)
    ).to.not.be.reverted;

    await expect(ctx.valkyriesContract.connect(ctx.user7).burn(5)).to.emit(
      ctx.valkyriesContract,
      "Transfer"
    );

    await expect(
      ctx.valkyriesContract
        .connect(ctx.admin)
        .setAuthorizedAddress(ctx.user6.address, true)
    ).to.not.be.reverted;

    await expect(ctx.valkyriesContract.connect(ctx.user6).burn(6)).to.emit(
      ctx.valkyriesContract,
      "Transfer"
    );

    expect((await ctx.valkyriesContract.totalSupply()).toNumber()).to.be.eq(
      quantity - 2
    );
  });
}
