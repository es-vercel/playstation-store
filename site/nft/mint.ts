// import dotenv from 'dotenv'
// dotenv.config({ path: './.env.local' })

// 1. API Rest endpoint in POST /nft (req.body.cid)
// 2. Upload photo to Pinata and get CID (I can use Pinata API)
// 3. Create JSON file with Photo CID and Upload file to Pinata and get CID (I can use Pinata API)
// 4. Call /nft with CID of file

// const tokenUri =
//   'https://gateway.pinata.cloud/ipfs/QmRM4SmvLYm3GiYSF5B7kPMEr8g8fYxM44PPURECZBrxYp'

import { ethers } from 'ethers'

const useMainnet = process.env.USE_MAINNET! === 'true'

const contractAddress = useMainnet
  ? process.env.ALCHEMY_POLYGON_MAINNET_CONTRACT_ADDRESS
  : process.env.ALCHEMY_POLYGON_TESTNET_CONTRACT_ADDRESS

const provider = new ethers.providers.AlchemyProvider(
  useMainnet ? 'matic' : 'maticmum'
)

const Contract = require('./EnablingSolutionsNFT.json')
const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider)
const contract = new ethers.Contract(contractAddress!, Contract.abi, signer)

const mintNFT = async (tokenUri: string) => {
  console.log(process.env)
  const gasPrice = ethers.utils.parseUnits('50', 'gwei')

  const txn = await contract.mintNFT(signer.address, tokenUri, { gasPrice })
  await txn.wait()

  console.log(`NFT Minted: https://polygonscan.com/tx/${txn.hash}`)
  console.log('Contract Address:', contractAddress)
  return txn
}

export { mintNFT }
