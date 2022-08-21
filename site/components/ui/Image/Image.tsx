import { useState } from 'react'
import NextImage, { ImageProps } from 'next/image'
import cn from 'clsx'

const Image = (props: ImageProps) => {
  const [blur, setBlur] = useState(true)

  const classNameToUse = cn(
    {
      'img-blur': blur,
      unblur: !blur,
    },
    props.className
  )

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <NextImage
      layout={'responsive'}
      onLoadingComplete={() => setBlur(false)}
      {...(props as ImageProps)}
      className={classNameToUse}
    />
  )
}

export default Image
