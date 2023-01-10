import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import nodemailer from 'nodemailer'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const smsSender = process.env.TWILIO_SENDER
const smsRecipients = process.env.TWILIO_RECIPIENTS
const emailSender = process.env.EMAIL_SENDER
const emailSenderPass = process.env.EMAIL_SENDER_PASS
const emailRecipients = process.env.EMAIL_RECIPIENTS

const twilioClient = twilio(accountSid, authToken)

async function twilioApi(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: "missing 'message' property" })
  }

  try {
    const allPromisesForSms = []
    for (const smsRecipient of smsRecipients?.split(',')!) {
      const promise = twilioClient.messages.create({
        from: `${smsSender}`,
        // body: "Siamo su un NFT insieme! 🚀\n\nDai un'occhiata su OpenSea per vederci in azione durante lo spettacolo di Enabling Solutions.\n\nhttps://opensea.io/collection/hesn\n\nIl tuo collega,\nFrancesco Pasqua",
        body: message,
        to: `${smsRecipient}`,
      })

      allPromisesForSms.push(promise)
    }
    const psForSms = await Promise.allSettled(allPromisesForSms)
    console.log(psForSms)

    const allPromisesForEmail = []
    for (const emailRecipient of emailRecipients?.split(',')!) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailSender,
          pass: emailSenderPass,
        },
      })

      const promise = transporter.sendMail({
        from: '"Francesco Pasqua" <francesco.pasqua@h-farm.com>',
        to: emailRecipient,
        subject: 'NFT from Nakamoto Program',
        text: message,
        html: message.split('\n').join('<br>') + '<br>',
      })

      allPromisesForEmail.push(promise)
    }
    const psForEmail = await Promise.allSettled(allPromisesForEmail)
    console.log(psForEmail)

    return res.status(200).send({})
  } catch (error: any) {
    console.log(error)
    return res.status(400).json({ error: error.message })
  }
}

export default twilioApi
