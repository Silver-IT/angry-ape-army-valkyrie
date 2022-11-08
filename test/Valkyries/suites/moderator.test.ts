import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";
import { ethers } from "hardhat";
import keccak256 from "keccak256";

export default function suite() {
  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });

  const DEFAULT_ADMIN_ROLE =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

  it("should transfer ownership", async () => {
    expect(
      await ctx.valkyriesContract.hasRole(DEFAULT_ADMIN_ROLE, ctx.owner.address)
    ).to.eq(true);
    await expect(
      ctx.valkyriesContract.transferOwnership(ctx.approved.address)
    ).to.emit(ctx.valkyriesContract, "OwnershipTransferred");
    expect(
      await ctx.valkyriesContract.hasRole(
        DEFAULT_ADMIN_ROLE,
        ctx.approved.address
      )
    ).to.eq(true);
    expect(
      await ctx.valkyriesContract.hasRole(DEFAULT_ADMIN_ROLE, ctx.owner.address)
    ).to.eq(false);
  });

  it("should grant role after ownership transfer", async () => {
    await expect(
      ctx.valkyriesContract.transferOwnership(ctx.approved.address)
    ).to.emit(ctx.valkyriesContract, "OwnershipTransferred");

    expect(
      await ctx.valkyriesContract
        .connect(ctx.approved)
        .grantRole(MODERATOR_ROLE, ctx.user1.address)
    ).to.emit(ctx.valkyriesContract, "RoleGranted");

    await expect(
      ctx.valkyriesContract
        .connect(ctx.user1)
        .setBaseURI("ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/")
    ).to.emit(ctx.valkyriesContract, "SetBaseURI");

    expect(
      await ctx.valkyriesContract
        .connect(ctx.approved)
        .revokeRole(MODERATOR_ROLE, ctx.user1.address)
    ).to.emit(ctx.valkyriesContract, "RoleRevoked");

    await expect(
      ctx.valkyriesContract
        .connect(ctx.user1)
        .setBaseURI("ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/")
    ).to.be.revertedWith("NotAdminOrModerator");
  });
}
