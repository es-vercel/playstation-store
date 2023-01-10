import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const sender = process.env.TWILIO_SENDER
const recipients = process.env.TWILIO_RECIPIENTS

const twilioClient = twilio(accountSid, authToken)

async function twilioApi(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: "missing 'message' property" })
  }

  try {
    const allPromises = []

    for (const recipient of recipients?.split(',')!) {
      const promise = twilioClient.messages.create({
        from: `${sender}`,
        // body: "Siamo su un NFT insieme! 🚀\n\nDai un'occhiata su OpenSea per vederci in azione durante lo spettacolo di Enabling Solutions.\n\nhttps://opensea.io/collection/hesn\n\nIl tuo collega,\nFrancesco Pasqua",
        body: message,
        to: `${recipient}`,
      })

      allPromises.push(promise)
    }

    const ps = await Promise.allSettled(allPromises)
    console.log(ps)

    return res.status(200).send({})
  } catch (error: any) {
    console.log(error)
    return res.status(400).json({ error: error.message })
  }
}

export default twilioApi
