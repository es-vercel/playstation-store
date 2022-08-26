import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

async function pinJSON(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: req.body.name,
      },
      pinataContent: req.body.content,
    })

    const pinata = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_API_TOKEN}`,
      },
      data,
    })

    return res.status(200).json(pinata.data)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export default pinJSON
