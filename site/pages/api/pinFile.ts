import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import FormData from 'form-data'

async function pinFile(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req
  try {
    if (body.fileUri && typeof body.fileUri === 'string') {
      const remoteFileStream = await axios.get(body.fileUri, {
        responseType: 'stream',
      })

      const formData = new FormData()
      formData.append('file', remoteFileStream.data)

      const pinata = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        headers: {
          Authorization: `Bearer ${process.env.PINATA_API_TOKEN}`,
          ...formData.getHeaders(),
        },
        data: formData,
      })

      return res.status(200).json(pinata.data)
    }
    throw new Error('fileUri is not a string')
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export default pinFile
