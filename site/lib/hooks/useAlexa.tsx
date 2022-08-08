import { useRouter } from 'next/router'
import React, { useEffect, useState, useContext, createContext } from 'react'
import qs from 'qs'

const AlexaContext = createContext(null)

export const AlexaProvider = ({ children }: any) => {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [alexa, setAlexa] = useState(null)

  useEffect(() => {
    if (alexa || mounted) {
      return
    } else {
      setMounted(true)
    }

    // @ts-ignore
    Alexa.create({ version: '1.1' })
      .then((args: any) => {
        const { alexa } = args
        alexa.skill.onMessage((message: any) => {
          switch (message.intent) {
            case 'SearchGameByTitle': {
              const query = qs.stringify(
                { q: message.gameTitle, intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(`/search?${query}`)
              break
            }
            case 'SearchGameByCategory': {
              const query = qs.stringify(
                { intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(
                `/search/${encodeURIComponent(message.gameCategory)}?${query}`
              )
              break
            }
            case 'OpenGameDetailIntent': {
              const query = qs.stringify(
                { q: message.gameTitle, intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(`/search?${query}`)
              break
            }
          }
        })
        setAlexa(alexa)
        console.log('Alexa is ready')
      })
      .catch((error: any) => {
        console.log('Alexa is NOT ready', error)
      })
  }, [alexa, mounted, router])

  return <AlexaContext.Provider value={alexa}>{children}</AlexaContext.Provider>
}

export const useAlexa = () => {
  const context = useContext(AlexaContext)

  if (context === undefined) {
    throw new Error('useAlexa must be used within a AlexaProvider')
  }

  return context
}
