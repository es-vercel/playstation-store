import { mintNFT } from '@nft/mint'
import { NextApiRequest, NextApiResponse } from 'next'

async function nft(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req
  try {
    if (body.tokenUri && typeof body.tokenUri === 'string') {
      const txn = await mintNFT(body.tokenUri)
      return res.status(200).json(txn)
    }
    throw new Error('tokenUri is not a string')
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export default nft
