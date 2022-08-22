import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import { Grid, Marquee, Hero, Container } from '@components/ui'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useEffect, useState } from 'react'
import { useAlexa } from '@lib/hooks/useAlexa'
import { useRouter } from 'next/router'
import { getPlaiceholder } from 'plaiceholder'
import BackgroundImageHome from '../public/background-home.jpeg'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 20 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
  const { categories, brands } = await siteInfoPromise

  const enhancedProducts = await Promise.all(
    products.map(async (product) => {
      const { base64, img } = await getPlaiceholder(product.images[0].url, {
        size: 25,
      })
      return {
        ...product,
        blurDataURL: base64,
      }
    })
  ).then((values) => values)

  return {
    props: {
      products: enhancedProducts,
      categories,
      brands,
      pages,
    },
    revalidate: 60,
  }
}

export default function Home({
  products,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout pageProps={{ categories }} backgroundImage={BackgroundImageHome}>
      <Container className="max-w-none w-full" clean>
        <div className="px-36 py-0 fixed bottom-10 w-full">
          <div className="flex flex-1 justify-between mb-4 text-2xl">
            <span>In evidenza</span>
          </div>
          <Grid>
            {products.slice(6, 15).map((product: any, i: number) => (
              <ProductCard
                key={product.id}
                product={product}
                imgProps={{
                  blurDataURL: product.blurDataURL,
                  priority: i === 0,
                }}
              />
            ))}
          </Grid>
          {/* <Marquee variant="secondary">
            {products.slice(4, 8).map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} variant="slim" />
            ))}
          </Marquee> */}
          {/*<Marquee>
        {products.slice(3).map((product: any, i: number) => (
          <ProductCard key={product.id} product={product} variant="slim" />
        ))}
      </Marquee> */}
        </div>
      </Container>
    </Layout>
  )
}

Home.Layout = Layout
