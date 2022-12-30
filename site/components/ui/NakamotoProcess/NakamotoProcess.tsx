import cn from 'clsx'
import s from './NakamotoProcess.module.css'
import Typewriter from 'typewriter-effect'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useAlexa } from '@lib/hooks/useAlexa'
import Image from 'next/image'

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

interface Props {
  imageUrl: string
}

const NakamotoProcess: React.FC<Props> = ({ imageUrl }) => {
  const { speak } = useAlexa()

  const [show, setShow] = useState(false)
  const [exec, setExec] = useState(false)

  const [uploadFileDone, setUploadFileDone] = useState('')
  const [uploadJSONDone, setUploadJSONDone] = useState('')
  const [mintDone, setMintDone] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setShow(true)
      setTimeout(() => {
        setExec(true)
      }, 6000)
    }, 2000)
  }, [])

  const runProcess = useCallback(async () => {
    try {
      const now = new Date()
      const id =
        now.toLocaleDateString('en-GB').split('/').join('') +
        now.getMinutes() +
        now.getSeconds()
      const pinataImage = await uploadFileToPinata(imageUrl)
      setUploadFileDone(pinataImage.IpfsHash)
      const pinataJson = await uploadJSONToPinata(`esn-${id}.json`, {
        name: `Nakamoto Program #${id}`,
        description: `Nakamoto Program #${id} by Francesco Pasqua (cesconix)`,
        image: `ipfs://${pinataImage.IpfsHash}`,
      })
      setUploadJSONDone(pinataJson.IpfsHash)
      try {
        const txn = await mint(`ipfs://${pinataJson.IpfsHash}`)
        setTimeout(() => {
          setMintDone(txn.hash)
          setTimeout(() => {
            speak('Ottimo lavoro ragazzi!', 'fabio', true)
          }, 2000)
        }, 3000)
      } catch (e) {
        const txn = await mint(`ipfs://${pinataJson.IpfsHash}`)
        setTimeout(() => {
          setMintDone(txn.hash)
          setTimeout(() => {
            speak('Ottimo lavoro ragazzi!', 'fabio', true)
          }, 2000)
        }, 3000)
      }
    } catch (e) {}
  }, [imageUrl, speak])

  useEffect(() => {
    if (exec) {
      runProcess()
      // setTimeout(() => {
      //   setUploadFileDone('1')

      //   setTimeout(() => {
      //     setUploadJSONDone('2')

      //     setTimeout(() => {
      //       setMintDone('3')
      //     }, 3000)
      //   }, 2000)
      // }, 1000)
    }
  }, [exec, runProcess])

  if (!show) {
    return null
  }

  return (
    <div
      className={cn(s.root, {
        nakaProc: true,
      })}
    >
      <p className="font-bold">{'>'} Nakamoto Program</p>
      <p className="text-xl mt-5">
        <Typewriter
          options={{}}
          onInit={(typewriter) => {
            typewriter
              .changeDelay(40)
              .typeString(
                '<span class="text-lime-400 font-bold">Blockchain:</span> Polygon (MATIC)<br />' +
                  '<span class="text-lime-400 font-bold">Contract:</span> H-FARM Enabling Solutions NFT (HESN)<br />' +
                  '<span class="text-lime-400 font-bold">Address:</span> 0x8Cb37f2b7986F68F11683B69D12732DDb479066B'
              )
              .start()
          }}
        />
      </p>
      {exec && (
        <>
          <div className="mt-5">
            <p className="text-xl flex">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .changeDelay(5)
                    .typeString(
                      'Uploading <span class="font-bold">photo</span> to IPFS...'
                    )
                    .start()
                }}
              />
              {uploadFileDone && (
                <span className="text-lime-400 font-bold">done!</span>
              )}
            </p>
            {uploadFileDone && (
              <p className="text-xl flex">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .changeDelay(5)
                      .typeString(
                        'Building and uploading <span class="font-bold">NFT Metadata</span> to IPFS...'
                      )
                      .start()
                  }}
                />
                {uploadJSONDone && (
                  <span className="text-lime-400 font-bold">done!</span>
                )}
              </p>
            )}
            {uploadJSONDone && (
              <p className="text-xl flex">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .changeDelay(5)
                      .typeString(
                        'Minting <span class="font-bold">HESN NFT (ERC-721)</span> on the blockchain...'
                      )
                      .start()
                  }}
                />
                {mintDone && (
                  <span className="text-lime-400 font-bold">done!</span>
                )}
              </p>
            )}
          </div>
          <div className="mt-5">
            {mintDone && (
              <>
                <div>
                  <p className="font-bold" style={{ color: 'lime' }}>
                    NFT Minted. WELL DONE!!!
                  </p>
                  <p className="text-base mt-5 break-words">
                    Transaction Hash: https://polygonscan.com/tx/{mintDone}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="relative w-full h-44">
                    <Image
                      alt={`https://ipfs.io/ipfs/${uploadFileDone}`}
                      src={`https://ipfs.io/ipfs/${uploadFileDone}`}
                      layout="fill"
                      objectFit="cover"
                      quality={85}
                      unoptimized
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NakamotoProcess
