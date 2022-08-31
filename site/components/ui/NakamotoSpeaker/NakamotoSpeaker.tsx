import cn from 'clsx'
import Image from '../Image'
import s from './NakamotoSpeaker.module.css'

import FabioImage from '../../../public/nakamoto/fabio.jpeg'
import PaoloImage from '../../../public/nakamoto/paolo.jpeg'

const speakers: any = {
  fabio: {
    name: 'Fabio',
    src: FabioImage,
  },
  paolo: {
    name: 'Paolo',
    src: PaoloImage,
  },
}

interface Props {
  id: string | null
  show: boolean
}

const NakamotoSpeaker: React.FC<Props> = ({ id, show }) => {
  return (
    <div
      className={cn(s.root, {
        'opacity-100': show,
        'opacity-0': !show,
      })}
    >
      <div className={s.image}>
        <div className="rainbow">
          <span />
          <span />
        </div>
        <div className={s.imageContainer}>
          <div className={cn(s.grain)}>
            <Image
              className="grain"
              layout="fill"
              objectFit="cover"
              src={id ? speakers[id].src : '/nakamoto/paolo.jpeg'}
              alt={id ? speakers[id].name : 'Guest'}
            />
          </div>
          {id && (
            <div
              className="z-10 absolute bottom-0 text-xl font-bold text-white m-4 p-2 bg-black bg-opacity-50 shadow-2xl"
              style={{ color: '#d0f224' }}
            >
              {id ? speakers[id].name : 'Guest'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NakamotoSpeaker
