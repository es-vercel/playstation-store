import cn from 'clsx'
import Image from 'next/image'
import s from './ProductView.module.css'
import { FC, useEffect, useState } from 'react'
import type { Product } from '@commerce/types/product'
import usePrice from '@framework/product/use-price'
import { WishlistButton } from '@components/wishlist'
import { ProductHeader, ProductSlider } from '@components/product'
import { Button, Container, Text } from '@components/ui'
import { SEO } from '@components/common'
import ProductSidebar from '../ProductSidebar'
import ProductTag from '../ProductTag'
import { useAlexa } from '@lib/hooks/useAlexa'
import { useRouter } from 'next/router'
import { convert } from 'html-to-text'
import { useAddItem } from '@framework/cart'

import ImagePegi16 from '../../../public/pegi16.png'
import ImagePegiBadLanguage from '../../../public/bad-language.png'
import ImagePegiViolence from '../../../public/violence.png'

interface ProductViewProps {
  product: Product
  images: any
}

const ProductView: FC<ProductViewProps> = ({ product, images }) => {
  const addItem = useAddItem()
  const [loading, setLoading] = useState(false)

  const [bgSlideIndex, setBgSlideIndex] = useState(1)

  const addToCart = async () => {
    setLoading(true)
    try {
      await addItem({
        productId: String(product.id),
        variantId: String(product.variants[0]?.id),
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const { price } = usePrice({
    amount: product.price.value,
    baseAmount: product.price.retailPrice,
    currencyCode: product.price.currencyCode!,
  })

  return (
    <>
      <Container className="max-w-none w-full " clean>
        <div className="bgWrap animated fadeIn">
          <Image
            alt="Background"
            src={images[bgSlideIndex].src}
            placeholder="blur"
            blurDataURL={images[bgSlideIndex].blurDataURL}
            layout="fill"
            objectFit="cover"
            quality={85}
            priority={true}
          />
          <div className={s.gradient} />
        </div>
        <ProductHeader
          gameTitle={product.name}
          imageUrl={images[0].src}
          blurDataURL={images[0].blurDataURL}
        />
        <div className="px-36 py-8 relative" style={{ width: '53%' }}>
          <span className={s.ps4}>PS4</span>
          <span className={s.ps5}>PS5</span>
          <span className={s.standardEdition}>Standard Edition</span>
          <div
            className={s.description}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <div className="flex gap-3 mt-24">
            <Button
              aria-label="Aggiungi al Carrello"
              type="button"
              variant="psstore"
              onClick={addToCart}
              loading={loading}
              disabled={product.variants[0]?.availableForSale === false}
            >
              {product.variants[0]?.availableForSale === false
                ? 'Non disponibile'
                : price}
            </Button>
            <Button
              aria-label="Aggiungi al Carrello"
              type="button"
              variant="psstore"
              onClick={addToCart}
              loading={loading}
              disabled={product.variants[0]?.availableForSale === false}
            >
              Lista dei desideri
            </Button>
          </div>
          <div className="flex gap-2 mt-8">
            <Image
              alt="PEGI 16"
              src={ImagePegi16}
              layout="fixed"
              width={36.2}
              height={44}
            />
            <Image
              alt="PEGI Bad Language"
              src={ImagePegiBadLanguage}
              layout="fixed"
              width={36.2}
              height={44}
            />
            <Image
              alt="PEGI Violence"
              src={ImagePegiViolence}
              layout="fixed"
              width={36.2}
              height={44}
            />
          </div>
        </div>

        <div className={s.sliderContainer}>
          <div className={s.sliderTitle}>Contenuti multimediali</div>
          <ProductSlider key={product.id} onChangeSlideIndex={setBgSlideIndex}>
            {images.slice(2).map((image: any, i: number) => (
              <div key={image.src} className={s.imageContainer}>
                <Image
                  className={s.img}
                  src={image.src!}
                  placeholder="blur"
                  blurDataURL={image.blurDataURL}
                  alt={image.alt || 'Product Image'}
                  layout="fill"
                  quality="85"
                />
              </div>
            ))}
          </ProductSlider>
        </div>
        {/* <div className={cn(s.root, 'fit')}>
          <div className={cn(s.main, 'fit')}>
            <ProductTag
              name={product.name}
              price={`${price} ${product.price?.currencyCode}`}
              fontSize={32}
            />
            <div className={s.sliderContainer}>
              <ProductSlider key={product.id}>
                {images.slice(2).map((image: any, i: number) => (
                  <div key={image.src} className={s.imageContainer}>
                    <Image
                      className={s.img}
                      src={image.src!}
                      placeholder="blur"
                      blurDataURL={image.blurDataURL}
                      alt={image.alt || 'Product Image'}
                      width={600}
                      height={600}
                      quality="85"
                    />
                  </div>
                ))}
              </ProductSlider>
            </div>
            {process.env.COMMERCE_WISHLIST_ENABLED && (
              <WishlistButton
                className={s.wishlistButton}
                productId={product.id}
                variant={product.variants[0]}
              />
            )}
          </div>

          <ProductSidebar
            key={product.id}
            product={product}
            className={s.sidebar}
          />
        </div> */}
        {/* <hr className="mt-7 border-accent-2" /> */}
        {/* <section className="py-12 px-6 mb-10">
          <Text variant="sectionHeading">Related Products</Text>
          <div className={s.relatedProductsGrid}>
            {relatedProducts.map((p) => (
              <div
                key={p.path}
                className="animated fadeIn bg-accent-0 border border-accent-2"
              >
                <ProductCard
                  noNameTag
                  product={p}
                  key={p.path}
                  variant="simple"
                  className="animated fadeIn"
                  imgProps={{
                    width: 300,
                    height: 300,
                  }}
                />
              </div>
            ))}
          </div>
        </section> */}
      </Container>
      <SEO
        title={product.name}
        description={product.description}
        openGraph={{
          type: 'website',
          title: product.name,
          description: product.description,
          images: [
            {
              url: product.images[0]?.url!,
              width: '800',
              height: '600',
              alt: product.name,
            },
          ],
        }}
      />
    </>
  )
}

export default ProductView
