import '@nomicfoundation/hardhat-toolbox' // isolatedModule
import { ethers } from 'hardhat' // isolatedModule

// require('@nomicfoundation/hardhat-toolbox')
// const { ethers } = require('hardhat')

async function main() {
  console.log('Is Polygon Mainnet?', process.env.USE_MAINNET)

  const Contract = await ethers.getContractFactory('HFarmEnablingSolutionsNFT')
  const contract = await Contract.deploy()

  const [deployer] = await ethers.getSigners()
  console.log('Account balance:', (await deployer.getBalance()).toString())
  console.log('Contract deployed to address:', contract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
