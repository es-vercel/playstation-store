import { useRouter } from 'next/router'
import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  useCallback,
  useRef,
} from 'react'
import qs from 'qs'
import Script from 'next/script'
import { Howl } from 'howler'
import { NakamotoHud, NakamotoQRCode, NakamotoSpeaker } from '@components/ui'
import axios from 'axios'

const codecSound = new Howl({
  src: ['/nakamoto/codec.m4a'],
})

const successSound = new Howl({
  src: ['/nakamoto/success.mp3'],
})

export interface IAlexa {
  alexa: any
  speak: (message: string, person?: string | null, withCall?: boolean) => void
  nakamoto: boolean
  play: any
  nakaTitleVisible: boolean
  setNakaTitleVisible: any
  missions: any
  audioRef: any
  videoRef: any
  video1objectURL: any
  video2objectURL: any
  video3objectURL: any
  setShowQRCode: any
}

const AlexaContext = createContext<IAlexa>({
  alexa: null,
  speak: () => {},
  nakamoto: false,
  play: () => {},
  nakaTitleVisible: false,
  setNakaTitleVisible: () => {},
  missions: {},
  audioRef: {},
  videoRef: {},
  video1objectURL: undefined,
  video2objectURL: undefined,
  video3objectURL: undefined,
  setShowQRCode: () => {},
})

function _speak(alexa: any, message: string) {
  alexa.skill.sendMessage({
    intent: 'SpeakIntent',
    message,
  })
}

