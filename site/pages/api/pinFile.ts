import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'
import imageType from 'image-type'
import { fs } from 'memfs'
import path from 'path'
import pinataSdk from '@pinata/sdk'

const pinata = pinataSdk(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
)

async function pinFile(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req
  try {
    if (body.fileUri && typeof body.fileUri === 'string') {
      let fileStream: any

      const remoteFileBuffer = await axios.get(body.fileUri, {
        responseType: 'arraybuffer',
      })

      const itype = await imageType(remoteFileBuffer.data)

      const virtualFilePath = `/${path.basename(body.fileUri)}`
      if (itype?.mime?.includes('image')) {
        const newFileBuffer: Buffer = await sharp(remoteFileBuffer.data)
          .webp()
          .resize({ width: 2160 })
          .toBuffer()

        fs.writeFileSync(virtualFilePath, newFileBuffer)
      } else {
        fs.writeFileSync(virtualFilePath, remoteFileBuffer.data)
      }

      fileStream = fs.createReadStream(virtualFilePath)

      const formData = new FormData()
      formData.append('file', fileStream)

      const result = await pinata.pinFileToIPFS(fileStream)

      return res.status(200).json(result)
    }
    throw new Error('fileUri is not a string')
  } catch (error: any) {
    console.log(error)
    return res.status(400).json({ error: error.message })
  }
}

export default pinFile
