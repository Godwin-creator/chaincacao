const { expect }  = require("chai");
const { ethers }  = require("hardhat");

describe("ChainCacao", function () {
  let contract;
  let admin, farmer, collector, stranger;

  beforeEach(async function () {
    [admin, farmer, collector, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ChainCacao");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ─── registerActor ────────────────────────────────────────────────────────

  describe("registerActor", function () {
    it("admin registers an actor successfully", async function () {
      await contract.registerActor(farmer.address, "FARMER", "Kouamé Yao");
      const actor = await contract.getActor(farmer.address);
      expect(actor.role).to.equal("FARMER");
      expect(actor.name).to.equal("Kouamé Yao");
      expect(actor.registered).to.be.true;
    });

    it("emits ActorRegistered", async function () {
      await expect(
        contract.registerActor(farmer.address, "FARMER", "Kouamé Yao")
      )
        .to.emit(contract, "ActorRegistered")
        .withArgs(farmer.address, "FARMER");
    });

    it("reverts when called by non-admin", async function () {
      await expect(
        contract.connect(stranger).registerActor(farmer.address, "FARMER", "X")
      ).to.be.revertedWith("ChainCacao: not admin");
    });
  });

  // ─── createLot ────────────────────────────────────────────────────────────

  describe("createLot", function () {
    beforeEach(async function () {
      await contract.registerActor(farmer.address, "FARMER", "Kouamé Yao");
    });

    it("registered farmer creates lot with id 0", async function () {
      const tx      = await contract.connect(farmer).createLot("5.3600", "4.0083", 500, "Forastero", 1746057600);
      const receipt = await tx.wait();
      const log     = receipt.logs.find(
        (l) => contract.interface.parseLog(l)?.name === "LotCreated"
      );
      const parsed  = contract.interface.parseLog(log);
      expect(parsed.args.lotId).to.equal(0n);
      expect(parsed.args.farmer).to.equal(farmer.address);
    });

    it("lot IDs increment across callers", async function () {
      await contract.registerActor(collector.address, "COLLECTOR", "Coop");

      const r1 = await (await contract.connect(farmer).createLot("1", "2", 100, "Criollo",    1746057600)).wait();
      const r2 = await (await contract.connect(collector).createLot("3", "4", 200, "Trinitario", 1746057600)).wait();

      const id = (receipt) =>
        contract.interface.parseLog(
          receipt.logs.find((l) => contract.interface.parseLog(l)?.name === "LotCreated")
        ).args.lotId;

      expect(id(r1)).to.equal(0n);
      expect(id(r2)).to.equal(1n);
    });

    it("unregistered address cannot create lot", async function () {
      await expect(
        contract.connect(stranger).createLot("1", "2", 100, "X", 1746057600)
      ).to.be.revertedWith("ChainCacao: not registered");
    });
  });

  // ─── getLot ───────────────────────────────────────────────────────────────

  describe("getLot", function () {
    it("returns correct lot data", async function () {
      await contract.registerActor(farmer.address, "FARMER", "Kouamé");
      await contract.connect(farmer).createLot("5.36", "4.00", 300, "Forastero", 1746057600);

      const lot = await contract.getLot(0);
      expect(lot.id).to.equal(0n);
      expect(lot.farmer).to.equal(farmer.address);
      expect(lot.gpsLat).to.equal("5.36");
      expect(lot.gpsLng).to.equal("4.00");
      expect(lot.weightKg).to.equal(300n);
      expect(lot.species).to.equal("Forastero");
      expect(lot.harvestDate).to.equal(1746057600n);
      expect(lot.currentOwner).to.equal(farmer.address);
    });

    it("reverts for non-existent lot id", async function () {
      await expect(contract.getLot(99)).to.be.revertedWith("ChainCacao: lot does not exist");
    });
  });

  // ─── transferLot ──────────────────────────────────────────────────────────

  describe("transferLot", function () {
    beforeEach(async function () {
      await contract.registerActor(farmer.address,    "FARMER",    "Kouamé");
      await contract.registerActor(collector.address, "COLLECTOR", "Coop");
      await contract.connect(farmer).createLot("5.36", "4.00", 300, "Forastero", 1746057600);
    });

    it("owner transfers lot to registered collector", async function () {
      await contract.connect(farmer).transferLot(0, collector.address, "Livraison Yamoussoukro");
      const lot = await contract.getLot(0);
      expect(lot.currentOwner).to.equal(collector.address);
    });

    it("emits LotTransferred with correct args", async function () {
      await expect(
        contract.connect(farmer).transferLot(0, collector.address, "Notes")
      )
        .to.emit(contract, "LotTransferred")
        .withArgs(0n, farmer.address, collector.address);
    });

    it("records transfer in history", async function () {
      await contract.connect(farmer).transferLot(0, collector.address, "Colis reçu");
      const history = await contract.getLotHistory(0);
      expect(history.length).to.equal(1);
      expect(history[0].fromActor).to.equal(farmer.address);
      expect(history[0].toActor).to.equal(collector.address);
      expect(history[0].notes).to.equal("Colis reçu");
      expect(history[0].timestamp).to.be.gt(0n);
    });

    it("accumulates multiple transfers", async function () {
      await contract.connect(farmer).transferLot(0, collector.address, "Step 1");
      await contract.connect(collector).transferLot(0, farmer.address,  "Step 2");
      const history = await contract.getLotHistory(0);
      expect(history.length).to.equal(2);
    });

    it("non-owner cannot transfer", async function () {
      await expect(
        contract.connect(collector).transferLot(0, farmer.address, "x")
      ).to.be.revertedWith("ChainCacao: not owner");
    });

    it("cannot transfer to unregistered address", async function () {
      await expect(
        contract.connect(farmer).transferLot(0, stranger.address, "x")
      ).to.be.revertedWith("ChainCacao: recipient not registered");
    });

    it("reverts for non-existent lot", async function () {
      await expect(
        contract.connect(farmer).transferLot(99, collector.address, "x")
      ).to.be.revertedWith("ChainCacao: lot does not exist");
    });
  });

  // ─── getLotHistory ────────────────────────────────────────────────────────

  describe("getLotHistory", function () {
    it("returns empty array for fresh lot", async function () {
      await contract.registerActor(farmer.address, "FARMER", "Kouamé");
      await contract.connect(farmer).createLot("5.36", "4.00", 300, "Forastero", 1746057600);
      const history = await contract.getLotHistory(0);
      expect(history.length).to.equal(0);
    });

    it("reverts for non-existent lot", async function () {
      await expect(contract.getLotHistory(99)).to.be.revertedWith("ChainCacao: lot does not exist");
    });
  });
});
