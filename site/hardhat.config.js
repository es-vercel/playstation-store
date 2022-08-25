// require('dotenv').config({ path: './.env.local' })

require('@nomicfoundation/hardhat-toolbox')

const config = {
  solidity: '0.8.4',
  defaultNetwork: 'testnet',
  networks: {
    hardhat: {},
    testnet: {
      url: process.env.ALCHEMY_POLYGON_TESTNET_API_URL,
      accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
    },
    mainnet: {
      url: process.env.ALCHEMY_POLYGON_MAINNET_API_URL,
      accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
    },
  },
}

module.exports = config
