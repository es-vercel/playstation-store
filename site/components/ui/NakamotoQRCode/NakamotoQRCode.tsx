import Image from 'next/image'

const NakamotoQRCode: React.FC = () => {
  return (
    <div className="fixed flex bottom-20 right-16 rounded-3xl overflow-hidden">
      <Image
        className="flex"
        width={300}
        height={300}
        layout="fixed"
        src="/nakamoto/nakauth.svg"
        alt={'Nakamoto Auth'}
      />
    </div>
  )
}

export default NakamotoQRCode
