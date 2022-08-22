import { FC, useState } from 'react'
import cn from 'clsx'
import Link from 'next/link'
import Image from 'next/image'
import s from './WishlistCard.module.css'
import { Trash } from '@components/icons'
import { Button, Text } from '@components/ui'

import { useUI } from '@components/ui/context'
import type { Product } from '@commerce/types/product'
import usePrice from '@framework/product/use-price'
import useAddItem from '@framework/cart/use-add-item'
import useRemoveItem from '@framework/wishlist/use-remove-item'
import type { Wishlist } from '@commerce/types/wishlist'
import { AddToCartButton } from '@components/cart'
import { convert } from 'html-to-text'

const placeholderImg = '/product-img-placeholder.svg'

const WishlistCard: React.FC<{
  item: Wishlist
}> = ({ item }) => {
  const product: Product = item.product
  const { price } = usePrice({
    amount: product.price?.value,
    baseAmount: product.price?.retailPrice,
    currencyCode: product.price?.currencyCode!,
  })
  // @ts-ignore Wishlist is not always enabled
  const removeItem = useRemoveItem({ wishlist: { includeProducts: true } })
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)

  // TODO: fix this missing argument issue
  /* @ts-ignore */
  const addItem = useAddItem()
  const { openSidebar } = useUI()

  const handleRemove = async () => {
    setRemoving(true)

    try {
      // If this action succeeds then there's no need to do `setRemoving(true)`
      // because the component will be removed from the view
      await removeItem({ id: item.id! })
    } catch (error) {
      setRemoving(false)
    }
  }

  return (
    <div className={cn(s.root, { 'opacity-50 pointer-events-none': removing })}>
      <div className="flex flex-row gap-5">
        <Link href={`/product/${product.path}`}>
          <a className="inline-flex">
            <Image
              className={s.productImage}
              width={200}
              height={200}
              layout="fixed"
              sizes="12vw"
              src={product.images[0]?.url || placeholderImg}
              alt={product.images[0]?.alt || 'Product Image'}
            />
          </a>
        </Link>
        <div className="flex flex-1 flex-col justify-between py-2">
          <div className="flex">
            <div className="flex-1">
              <Link href={`/product/${product.path}`} tabIndex={-1}>
                <a className="inline-flex" tabIndex={-1}>
                  <span className={s.productName}>{product.name}</span>
                </a>
              </Link>
            </div>
          </div>
          <div className="text-lg opacity-75 w-2/3 line-clamp-2">
            {convert(product.description)}
          </div>
          <div className="flex gap-4">
            <AddToCartButton product={product} variant="psstore-md" />
            <Button
              aria-label="Rimuovi"
              type="button"
              variant="psstore-md"
              onClick={handleRemove}
              loading={loading}
            >
              Rimuovi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WishlistCard

/* <div className={s.description}>
      <div className="flex-1 mb-6">
        <h3 className="text-2xl mb-2 -mt-1">
          <Link href={`/product${product.path}`}>
            <a>{product.name}</a>
          </Link>
        </h3>
        <div className="mb-4">
          <Text html={product.description} />
        </div>
      </div>
      <div>
        <Button
          width={260}
          aria-label="Add to Cart"
          type="button"
          onClick={addToCart}
          loading={loading}
        >
          Add to Cart
        </Button>
      </div>
    </div>
    <div className={s.actions}>
      <div className="flex justify-end font-bold">{price}</div>
      <div className="flex justify-end mt-4 lg:mt-0">
        <button onClick={handleRemove}>
          <Trash />
        </button>
      </div>
    </div>
  </div> */
