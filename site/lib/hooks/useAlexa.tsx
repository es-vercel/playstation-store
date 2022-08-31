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

  const [video1Downloaded, setVideo1Downloaded] = useState(false)
  const [video2Downloaded, setVideo2Downloaded] = useState(false)
  const [video3Downloaded, setVideo3Downloaded] = useState(false)

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
  }, [])

  const play = useCallback(() => {
    audioRef.current.volume = 0.4
    audioRef.current.play()
    setTimeout(() => {
      videoRef.current.play()
    }, 1000)
    setTimeout(() => {
      videoRef.current.src = '/nakamoto/video2.mp4'
      videoRef.current.play()
    }, 134000)
  }, [])

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

  const handleVideo1Loaded = useCallback(() => {
    console.log('video1 caricato')
    setVideo1Downloaded(true)
  }, [])

  const handleVideo2Loaded = useCallback(() => {
    console.log('video2 caricato')
    setVideo2Downloaded(true)
  }, [])

  const handleVideo3Loaded = useCallback(() => {
    console.log('video3 caricato')
    setVideo3Downloaded(true)
  }, [])

  return (
    <>
      {(onFireTV || true) && (
        <>
          <Script
            src="https://cdn.html.games.alexa.a2z.com/alexa-html/latest/alexa-html.js"
            onLoad={handleLoadScript}
          />
          <link rel="preload" as="video" href="/nakamoto/video1.webm" />
          <link rel="preload" as="video" href="/nakamoto/video2.webm" />
          <link rel="preload" as="video" href="/nakamoto/video3.webm" />
        </>
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
              autoPlay
              loop
              src="/nakamoto/quickfall.mp3"
              className=""
            />
            <video
              ref={videoRef}
              onCanPlayThrough={handleVideo1Loaded}
              muted
              // loop
              src="/nakamoto/video1.webm"
              className="h-full w-full absolute objectFitCover"
            />
            {/* <video
              onCanPlayThrough={handleVideo2Loaded}
              autoPlay
              muted
              loop
              src={Video2}
              className=""
            />
            <video
              onCanPlayThrough={handleVideo3Loaded}
              autoPlay
              muted
              loop
              // src="/nakamoto/video3.mov"
              src={Video3}
              className=""
            /> */}
            <div className="fixed top-5 right-0 mr-2 font-mono transition-all z-50 text-">
              {video1Downloaded && '.'}
              {video2Downloaded && '.'}
              {video3Downloaded && '.'}
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
