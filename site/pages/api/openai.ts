import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
})

async function openai(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req
  try {
    const openai = new OpenAIApi(configuration)
    const { data } = await openai.createCompletion(body)
    return res.status(200).send(data)
  } catch (error: any) {
    console.log(error)
    return res.status(400).json({ error: error.message })
  }
}

export default openai
