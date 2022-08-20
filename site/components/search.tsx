import cn from 'clsx'
import type { SearchPropsType } from '@lib/search-props'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import type { Product } from '@commerce/types/product'
import { Container, Skeleton } from '@components/ui'

import useSearch from '@framework/product/use-search'
import { useAddItem } from '@framework/cart'

import getSlug from '@lib/get-slug'
import rangeMap from '@lib/range-map'
import { convert } from 'html-to-text'

const SORT = {
  'trending-desc': 'Trending',
  'latest-desc': 'Latest arrivals',
  'price-asc': 'Price: Low to high',
  'price-desc': 'Price: High to low',
}

import {
  filterQuery,
  getCategoryPath,
  getDesignerPath,
  useSearchMeta,
} from '@lib/search'
import { useAlexa } from '@lib/hooks/useAlexa'
import Image from 'next/image'

export default function Search({ categories, brands }: SearchPropsType) {
  const { alexa, speak } = useAlexa()
  const addItem = useAddItem()

  const [activeFilter, setActiveFilter] = useState('')
  const [toggleFilter, setToggleFilter] = useState(false)

  const router = useRouter()
  const { asPath, locale } = router
  const { q, sort, loading } = router.query
  // `q` can be included but because categories and designers can't be searched
  // in the same way of products, it's better to ignore the search input if one
  // of those is selected
  const query = filterQuery({ sort })

  const { pathname, category, brand } = useSearchMeta(asPath)
  const activeCategory = categories.find((cat: any) => cat.slug === category)
  const activeBrand = brands.find(
    (b: any) => getSlug(b.node.path) === `brands/${brand}`
  )?.node

  const { data } = useSearch({
    search: typeof q === 'string' ? q : '',
    categoryId: activeCategory?.id,
    brandId: (activeBrand as any)?.entityId,
    sort: typeof sort === 'string' ? sort : '',
    locale,
  })

  const handleClick = (event: any, filter: string) => {
    if (filter !== activeFilter) {
      setToggleFilter(true)
    } else {
      setToggleFilter(!toggleFilter)
    }
    setActiveFilter(filter)
  }

  const alexaIntentName = useMemo(() => {
    if (router.query.intent) {
      // @ts-ignore
      const { intent } = JSON.parse(router.query.intent)
      return intent
    } else {
      return null
    }
  }, [router.query.intent])

  useEffect(() => {
    async function alexaEvents() {
      if (!alexaIntentName || !alexa) {
        return
      }

      if (data) {
        switch (alexaIntentName) {
          case 'OpenGameDetailIntent': {
            if (data.found) {
              alexa.skill.sendMessage({
                intent: 'SaveGameIntent',
                product: data.products[0],
              })
              router.replace(`/product/${data.products[0].slug}`, undefined, {
                shallow: true,
              })
            } else {
              router.back()
              speak(`Mi spiace ma non ho trovato ${q}. Prova un altro titolo.`)
            }
            break
          }
          case 'SearchGameByTitle': {
            if (data.found) {
              speak('Ok, ecco cosa ho trovato')
            } else {
              // router.back()
              speak(`Mi spiace ma non ho trovato ${q}. Prova un altro titolo.`)
            }
            break
          }
          case 'GetGameDescriptionByTitleIntent': {
            if (data.found) {
              const product = data.products[0]
              const { description, slug } = product
              alexa.skill.sendMessage({
                intent: 'SaveGameIntent',
                product,
              })
              speak(`${convert(description)}`)
              router.replace(`/product/${slug}`, undefined, { shallow: true })
            } else {
              router.back()
              speak(`Mi spiace ma non ho trovato ${q}. Prova un altro titolo.`)
            }
            break
          }
          case 'GetGamePriceByTitleIntent': {
            if (data.found) {
              const product = data.products[0]
              const { name, price, slug } = product
              alexa.skill.sendMessage({
                intent: 'SaveGameIntent',
                product,
              })
              speak(`${name} costa ${price.value} euro.`)
              router.replace(`/product/${slug}`, undefined, { shallow: true })
            } else {
              router.back()
              speak(`Mi spiace ma non ho trovato ${q}. Prova un altro titolo.`)
            }
            break
          }
          case 'AddToCartByTitleIntent': {
            if (data.found) {
              const product = data.products[0]
              try {
                speak(`Ho aggiunto ${product.name} al carrello.`)
                await addItem({
                  productId: String(product.id),
                  variantId: String(product.variants[0]?.id),
                })
                router.replace('/cart', undefined, { shallow: true })
              } catch (err) {
                router.back()
                speak(
                  `Ho avuto un problema ad aggiungere ${product.name} al carrello. Riprova.`
                )
              }
            } else {
              router.back()
              speak(`Mi spiace ma non ho trovato ${q}. Prova un altro titolo.`)
            }
            break
          }
        }
      }
    }

    alexaEvents()
  }, [
    addItem,
    alexa,
    alexaIntentName,
    data,
    data?.found,
    data?.products,
    q,
    router,
    speak,
  ])

  if (loading) {
    return null
  }

  return (
    <Layout pageProps={{ categories }}>
      <Container clean>
        <div className="search">
          {/* Products */}
          <div className="px-7 md:px-16 lg:px-28 xl:px-36 pt-2 pb-28">
            {q ? (
              <div className="flex flex-1 justify-between mb-4 transition ease-in duration-75">
                {data ? (
                  <>
                    <span
                      className={cn('animated', {
                        fadeIn: data.found,
                        hidden: !data.found,
                      })}
                    >
                      {data.products.length} risultati{' '}
                      {q && (
                        <>
                          per "<strong>{q}</strong>"
                        </>
                      )}
                    </span>
                    <span
                      className={cn('animated', {
                        fadeIn: !data.found,
                        hidden: data.found,
                      })}
                    >
                      {q ? (
                        <>
                          Nessun gioco trovato con "<strong>{q}</strong>"
                        </>
                      ) : (
                        <>Non ci sono giochi in questa categoria.</>
                      )}
                    </span>
                  </>
                ) : q ? (
                  <div>
                    Cerco per: "<strong>{q}</strong>"...
                  </div>
                ) : (
                  <>Cerco...</>
                )}
              </div>
            ) : (
              <div className="flex flex-1 justify-between mb-4">
                <span>Lista giochi</span>
                <span>Ordina per: Più venduti</span>
              </div>
            )}
            {data ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {data.products.map((product: Product, index: number) => (
                  <ProductCard
                    variant="simple"
                    key={product.path}
                    className="animated fadeIn"
                    product={product}
                    priority={index < 10}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {rangeMap(20, (i) => (
                  <Skeleton key={i}>
                    <div className="w-60 h-60" />
                  </Skeleton>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Layout>
  )
}

Search.Layout = Layout
