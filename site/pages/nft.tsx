import { useCallback, useEffect, useMemo, useState } from 'react'
import { Container, NakamotoAccess } from '@components/ui'
import { supabase } from '@lib/supabaseClient'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAlexa } from '@lib/hooks/useAlexa'
import { Howl } from 'howler'

const accessDeniedSound = new Howl({
  src: ['/nakamoto/accessDenied.m4a'],
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
  } = useAlexa()

  const [imageUrl, setImageUrl] = useState<string>('')

  const [needAuthorization, setNeedAuthorization] = useState<boolean | null>(
    null
  )

  const { data: nftImages } = useSWR('nftBucketImages', getStorageImages, {
    refreshInterval: 3000,
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
            'Obbiettivi completati. Processo Nakamoto in esecuzione! ' +
              'In comunicazione con lo Smart Contract H-FARM Enebling Solutions <say-as interpret-as="characters">NFT</say-as>, ' +
              'per la generazione di un nuovo token <say-as interpret-as="characters">ERC721</say-as>. La tua foto sarà salvata ' +
              'per sempre sulla blockchain Layer-2 di Ethereum Polygon.<break time="1s"/> ' +
              'Validazione dati in corso. <break time="4s"/> Necessaria autorizzazione!'
          )
          setTimeout(() => {
            accessDeniedSound.play()
            setNeedAuthorization(true)
          }, 28000)
        }
      }
    }
  }, [
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
              'Francesco, proverò a darti supporto. Il programma Nakamoto prevede il superamento di alcune prove. Te le indico sul tuo display. Buona fortuna!',
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
        {missions.mission3.completed && needAuthorization && (
          <NakamotoAccess granted={false} />
        )}
      </div>
      {nakaTitleVisible && (
        <div className="fixed bottom-48 left-40 font-mono transition-all nakaTitle">
          <h1 className="text-4xl mb-3 font-bold font-mono">Nakamoto Plan</h1>
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
