import type { GetStaticPropsContext } from 'next'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import commerce from '@lib/api/commerce'
import { Layout, NavbarHeader } from '@components/common'
import { Button, Text, Container, Image } from '@components/ui'
import { Bag, Cross, Check, MapPin, CreditCard } from '@components/icons'
import { CartItem } from '@components/cart'
import { useUI } from '@components/ui/context'
import { useAlexa } from '@lib/hooks/useAlexa'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import useRemoveItem from '@framework/cart/use-remove-item'
import { useCustomer } from '@framework/customer'
import BackgroundImage from '../public/background.webp'
import CartImage from '../public/cart.webp'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise
  return {
    props: { pages, categories },
  }
}

export default function Cart({ categories }: any) {
  const error = null
  const success = null
  const { data, isLoading, isEmpty } = useCart()
  // const { openSidebar, setSidebarView } = useUI()
  const { alexa, speak, nakamoto, missions } = useAlexa()
  const removeItem = useRemoveItem()
  // const updateItem = useUpdateItem()
  const router = useRouter()
  // const { data: isCustomerLoggedIn } = useCustomer()

  const { price: subTotal } = usePrice(
    data && {
      amount: Number(data.subtotalPrice),
      currencyCode: data.currency.code,
    }
  )
  const { price: total } = usePrice(
    data && {
      amount: Number(data.totalPrice),
      currencyCode: data.currency.code,
    }
  )

  const alexaIntent = useMemo(() => {
    if (router.query.intent) {
      // @ts-ignore
      return JSON.parse(router.query.intent)
    } else {
      return null
    }
  }, [router.query.intent])

  useEffect(() => {
    async function alexaEvents() {
      if (!alexaIntent?.intent || !alexa) {
        return
      }

      switch (alexaIntent.intent) {
        case 'OpenCartIntent': {
          if (!data) {
            speak('Il carrello è vuoto')
          } else {
            const games = data?.lineItems.map(
              (game: any) =>
                `Hai ${game.quantity} copi${game.quantity > 1 ? 'e' : 'a'} di ${
                  game.name
                } che costa ${game.variant.price} euro`
            )
            const qty = data?.lineItems.length
            const totalPrice = data?.totalPrice
            const gameListMessage = games?.join(', poi ')

            speak(
              `Il tuo carrello contiene ${qty} gioch${
                qty > 1 ? 'i' : 'o'
              }. ${gameListMessage}. Per un totale di ${totalPrice} euro, tasse incluse.`
            )
          }
          break
        }
        case 'ReadCartItemIntent': {
          const game = data?.lineItems.find((game: any) =>
            game.name
              .toLowerCase()
              .includes(alexaIntent.gameTitle.toLowerCase())
          )
          if (!game) {
            speak('Gioco non presente nel carrello')
          } else {
            const speakQuantity = `Hai ${game.quantity} copi${
              game.quantity > 1 ? 'e' : 'a'
            } di ${game.name} per un totale di ${
              game.variant.price * game.quantity
            } euro`

            speak(speakQuantity)
          }
          break
        }
        case 'DeleteCartItemIntent': {
          const game = data?.lineItems.find((game: any) =>
            game.name
              .toLowerCase()
              .includes(alexaIntent.gameTitle.toLowerCase())
          )
          if (!game) {
            speak(
              `Mi spiace, non ho trovato ${alexaIntent.gameTitle} nel carrello`
            )
          } else {
            router.replace('/cart', undefined, { shallow: true })
            await removeItem(game)
            speak(`${game.name} è stato rimosso dal carrello!`)
          }
          break
        }
        case 'ClearCartIntent': {
          if (!data) {
            speak('Il tuo carrello è già vuoto!')
          } else {
            router.replace('/cart', undefined, { shallow: true })
            for (const game of data.lineItems) {
              await removeItem(game)
            }
            speak(`Ho svuotato il tuo carrello!`)
          }
          break
        }
        case 'CheckoutIntent': {
          if (!data) {
            speak('Mi spiace, il tuo carrello è vuoto!')
            break
          }

          // if (!isCustomerLoggedIn) {
          //   speak('Accedi prima di effettuare il pagamento')
          //   // TODO: fai comparire la modale di login
          //   break
          // }

          speak(
            'Ok, ti sto reindirizzando verso BigCommerce per il pagamento!!!'
          )
          router.push('/checkout')
          break
        }
        // case 'UpdateCartItemIntent': {
        //   const game = data?.lineItems.find((game: any) =>
        //     game.name
        //       .toLowerCase()
        //       .includes(alexaIntent.gameTitle.toLowerCase())
        //   )
        //   if (!game) {
        //     speak(
        //       `Mi spiace, non ho trovato ${alexaIntent.gameTitle} nel carrello`
        //     )
        //   } else {
        //     await updateItem(game)
        //     speak(`${game.name} è stato modificato nel carrello!`)
        //   }
        //   break
        // }
      }
    }

    alexaEvents()
  }, [alexa, alexaIntent, data, removeItem, router, speak])

  useEffect(() => {
    const items = data?.lineItems

    if (items && items.length === 3) {
      const [p1, p2, p3] = items

      if (
        !missions.mission1.completed &&
        p1.name.charAt(0).toLowerCase() === 'n' &&
        p2.name.charAt(0).toLowerCase() === 'f' &&
        p3.name.charAt(0).toLowerCase() === 't'
      ) {
        missions.mission1.setCompleted(true)
        console.log('mission1 completed')
        setTimeout(() => {
          speak('Ben fatto Francesco, ti rimangono altri 2 obiettivi.', 'paolo')
        }, 3000)
      }

      if (
        !missions.mission2.completed &&
        p1.quantity === 13 &&
        p2.quantity === 9 &&
        p3.quantity == 2022
      ) {
        missions.mission2.setCompleted(true)
        console.log('mission2 completed')
        setTimeout(() => {
          router.push('/nft')
          speak(
            "Seconda prova completata, ottimo. Rimane l'ultimo obiettivo. Scatta una foto al pubblico che hai davanti. VELOCE!",
            'paolo'
          )
        }, 3000)
      }
    }
  }, [
    data?.lineItems,
    missions.mission1,
    missions.mission1.completed,
    missions.mission2,
    missions.mission2.completed,
    router,
    speak,
  ])

  return (
    <Container className="max-w-none w-full" clean>
      {!nakamoto && (
        <div className="bgWrap">
          <Image
            alt="Background"
            src={BackgroundImage}
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
      )}
      <NavbarHeader
        title={
          data?.lineItems.length! > 0
            ? `Carrello: ${data?.lineItems.length}`
            : 'Carrello'
        }
        imageUrl={CartImage}
      />
      <div className="px-36 py-0 relative grid grid-cols-12 gap-2">
        {isLoading || isEmpty ? (
          <div className="col-span-12 px-12 py-40 flex flex-col justify-center items-center bg-gray-900 bg-opacity-70 p-5">
            {/* <div className="border-2 border-dashed flex items-center justify-center w-16 h-16 p-12 rounded-lg text-primary">
              <Bag className="absolute" />
            </div> */}
            <h2 className="text-2xl font-bold text-center">
              Il tuo carrello è vuoto
            </h2>
            {/* <p className="text-accent-6 px-10 text-center pt-2">
                Biscuit oat cake wafer icing ice cream tiramisu pudding cupcake.
              </p> */}
          </div>
        ) : (
          <div className="col-span-7">
            {data!.lineItems.map((item: any) => (
              <CartItem
                key={item.id}
                item={item}
                currencyCode={data?.currency.code!}
              />
            ))}
          </div>
        )}
        {!isEmpty && (
          <div className="col-span-5 bg-gray-900 bg-opacity-70 p-10 mb-2">
            <div className="text-4xl mb-10">Riepilogo ordine</div>
            <ul className="py-3 text-xl">
              <li className="flex justify-between py-1 ">
                <span>Subtotale</span>
                <span>{subTotal}</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Tasse</span>
                <span>22%</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Spedizione</span>
                <span>Gratis</span>
              </li>
            </ul>
            <div className="flex justify-between border-t border-white border-opacity-20 py-3 font-bold text-2xl">
              <span>Totale </span>
              <span className="font-bold">{total}</span>
            </div>
            <div className="flex mt-10">
              <Button href="/checkout" Component="a" variant="psstore-lg">
                Vai al pagamento
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

Cart.Layout = Layout
