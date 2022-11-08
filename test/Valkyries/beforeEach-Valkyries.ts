beforeEach(async function () {
  const ctx = this.test?.ctx;
  if (!ctx) return;

  const evolutionContractFactory = await this.evolutionContractFactory.deploy();
  this.evolutionContract = await evolutionContractFactory.deployed();

  // const rrContract = await this.rrContractFactory.deploy();
  // this.rrContract = await rrContract.deployed();

  const valkyriesContractFactory = await ctx.valkyriesContractFactory.deploy(
    ctx.admin.address,
    ctx.owner.address, // Royalty Reciever
    ctx.evolutionContract.address,
    [ctx.user8.address, ctx.user9.address]
  );
  this.valkyriesContract = await valkyriesContractFactory.deployed();

  // const brokenWallet = await this.brokenWalletFactory.deploy();
  // this.brokenWallet = await brokenWallet.deployed();
});
