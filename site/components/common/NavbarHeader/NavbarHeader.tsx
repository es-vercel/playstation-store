import { FC } from 'react'
import s from './NavbarHeader.module.css'
import Image from 'next/image'
import UserNav from '../UserNav'

interface Props {
  title: string
  imageUrl: any
  blurDataURL?: string
}

const NavbarHeader: FC<Props> = ({ title, imageUrl, blurDataURL }) => {
  const otherProps: any = {}

  if (blurDataURL) {
    otherProps.placeholder = 'blur'
    otherProps.blurDataURL = blurDataURL
    otherProps.width = 70
    otherProps.height = 70
    otherProps.layout = 'fixed'
  }

  return (
    <div className={s.root}>
      <div className={s.imageTile}>
        <Image
          alt={title}
          src={imageUrl}
          quality="85"
          className={s.image}
          layout="fill"
          objectFit="cover"
          {...otherProps}
        />
      </div>
      <div className={s.title}>{title}</div>
      <div className="flex items-center justify-end flex-1 pr-24 mr-2">
        <UserNav />
      </div>
    </div>
  )
}

export default NavbarHeader
