async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const GKT = await ethers.getContractFactory("GrokKarmaToken");
  const gkt = await GKT.deploy();
  await gkt.deployed();

  console.log("GKT deployed to:", gkt.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
