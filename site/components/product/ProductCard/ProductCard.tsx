import { FC, useEffect, useRef } from 'react'
import cn from 'clsx'
import Link from 'next/link'
import type { Product } from '@commerce/types/product'
import s from './ProductCard.module.css'
import Image, { ImageProps } from 'next/image'
import WishlistButton from '@components/wishlist/WishlistButton'
import usePrice from '@framework/product/use-price'
import ProductTag from '../ProductTag'
import { Howl } from 'howler'

interface Props {
  className?: string
  product: Product
  noNameTag?: boolean
  imgProps?: Omit<ImageProps, 'src' | 'layout' | 'placeholder'>
  variant?: 'default' | 'slim' | 'simple'
  priority?: boolean
}

const placeholderImg = '/product-img-placeholder.svg'

// const sound = new Howl({
//   src: ['/sounds.mp3'],
//   sprite: {
//     laser: [34200, 100],
//   },
// })

const ProductCard: FC<Props> = ({
  product,
  imgProps,
  className,
  noNameTag = false,
  variant = 'default',
  priority = false,
}) => {
  const { price } = usePrice({
    amount: product.price.value,
    baseAmount: product.price.retailPrice,
    currencyCode: product.price.currencyCode!,
  })

  const rootClassName = cn(
    s.root,
    { [s.slim]: variant === 'slim', [s.simple]: variant === 'simple' },
    className
  )

  return (
    <Link href={`/product/${product.slug}`}>
      <a
        className={rootClassName}
        aria-label={product.name}
        // onFocus={() => sound.play('laser')}
      >
        {variant === 'simple' && (
          <div className={s.imageContainer}>
            {product?.images && (
              <div className="relative">
                <Image
                  alt={product.name || 'Product Image'}
                  className={s.productImage}
                  src={product.images[0]?.url || placeholderImg}
                  quality="85"
                  width={764}
                  height={764}
                  layout="responsive"
                  sizes="12vw"
                  priority={priority}
                />
                <div className={s.gradient}>
                  <div className={s.price}>{price}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {variant === 'default' && (
          <div className={s.imageContainer}>
            {product?.images && (
              <div>
                <Image
                  alt={product.name || 'Product Image'}
                  className={s.productImage}
                  src={product.images[0]?.url || placeholderImg}
                  height={764}
                  width={764}
                  quality="85"
                  layout="responsive"
                  placeholder="blur"
                  sizes="12vw"
                  {...imgProps}
                />
              </div>
            )}
          </div>
        )}
      </a>
    </Link>
  )
}

export default ProductCard
