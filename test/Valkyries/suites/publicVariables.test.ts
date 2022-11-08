import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export default function suite() {
  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });

  it("should get mint supply quantity equal to 1111", async () => {
    expect(await ctx.valkyriesContract.MINT_SUPPLY()).to.eq(
      BigNumber.from(1111)
    );
  });

  it("should get max supply quantity equal to 4444", async () => {
    expect(await ctx.valkyriesContract.MAX_SUPPLY()).to.eq(
      BigNumber.from(4444)
    );
  });

  it("should get mint limit equal to 4", async () => {
    expect(await ctx.valkyriesContract.MAX_MINT()).to.equal(BigNumber.from(4));
  });
}
