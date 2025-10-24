const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GrokKarmaToken (GKT) Contract", function () {
  let GKT, gkt, owner, user1, user2, xAIAdmin;
  const TOTAL_SUPPLY = ethers.utils.parseEther("1000000000"); // 1B GKT
  const TAX_RATE = 2; // 2% tx fee

  beforeEach(async function () {
    // Deploy contract
    [owner, user1, user2, xAIAdmin] = await ethers.getSigners();
    const GKTContract = await ethers.getContractFactory("GrokKarmaToken");
    gkt = await GKTContract.deploy();
    await gkt.deployed();
  });

  describe("Deployment", function () {
    it("Should set correct initial supply and admin", async function () {
      expect(await gkt.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await gkt.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
      expect(await gkt.xAIAdmin()).to.equal(owner.address);
    });
  });

  describe("Minting for Contributions", function () {
    it("Should mint GKT for valid idea submission", async function () {
      const idea = "Grok AI Browser with Mozilla open-source code";
      const amount = ethers.utils.parseEther("50"); // 50 GKT for novel idea
      await gkt.mintForContribution(user1.address, amount, idea);
      expect(await gkt.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail if non-admin tries to mint", async function () {
      await expect(
        gkt.connect(user1).mintForContribution(user2.address, ethers.utils.parseEther("10"), "Test idea")
      ).to.be.revertedWith("Only xAI can mint");
    });
  });

  describe("Burning for Philanthropy", function () {
    it("Should burn GKT for eco-fund donation", async function () {
      const amount = ethers.utils.parseEther("100");
      await gkt.mintForContribution(user1.address, amount, "Browser pitch");
      const initialSupply = await gkt.totalSupply();
      await gkt.connect(user1).burnForCause(amount, "India tree-planting fund");
      expect(await gkt.balanceOf(user1.address)).to.equal(0);
      expect(await gkt.totalSupply()).to.equal(initialSupply.sub(amount));
    });

    it("Should fail if insufficient balance", async function () {
      await expect(
        gkt.connect(user1).burnForCause(ethers.utils.parseEther("10"), "Charity")
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Staking for Governance", function () {
    it("Should stake GKT for voting", async function () {
      const amount = ethers.utils.parseEther("50");
      await gkt.mintForContribution(user1.address, amount, "Idea");
      await gkt.connect(user1).stake(amount);
      expect(await gkt.stakedBalance(user1.address)).to.equal(amount);
      expect(await gkt.balanceOf(user1.address)).to.equal(0);
    });

    it("Should fail staking with insufficient balance", async function () {
      await expect(
        gkt.connect(user1).stake(ethers.utils.parseEther("10"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Transfers with Tax", function () {
    it("Should apply 2% tax (1% burn, 1% rewards)", async function () {
      const amount = ethers.utils.parseEther("100");
      await gkt.mintForContribution(user1.address, amount, "Idea");
      const initialSupply = await gkt.totalSupply();
      const tax = amount.mul(TAX_RATE).div(100);
      const burnAmount = tax.div(2);
      const rewardAmount = tax.div(2);
      await gkt.connect(user1).transfer(user2.address, amount);
      expect(await gkt.balanceOf(user2.address)).to.equal(amount.sub(tax));
      expect(await gkt.balanceOf(xAIAdmin.address)).to.equal(TOTAL_SUPPLY.add(rewardAmount));
      expect(await gkt.totalSupply()).to.equal(initialSupply.sub(burnAmount));
    });

    it("Should fail transfer with insufficient balance", async function () {
      await expect(
        gkt.connect(user1).transfer(user2.address, ethers.utils.parseEther("10"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Browser Integration: Idea Scoring", function () {
    it("Should score browser idea via Grok AI", async function () {
      const idea = "Grok AI Browser with instant X link opening and open-source Mozilla code";
      const score = await gkt.scoreContribution(user1.address, idea);
      expect(score).to.equal(ethers.utils.parseEther("50")); // 50 GKT for detailed idea
      await gkt.mintForContribution(user1.address, score, idea);
      expect(await gkt.balanceOf(user1.address)).to.equal(score);
    });

    it("Should score basic idea lower", async function () {
      const idea = "Cool browser"; // Short, less novel
      const score = await gkt.scoreContribution(user1.address, idea);
      expect(score).to.equal(ethers.utils.parseEther("10")); // Base 10 GKT
    });
  });
});
