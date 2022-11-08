import { expect } from "chai";

export default function suite() {
  let ctx: Mocha.Context;
  before(function () {
    const context = this.test?.ctx;
    if (context) ctx = context;
  });

  it("should set the baseURI", async () => {
    await expect(
      ctx.valkyriesContract.setBaseURI(
        "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/"
      )
    ).to.emit(ctx.valkyriesContract, "SetBaseURI");
  });

  it("should fail to set the baseURI", async () => {
    await expect(
      ctx.valkyriesContract
        .connect(ctx.user1)
        .setBaseURI("ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/")
    ).to.be.revertedWith("NotAdminOrModerator");
  });

  it("should fail to set the baseURI because trailing slash is not set", async () => {
    await expect(
      ctx.valkyriesContract.setBaseURI(
        "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu"
      )
    ).to.be.revertedWith("NoTrailingSlash");
  });

  it("should fail to retrieve tokenURI", async () => {
    await expect(
      ctx.valkyriesContract.connect(ctx.user2).tokenURI(1)
    ).to.be.revertedWith("URIQueryForNonexistentToken()");
  });

  it("should retrieve correct default tokenURI", async () => {
    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [1])
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(await ctx.valkyriesContract.connect(ctx.user2).tokenURI(0)).to.equal(
      `https://api.massless.io/token/${0}.json`
    );
  });

  it("should retrieve correct updated tokenURI", async () => {
    await expect(
      ctx.valkyriesContract.setBaseURI(
        "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/"
      )
    ).to.emit(ctx.valkyriesContract, "SetBaseURI");

    await expect(
      ctx.valkyriesContract.airdrop([ctx.user1.address], [10])
    ).to.emit(ctx.valkyriesContract, "Transfer");

    expect(await ctx.valkyriesContract.connect(ctx.user2).tokenURI(0)).to.equal(
      `ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/token/${0}.json`
    );

    expect(await ctx.valkyriesContract.connect(ctx.user2).tokenURI(1)).to.equal(
      `ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/token/${1}.json`
    );
  });

  it("should retrieve correct default contractURI", async () => {
    expect(
      await ctx.valkyriesContract.connect(ctx.user2).contractURI()
    ).to.equal(`https://api.massless.io/contract.json`);
  });

  it("should retrieve correctly updated contractURI", async () => {
    await expect(
      ctx.valkyriesContract.setBaseURI(
        "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/"
      )
    ).to.emit(ctx.valkyriesContract, "SetBaseURI");

    expect(
      await ctx.valkyriesContract.connect(ctx.user2).contractURI()
    ).to.equal(
      `ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/contract.json`
    );
  });

  describe("moderator permissions", async () => {
    it("moderator can set Base URI", async () => {
      const modRole = await ctx.valkyriesContract.MODERATOR_ROLE();
      expect(
        ctx.valkyriesContract
          .connect(ctx.admin)
          .grantRole(modRole, ctx.mod.address)
      );
      await expect(
        ctx.valkyriesContract
          .connect(ctx.mod)
          .setBaseURI("ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu/")
      ).to.emit(ctx.valkyriesContract, "SetBaseURI");
    });
  });
}
