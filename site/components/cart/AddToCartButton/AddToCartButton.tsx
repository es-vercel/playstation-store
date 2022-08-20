import React, { FC, useState } from 'react'
import cn from 'clsx'
import { Button, useUI } from '@components/ui'
import { Heart } from '@components/icons'
import useCustomer from '@framework/customer/use-customer'
import s from './AddToCartButton.module.css'
import type { Product, ProductVariant } from '@commerce/types/product'
import usePrice from '@framework/product/use-price'
import { useCart, useAddItem } from '@framework/cart'
import { useRouter } from 'next/router'
import { useAlexa } from '@lib/hooks/useAlexa'

type Props = {
  product: Product
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const AddToCartButton: FC<Props> = ({ product }) => {
  const { speak } = useAlexa()
  const { data } = useCart()
  const addItem = useAddItem()
  const { price } = usePrice({
    amount: product.price.value,
    baseAmount: product.price.retailPrice,
    currencyCode: product.price.currencyCode!,
  })
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // @ts-ignore
  const itemInCart = data?.lineItems?.find(
    (item: any) =>
      item.productId === product.id &&
      item.variantId === String(product.variants[0]?.id)
  )

  const handleCartItemChange = async (e: any) => {
    e.preventDefault()

    if (loading) return

    // // A login is required before adding an item to the cart
    // if (!customer) {
    //   setModalView('LOGIN_VIEW')
    //   return openModal()
    // }

    try {
      if (itemInCart) {
        return router.push('/cart')
      } else {
        setLoading(true)
        await addItem({
          productId: String(product.id),
          variantId: String(product.variants[0]?.id),
        })
        speak(`Hai aggiunto ${product.name} al carrello.`)
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <Button
      aria-label="Aggiungi al carrello"
      type="button"
      variant="psstore"
      onClick={handleCartItemChange}
      loading={loading}
      disabled={product.variants[0]?.availableForSale === false}
    >
      {product.variants[0]?.availableForSale === false
        ? 'Non disponibile'
        : itemInCart
        ? 'Nel carrello'
        : price}
    </Button>
  )
}

export default AddToCartButton
