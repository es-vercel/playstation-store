import { FC } from 'react'
import s from './ProductHeader.module.css'
import Image from 'next/image'

interface Props {
  gameTitle: string
  imageUrl: string
  blurDataURL: string
}

const ProductHeader: FC<Props> = ({ gameTitle, imageUrl, blurDataURL }) => {
  return (
    <div className={s.root}>
      <div className={s.imageTile}>
        <Image
          alt={gameTitle}
          src={imageUrl}
          placeholder="blur"
          blurDataURL={blurDataURL}
          layout="fixed"
          height={70}
          width={70}
          quality="85"
          className={s.image}
        />
      </div>
      <div className={s.title}>{gameTitle}</div>
    </div>
  )
}

export default ProductHeader
