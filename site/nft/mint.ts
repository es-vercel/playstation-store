import { ethers } from 'ethers'

const useMainnet = process.env.USE_MAINNET! === 'true'

const contractAddress = useMainnet
  ? process.env.ALCHEMY_POLYGON_MAINNET_CONTRACT_ADDRESS
  : process.env.ALCHEMY_POLYGON_TESTNET_CONTRACT_ADDRESS

const alchemyApiKey = useMainnet
  ? process.env.ALCHEMY_POLYGON_MAINNET_API_KEY
  : process.env.ALCHEMY_POLYGON_TESTNET_API_KEY

const provider = new ethers.providers.AlchemyProvider(
  useMainnet ? 'matic' : 'maticmum',
  alchemyApiKey
)

const Contract = require('./HFarmEnablingSolutionsNFT.json')
const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider)
const contract = new ethers.Contract(contractAddress!, Contract.abi, signer)

const mintNFT = async (tokenUri: string) => {
  const gasPrice = ethers.utils.parseUnits('60', 'gwei')

  const txResponse = await contract.mintNFT(signer.address, tokenUri, {
    gasPrice,
  })
  const txReceipt = await txResponse.wait()
  const tokenId = txReceipt.events[0].args.tokenId.toString()

  const openseaLink = useMainnet
    ? `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`
    : `https://testnets.opensea.io/assets/mumbai/${contractAddress}/${tokenId}`

  console.log(
    `NFT Minted: ${
      useMainnet
        ? 'https://polygonscan.com/tx/'
        : 'https://mumbai.polygonscan.com/tx/'
    }${txResponse.hash}`
  )

  console.log('Contract Address:', contractAddress)

  return {
    hash: txResponse.hash,
    openseaLink,
  }
}

export { mintNFT }
