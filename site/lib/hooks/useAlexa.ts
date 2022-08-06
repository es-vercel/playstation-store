import { useEffect, useState } from 'react'

export const useAlexa = () => {
  const [alexa, setAlexa] = useState(null)

  useEffect(() => {
    // @ts-ignore
    Alexa.create({ version: '1.1' })
      .then((args: any) => {
        const { alexa } = args
        setAlexa(alexa)
        console.log('Alexa is ready')
      })
      .catch((error: any) => {
        console.log('Alexa is NOT ready')
      })
  }, [])

  return alexa
}
