import Image from 'next/image'
import s from './ProductView.module.css'
import { FC, useState } from 'react'
import type { Product } from '@commerce/types/product'
import { WishlistButton } from '@components/wishlist'
import { ProductHeader, ProductSlider } from '@components/product'
import { Button, Container } from '@components/ui'
import { SEO } from '@components/common'

import ImagePegi16 from '../../../public/pegi16.png'
import ImagePegiBadLanguage from '../../../public/bad-language.png'
import ImagePegiViolence from '../../../public/violence.png'
import { ModalUI } from '@components/common/Layout'
import { AddToCartButton } from '@components/cart'

interface ProductViewProps {
  product: Product
  images: any
}

const ProductView: FC<ProductViewProps> = ({ product, images }) => {
  const [bgSlideIndex, setBgSlideIndex] = useState(1)

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
            <AddToCartButton product={product} />
            <WishlistButton
              productId={product.id}
              variant={product.variants[0]}
            />
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
              width={44}
              height={44}
            />
            <Image
              alt="PEGI Violence"
              src={ImagePegiViolence}
              layout="fixed"
              width={44}
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
                  layout="fixed"
                  width={312.88}
                  height={176}
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
      <ModalUI />
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
