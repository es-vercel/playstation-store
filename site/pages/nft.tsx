import { useCallback, useEffect, useMemo, useState } from 'react'
import { Container, NakamotoAccess } from '@components/ui'
import { supabase } from '@lib/supabaseClient'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAlexa } from '@lib/hooks/useAlexa'
import { Howl } from 'howler'
import Image from 'next/image'
import NakamotoQRCode from '../public/nakamoto/nakauth.svg'

const accessDeniedSound = new Howl({
  src: ['/nakamoto/accessDenied.m4a'],
  html5: true,
})

const accessGrantedSound = new Howl({
  src: ['/nakamoto/success.mp3'],
  html5: true,
})

const universeSound = new Howl({
  src: ['/nakamoto/universe.mp3'],
  html5: true,
})

async function uploadFileToPinata(fileUri: any) {
  const res = await axios({
    method: 'post',
    url: '/api/pinFile',
    data: {
      fileUri,
    },
  })

  return res.data
}

async function uploadJSONToPinata(name: string, content: any) {
  const res = await axios({
    method: 'post',
    url: '/api/pinJSON',
    data: {
      name,
      content,
    },
  })

  return res.data
}

async function mint(tokenUri: string) {
  const res = await axios({
    method: 'post',
    url: '/api/nfts',
    data: {
      tokenUri,
    },
  })

  return res.data
}

async function getStorageImages() {
  const res = await axios({
    method: 'get',
    url: '/api/storage',
  })

  return res.data
}

export default function Nft() {
  const router = useRouter()

  const {
    alexa,
    speak,
    play,
    nakamoto,
    missions,
    nakaTitleVisible,
    setNakaTitleVisible,
    videoRef,
    audioRef,
  } = useAlexa()

  const [imageUrl, setImageUrl] = useState<string>('')

  const [startNakamotoFakeProcess, setStartNakamotoFakeProcess] =
    useState<boolean>(false)

  const [startNakamotoRealProcess, setStartNakamotoRealProcess] =
    useState<boolean>(false)

  const [showQRCode, setShowQRCode] = useState(false)

  const { data: nftImages } = useSWR('nftBucketImages', getStorageImages, {
    refreshInterval: 2000,
  })

  const handleSubmit = useCallback(async () => {
    try {
      const now = new Date()
      const id =
        now.toLocaleDateString('en-GB').split('/').join('') +
        now.getMinutes() +
        now.getSeconds()
      const pinataImage = await uploadFileToPinata(imageUrl)
      const pinataJson = await uploadJSONToPinata(`esn-${id}.json`, {
        name: `Composable Commerce Conference #${id}`,
        description: `Composable Commerce Conference #${id} by H-FARM Enabling Solutions`,
        image: `ipfs://${pinataImage.IpfsHash}`,
      })
      const txn = await mint(`ipfs://${pinataJson.IpfsHash}`)
      console.log(txn)
    } catch (e) {}
  }, [imageUrl])

  const alexaIntent = useMemo(() => {
    if (router.query.intent) {
      // @ts-ignore
      return JSON.parse(router.query.intent)
    } else {
      return null
    }
  }, [router.query.intent])

  const grantAccess = useCallback(() => {
    speak(
      'Segnale ricevuto, validazione in corso. <break time="4s" />Accesso consentito.'
    )
    setTimeout(() => {
      setStartNakamotoRealProcess(true)
      accessGrantedSound.play()
      setShowQRCode(false)
      universeSound.play()
      videoRef.current.src = '/nakamoto/video3.mp4'
      videoRef.current.play()
    }, 5000)
  }, [speak, videoRef])

  useEffect(() => {
    // @ts-ignore
    window.grantAccess = grantAccess
  }, [grantAccess])

  useEffect(() => {
    if (nftImages?.length) {
      const { data: imageData } = supabase.storage
        .from('public')
        .getPublicUrl(`nft/${nftImages[0].name}`)

      if (imageUrl === '') {
        setImageUrl(imageData.publicUrl)
      } else {
        if (imageUrl !== imageData.publicUrl && missions.mission2.completed) {
          setImageUrl(imageData.publicUrl)
          missions.mission3.setCompleted(true)
          speak(
            'obiettivi completati. Processo Nakamoto in esecuzione! ' +
              'In comunicazione con lo Smart Contract H-FARM Enebling Solutions <say-as interpret-as="characters">NFT</say-as>, ' +
              'per la generazione di un nuovo token <say-as interpret-as="characters">ERC721</say-as>. La tua foto sarà salvata ' +
              'per sempre sulla blockchain Layer-2 di Ethereum Polygon.<break time="1s"/> ' +
              'Validazione dati in corso. <break time="4s"/> Necessaria autorizzazione!'
          )
          setTimeout(() => {
            audioRef.current.stop()
            accessDeniedSound.play()
            setStartNakamotoFakeProcess(true)
            setTimeout(() => {
              speak(
                "Probabilmente serve l'autorizzazione di Fabio. Ti invio il QR code da condividergli.",
                'paolo'
              )
              setTimeout(() => {
                setShowQRCode(true)
              }, 6000)
            }, 5000)
          }, 28000)
        }
      }
    }
  }, [
    audioRef,
    imageUrl,
    missions.mission2.completed,
    missions.mission3,
    nftImages,
    speak,
  ])

  useEffect(() => {
    async function alexaEvents() {
      if (!alexaIntent?.intent || !alexa) {
        return
      }

      switch (alexaIntent.intent) {
        case 'StartNakamotoIntent': {
          play()
          setNakaTitleVisible(true)
          setTimeout(() => {
            setNakaTitleVisible(false)
            speak(
              'Francesco, proverò a darti supporto. Il programma Nakamoto prevede il raggiungimento di 3 obiettivi. Te li indico sul tuo display. Buona fortuna!',
              'paolo',
              true
            )
          }, 38000)
          break
        }
      }
    }
    alexaEvents()
  }, [alexa, alexaIntent, play, setNakaTitleVisible, speak])

  return (
    <Container
      className="w-screen h-screen flex items-center justify-center"
      clean
    >
      <div className="relative z-50">
        {missions.mission3.completed && startNakamotoFakeProcess && (
          <NakamotoAccess granted={startNakamotoRealProcess} />
        )}
      </div>
      {showQRCode && (
        <div className="fixed bottom-20 right-16 rounded-3xl overflow-hidden">
          <Image
            className="flex"
            width={300}
            height={300}
            layout="fixed"
            src={NakamotoQRCode}
            alt={'Nakamoto Auth'}
          />
        </div>
      )}
      {nakaTitleVisible && (
        <div className="fixed bottom-48 left-40 font-mono transition-all nakaTitle">
          <h1 className="text-4xl mb-3 font-bold font-mono">
            Nakamoto Program
          </h1>
          <p className="text-2xl mb-10">
            HESN addr(0x8Cb37f2b7986F68F11683B69D12732DDb479066B)
          </p>
          <p className="text-lg">Directed by cesconix.eth</p>
        </div>
      )}
    </Container>
  )
}
// <div>
//   {imageUrl}
//   {imageUrl !== '' && <button onClick={handleSubmit}>test</button>}
// </div>
