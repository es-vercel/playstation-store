import React, { FC, useState } from 'react'
import cn from 'clsx'
import { Button, useUI } from '@components/ui'
import { Heart } from '@components/icons'
import useAddItem from '@framework/wishlist/use-add-item'
import useCustomer from '@framework/customer/use-customer'
import useWishlist from '@framework/wishlist/use-wishlist'
import useRemoveItem from '@framework/wishlist/use-remove-item'
import s from './WishlistButton.module.css'
import type { Product, ProductVariant } from '@commerce/types/product'
import { useAlexa } from '@lib/hooks/useAlexa'

type Props = {
  productId: Product['id']
  variant: ProductVariant
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const WishlistButton: FC<Props> = ({ productId, variant, ...props }) => {
  const { speak } = useAlexa()
  const { data } = useWishlist()
  const addItem = useAddItem()
  const removeItem = useRemoveItem()
  const { data: customer } = useCustomer()
  const { openModal, setModalView } = useUI()
  const [loading, setLoading] = useState(false)

  // @ts-ignore Wishlist is not always enabled
  const itemInWishlist = data?.items?.find(
    // @ts-ignore Wishlist is not always enabled
    (item) =>
      item.product_id === Number(productId) &&
      item.variant_id === Number(variant.id)
  )

  const handleWishlistChange = async (e: any) => {
    e.preventDefault()

    if (loading) return

    // A login is required before adding an item to the wishlist
    if (!customer) {
      setModalView('LOGIN_VIEW')
      return openModal()
    }

    setLoading(true)

    try {
      if (itemInWishlist) {
        await removeItem({ id: itemInWishlist.id! })
        speak(`Rimosso dalla lista dei desideri!}`)
      } else {
        await addItem({
          productId,
          variantId: variant?.id!,
        })
        speak(`Aggiunto alla lista dei desideri!}`)
      }

      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <Button
      aria-label="Lista dei desideri"
      variant="psstore"
      className="whitespace-nowrap"
      onClick={handleWishlistChange}
      loading={loading}
      {...props}
    >
      <Heart
        className={cn(s.icon, {
          [s.inWishlist]: itemInWishlist,
        })}
      />
      Lista dei desideri
    </Button>
  )
}

export default WishlistButton