export const AlexaProvider = ({ children }: any) => {
  const [onFireTV, setOnFireTV] = useState(false)
  const router = useRouter()

  const [alexa, setAlexa] = useState(null)
  const [nakamoto, setNakamoto] = useState(false)
  const [speaker, setSpeaker] = useState(null)
  const [nakaTitleVisible, setNakaTitleVisible] = useState(false)

  const [mission1Completed, setMission1Completed] = useState(false)
  const [mission2Completed, setMission2Completed] = useState(false)
  const [mission3Completed, setMission3Completed] = useState(false)

  const [showQRCode, setShowQRCode] = useState(false)

  const [video1objectURL, setVideo1objectURL] = useState<string | undefined>()
  const [video2objectURL, setVideo2objectURL] = useState<string | undefined>()
  const [video3objectURL, setVideo3objectURL] = useState<string | undefined>()

  useEffect(() => {
    if (mission1Completed || mission2Completed || mission3Completed) {
      successSound.play()
    }
  }, [mission1Completed, mission2Completed, mission3Completed])

  const speak = useCallback(
    (message, person = null, withCall = false) => {
      if (!alexa) {
        return
      }

      if (alexa && !nakamoto) {
        return _speak(alexa, message)
      }

      const voices: any = {
        paolo: {
          voice: 'Giorgio',
          rate: 'medium',
          pitch: 'medium',
        },
        fabio: {
          voice: 'Giorgio',
          rate: 'medium',
          pitch: 'x-high',
        },
      }

      if (alexa && nakamoto && voices[person]) {
        const v = voices[person]
        if (withCall) {
          codecSound.play()
          setTimeout(() => {
            setSpeaker(person)
            _speak(
              alexa,
              `<voice name="${v.voice}"><break time="1s"/><prosody rate="${v.rate}" pitch="${v.pitch}">${message}<break time="1s"/></prosody></voice>`
            )
          }, 3000)
        } else {
          setSpeaker(person)
          _speak(
            alexa,
            `<voice name="${v.voice}"><break time="1s"/><prosody rate="${v.rate}" pitch="${v.pitch}">${message}<break time="1s"/></prosody></voice>`
          )
        }
      } else {
        _speak(alexa, message)
      }
    },
    [alexa, nakamoto]
  )

  const handleLoadScript = useCallback(() => {
    // @ts-ignore
    Alexa.create({ version: '1.1' })
      .then((args: any) => {
        const { alexa } = args
        alexa.speech.onStopped(() => {
          console.log('onStopped speaker')
          setSpeaker(null)
        })
        alexa.skill.onMessage((message: any) => {
          switch (message.intent) {
            case 'SearchGameByTitle': {
              const query = qs.stringify(
                {
                  q: message.gameTitle,
                  intent: JSON.stringify(message),
                },
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
            case 'GetGamePriceByTitleIntent':
            case 'GetGameDescriptionByTitleIntent':
            case 'AddToCartByTitleIntent':
            case 'OpenGameDetailIntent': {
              const query = qs.stringify(
                {
                  q: message.gameTitle,
                  intent: JSON.stringify(message),
                  loading: true,
                },
                { skipNulls: true }
              )
              router.push(`/search?${query}`)
              break
            }
            case 'OpenCartIntent':
            case 'ReadCartItemIntent':
            case 'DeleteCartItemIntent':
            case 'ClearCartIntent':
            case 'CheckoutIntent': {
              const query = qs.stringify(
                { intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(`/cart?${query}`)
              break
            }
            case 'CloseGameDetailIntent': {
              router.push('/')
              break
            }
            case 'CheckoutIntent': {
              break
            }
            case 'StartNakamotoIntent': {
              const query = qs.stringify(
                { intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(`/nft?${query}`)
              setNakamoto(true)
              break
            }
            case 'Error': {
              console.log(message.error)
            }
          }
        })
        setAlexa(alexa)
        console.log('Alexa is ready')
      })
      .catch((error: any) => {
        console.log('Alexa is NOT ready', error)
      })
  }, [router])

  useEffect(() => {
    if (navigator.userAgent.includes('AFT')) {
      console.log('Fire TV')
      setOnFireTV(true)
    }

    async function fn() {
      const v1 = await axios({
        url: '/nakamoto/video1.webm',
        method: 'GET',
        responseType: 'blob',
      })
      setVideo1objectURL(URL.createObjectURL(v1.data))

      const v2 = await axios({
        url: '/nakamoto/video2.webm',
        method: 'GET',
        responseType: 'blob',
      })
      setVideo2objectURL(URL.createObjectURL(v2.data))

      const v3 = await axios({
        url: '/nakamoto/video3.mp4',
        method: 'GET',
        responseType: 'blob',
      })
      setVideo3objectURL(URL.createObjectURL(v3.data))
    }
    fn()
  }, [])

  const play = useCallback(() => {
    audioRef.current.volume = 0.6
    audioRef.current.play()
    setTimeout(() => {
      videoRef.current.play()
    }, 1000)
    setTimeout(() => {
      videoRef.current.src = video2objectURL
      videoRef.current.play()
    }, 134000)
  }, [video2objectURL])

  useEffect(() => {
    // @ts-ignore
    window.speak = speak
    // @ts-ignore
    window.reset = () => {
      setNakamoto(false)
      setSpeaker(null)
    }
    // @ts-ignore
    window.audioRef = audioRef
    // @ts-ignore
    window.videoRef = videoRef
    // @ts-ignore
    window.startNaka = () => {
      router.push(`/nft`)
      setNakamoto(true)
      setTimeout(() => {
        setNakaTitleVisible(true)
      }, 5000)
      play()
    }
  }, [play, router, speak])

  const audioRef: any = useRef()
  const videoRef: any = useRef()

  return (
    <>
      {onFireTV && (
        <Script
          src="https://cdn.html.games.alexa.a2z.com/alexa-html/latest/alexa-html.js"
          onLoad={handleLoadScript}
        />
      )}
      <AlexaContext.Provider
        value={{
          alexa,
          speak,
          nakamoto,
          play,
          nakaTitleVisible,
          setNakaTitleVisible,
          audioRef,
          videoRef,
          video1objectURL,
          video2objectURL,
          video3objectURL,
          missions: {
            mission1: {
              completed: mission1Completed,
              setCompleted: setMission1Completed,
            },
            mission2: {
              completed: mission2Completed,
              setCompleted: setMission2Completed,
            },
            mission3: {
              completed: mission3Completed,
              setCompleted: setMission3Completed,
            },
          },
          setShowQRCode,
        }}
      >
        {(onFireTV || true) && (
          <>
            <audio
              ref={audioRef}
              onCanPlayThrough={() => {
                console.log('audio caricato')
              }}
              loop
              src="/nakamoto/quickfall.mp3"
              className="hidden"
            />
            <video
              ref={videoRef}
              muted
              loop
              src={video1objectURL}
              className="h-full w-full absolute objectFitCover"
            />
            {/* <video
              onCanPlayThrough={handleVideo2Loaded}
              autoPlay
              muted
              loop
              // src="/nakamoto/video2.webm"
              className="hidden"
            />
            <video
              onCanPlayThrough={handleVideo3Loaded}
              autoPlay
              muted
              loop
              // src="/nakamoto/video3.webm"
              className="hidden"
            /> */}
            <div className="fixed top-5 right-0 mr-2 font-mono transition-all z-50 text-">
              {video1objectURL && '.'}
              {video2objectURL && '.'}
              {video3objectURL && '.'}
            </div>
            {nakamoto && (
              <>
                {speaker && (
                  <NakamotoSpeaker
                    id={speaker}
                    show={typeof speaker === 'string'}
                  />
                )}
                {showQRCode ? <NakamotoQRCode /> : <NakamotoHud />}
              </>
            )}
          </>
        )}
        {children}
      </AlexaContext.Provider>
    </>
  )
}

export const useAlexa = () => {
  const context = useContext(AlexaContext)

  if (context === undefined) {
    throw new Error('useAlexa must be used within a AlexaProvider')
  }

  return context
}
