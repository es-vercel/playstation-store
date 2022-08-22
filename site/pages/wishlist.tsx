import type { GetStaticPropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Heart } from '@components/icons'
import { Layout, NavbarHeader } from '@components/common'
import { Text, Container, Skeleton, Image } from '@components/ui'
import { useCustomer } from '@framework/customer'
import { WishlistCard } from '@components/wishlist'
import useWishlist from '@framework/wishlist/use-wishlist'
import rangeMap from '@lib/range-map'
import BackgroundImage from '../public/background.webp'
import CartImage from '../public/cart.webp'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  // Disabling page if Feature is not available
  if (!process.env.COMMERCE_WISHLIST_ENABLED) {
    return {
      notFound: true,
    }
  }

  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise

  return {
    props: {
      pages,
      categories,
    },
  }
}

export default function Wishlist() {
  const { data: customer } = useCustomer()
  // @ts-ignore Shopify - Fix this types
  const { data, isLoading, isEmpty } = useWishlist({ includeProducts: true })
  return (
    <Container className="max-w-none w-full" clean>
      <div className="bgWrap">
        <Image
          alt="Background"
          src={BackgroundImage}
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <NavbarHeader
        title={
          data?.items.length! > 0
            ? `Lista dei desideri: ${data?.items.length}`
            : 'Lista dei desideri'
        }
        imageUrl={CartImage}
      />
      <div className="px-36 py-0 relative grid grid-cols-12 gap-2">
        {isEmpty ? (
          <div className="col-span-12 px-12 py-40 flex flex-col justify-center items-center bg-gray-900 bg-opacity-70 p-5">
            <h2 className="text-2xl font-bold text-center">
              La lista dei desideri è vuota
            </h2>
          </div>
        ) : (
          <div className="col-span-12">
            {data &&
              // @ts-ignore - Wishlist Item Type
              data.items?.map((item) => (
                <WishlistCard key={item.id} item={item!} />
              ))}
          </div>
        )}
      </div>
    </Container>
  )
}

Wishlist.Layout = Layout
