const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  const NAME = "Dappcord"
  const SYMBOL = "DC"
  
  const [deployer] = await ethers.getSigners() // all hardhat tests

  //deploy contract
  const Dappcord = await ethers.getContractFactory("Dappcord")
  const dappcord = await Dappcord.deploy(NAME, SYMBOL)

  //wait for deployment to finish
  await dappcord.deployed()

  console.log(`Deployed contract at: ${dappcord.address}\n`)

  //create three channels
  const CHANNEL_NAMES = ["general", "intro", "jobs"];
  const COSTS = [tokens(1), tokens(0), tokens(0.25)]

  for(var i = 0; i < 3; i++){
    const transaction = await dappcord.connect(deployer).createChannel(CHANNEL_NAMES[i], COSTS[i])
    await transaction.wait()

    console.log(`Created text channel #${CHANNEL_NAMES[i]}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});