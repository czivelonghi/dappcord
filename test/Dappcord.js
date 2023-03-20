const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Dappcord", function () {
  let deployer, user
  let dappcord
  const NAME = "Dappcord"
  const SYMBOL = "DC"

  beforeEach(async() =>{
    [deployer, user] = await ethers.getSigners() // all hardhat tests

    //deploy contract
    const Dappcord = await ethers.getContractFactory("Dappcord")
    dappcord = await Dappcord.deploy(NAME, SYMBOL)

    //create channel
    const transaction = await dappcord.connect(deployer).createChannel("general", tokens(1))
    await transaction.wait()
  })

  describe("Deployment", function(){
    it("Sets the name", async () =>{
      let result = await dappcord.name()
      expect(result).to.equal(NAME)
    })

    it("Sets the symbol", async () =>{
      let result = await dappcord.symbol()
      expect(result).to.equal(SYMBOL)
    })

    it("Sets the owner", async () =>{
      let result = await dappcord.owner()
      expect(result).to.equal(deployer.address)
    })

  })

  describe("Creating channels", () =>{
    it("Returns total channels", async() =>{
      const result = await dappcord.totalChannels()
      console.log(result)
      expect(result).to.be.equal(1)
    })

    it("Returns total channel attributes", async() =>{
      const result = await dappcord.getChannel(1)
      expect(result.id).to.be.equal(1)
      expect(result.name).to.be.equal("general")
      expect(result.cost).to.be.equal(tokens(1))
    })
  })

  describe("Joining channels", () =>{
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("1", "ether")

    beforeEach(async() =>{ 
      const transaction = await dappcord.connect(user).mint(ID, {value: AMOUNT})
      await transaction.wait()
    })

    it("Joins the user", async () =>{
      const result = await dappcord.hasJoined(ID, user.address)
      expect(result).to.equal(true)
    })

    it("Increase supply", async () =>{
      const result = await dappcord.totalSupply()
      expect(result).to.equal(ID)
    })

    it("Updates contract balance", async () =>{
      const result = await ethers.provider.getBalance(dappcord.address)
      expect(result).to.equal(AMOUNT)
    })
  })

  describe("Withdrawing", () =>{
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", "ether")
    let balanceBefore

    beforeEach(async() =>{ 
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await dappcord.connect(user).mint(ID, {value: AMOUNT})
      await transaction.wait()

      transaction = await dappcord.connect(deployer).withdraw()
      await transaction.wait()
    })

    it("Updates owners balance", async () =>{
      const balanceAfter =  await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it("Updates the contract balance", async () =>{
      const result = await ethers.provider.getBalance(dappcord.address)
      expect(result).to.equal(0)
    })
  })

})
