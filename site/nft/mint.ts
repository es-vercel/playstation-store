import { ethers } from 'ethers'

const useMainnet = process.env.USE_MAINNET! === 'true'

const contractAddress = useMainnet
  ? process.env.ALCHEMY_POLYGON_MAINNET_CONTRACT_ADDRESS
  : process.env.ALCHEMY_POLYGON_TESTNET_CONTRACT_ADDRESS

const provider = new ethers.providers.AlchemyProvider(
  useMainnet ? 'matic' : 'maticmum'
)

const Contract = require('./HFarmEnablingSolutionsNFT.json')
const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider)
const contract = new ethers.Contract(contractAddress!, Contract.abi, signer)

const mintNFT = async (tokenUri: string) => {
  const gasPrice = ethers.utils.parseUnits('50', 'gwei')

  const txn = await contract.mintNFT(signer.address, tokenUri, { gasPrice })
  await txn.wait()

  console.log(
    `NFT Minted: ${
      useMainnet
        ? 'https://polygonscan.com/tx/'
        : 'https://mumbai.polygonscan.com/tx/'
    }${txn.hash}`
  )
  console.log('Contract Address:', contractAddress)
  return txn
}

export { mintNFT }
