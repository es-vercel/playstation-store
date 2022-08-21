import cn from 'clsx'
import Link from 'next/link'
import s from './UserNav.module.css'
import { Avatar } from '@components/common'
import useCart from '@framework/cart/use-cart'
import { useUI } from '@components/ui/context'
import { Heart, Bag, Menu } from '@components/icons'
import CustomerMenuContent from './CustomerMenuContent'
import useCustomer from '@framework/customer/use-customer'
import React from 'react'
import {
  Dropdown,
  DropdownTrigger as DropdownTriggerInst,
  Button,
} from '@components/ui'

import type { LineItem } from '@commerce/types/cart'

const countItem = (count: number, item: LineItem) => count + item.quantity

const UserNav: React.FC<{
  className?: string
}> = ({ className }) => {
  const { data } = useCart()
  const { data: isCustomerLoggedIn } = useCustomer()
  const {
    toggleSidebar,
    closeSidebarIfPresent,
    openModal,
    setSidebarView,
    openSidebar,
  } = useUI()

  const itemsCount = data?.lineItems.reduce(countItem, 0) ?? 0
  const DropdownTrigger = isCustomerLoggedIn
    ? DropdownTriggerInst
    : React.Fragment

  return (
    <nav className={cn(s.root, className)}>
      <ul className={s.list}>
        <li className={s.item}>
          <Link href="/search">
            <a className={s.button} aria-label="Cart">
              <div className={s.iconContainer}>
                <svg
                  fill="currentColor"
                  width={32}
                  height={32}
                  viewBox="0 0 20 20"
                >
                  <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                </svg>
              </div>
            </a>
          </Link>
        </li>
        {process.env.COMMERCE_WISHLIST_ENABLED && (
          <li className={s.item}>
            <Link href="/wishlist">
              <a className={s.button} aria-label="Wishlist">
                <svg
                  fill="currentColor"
                  width={26}
                  height={26}
                  viewBox="0 0 11 11"
                >
                  <path
                    d="M10.06,4.76c-1.1682,1.9568-2.5794,3.7577-4.2,5.36c-0.1865,0.1961-0.4967,0.2038-0.6927,0.0173&#xA;&#x9;C5.1614,10.1316,5.1556,10.1259,5.15,10.12C3.5259,8.5183,2.1113,6.7173,0.94,4.76c-1.82-3.64,2.8-6.07,4.56-2.43&#xA;&#x9;C7.26-1.31,11.88,1.12,10.06,4.76z"
                  />
                </svg>{' '}
              </a>
            </Link>
          </li>
        )}
        {process.env.COMMERCE_CART_ENABLED && (
          // <li className={s.item}>
          //   <Button
          //     className={s.item}
          //     variant="naked"
          //     onClick={() => {
          //       setSidebarView('CART_VIEW')
          //       openSidebar()
          //     }}
          //     aria-label={`Cart items: ${itemsCount}`}
          //   >
          //     <Bag />
          // {itemsCount > 0 && (
          //   <span className={s.bagCount}>{itemsCount}</span>
          // )}
          //   </Button>
          // </li>
          <li className={s.item}>
            <Link href="/cart">
              <a aria-label="Cart" className={s.button}>
                {/* <Bag width={32} height={32} /> */}
                <svg
                  fill="currentColor"
                  width={34}
                  height={34}
                  viewBox="0 0 32 32"
                >
                  <path d="M10,20H23.438a3,3,0,0,0,2.911-2.272L28.66,8.484A2,2,0,0,0,26.719,6h-19L7.4,5.051A3,3,0,0,0,4.559,3H3A1,1,0,0,0,3,5H4.559a1,1,0,0,1,.949.684l.534,1.6c.006.019.012.037.019.054l3.565,10.7a2.984,2.984,0,0,0-.657,5.768A3,3,0,1,0,13.22,24h7.56a3,3,0,1,0,4.44,0H25.7a1,1,0,0,0,0-2H10a1,1,0,0,1,0-2Zm9.58-8-.166,2H16.18l-.333-2Zm-4.066-2L15.18,8h4.734l-.167,2Zm9.706,4h-3.8l.166-2H25.72Zm-8.373,4-.333-2h2.733l-.167,2Zm-2.694-4H10.388l-.667-2h4.1Zm.333,2,.334,2h-3.1l-.667-2Zm8.952,2H21.086l.167-2H24.72l-.311,1.242A1,1,0,0,1,23.438,18ZM26.72,8l-.5,2H21.753l.167-2ZM13.153,8l.333,2H9.054L8.388,8ZM23,27a1,1,0,1,1,1-1A1,1,0,0,1,23,27ZM11,27a1,1,0,1,1,1-1A1,1,0,0,1,11,27Z" />
                </svg>
                {itemsCount > 0 && (
                  <span className={s.bagCount}>{itemsCount}</span>
                )}
              </a>
            </Link>
          </li>
        )}

        {process.env.COMMERCE_CUSTOMERAUTH_ENABLED && (
          <li className={s.item}>
            <Dropdown>
              <DropdownTrigger>
                <button
                  aria-label="Menu"
                  className={s.button}
                  onClick={() => (isCustomerLoggedIn ? null : openModal())}
                >
                  <svg
                    width={28}
                    height={28}
                    viewBox="0 0 438.529 438.529"
                    fill="currentColor"
                  >
                    <path
                      d="M219.265,219.267c30.271,0,56.108-10.71,77.518-32.121c21.412-21.411,32.12-47.248,32.12-77.515
			c0-30.262-10.708-56.1-32.12-77.516C275.366,10.705,249.528,0,219.265,0S163.16,10.705,141.75,32.115
			c-21.414,21.416-32.121,47.253-32.121,77.516c0,30.267,10.707,56.104,32.121,77.515
			C163.166,208.557,189.001,219.267,219.265,219.267z"
                    />
                    <path
                      d="M419.258,335.036c-0.668-9.609-2.002-19.985-3.997-31.121c-1.999-11.136-4.524-21.457-7.57-30.978
			c-3.046-9.514-7.139-18.794-12.278-27.836c-5.137-9.041-11.037-16.748-17.703-23.127c-6.666-6.377-14.801-11.465-24.406-15.271
			c-9.617-3.805-20.229-5.711-31.84-5.711c-1.711,0-5.709,2.046-11.991,6.139c-6.276,4.093-13.367,8.662-21.266,13.708
			c-7.898,5.037-18.182,9.609-30.834,13.695c-12.658,4.093-25.361,6.14-38.118,6.14c-12.752,0-25.456-2.047-38.112-6.14
			c-12.655-4.086-22.936-8.658-30.835-13.695c-7.898-5.046-14.987-9.614-21.267-13.708c-6.283-4.093-10.278-6.139-11.991-6.139
			c-11.61,0-22.222,1.906-31.833,5.711c-9.613,3.806-17.749,8.898-24.412,15.271c-6.661,6.379-12.562,14.086-17.699,23.127
			c-5.137,9.042-9.229,18.326-12.275,27.836c-3.045,9.521-5.568,19.842-7.566,30.978c-2,11.136-3.332,21.505-3.999,31.121
			c-0.666,9.616-0.998,19.466-0.998,29.554c0,22.836,6.949,40.875,20.842,54.104c13.896,13.224,32.36,19.835,55.39,19.835h249.533
			c23.028,0,41.49-6.611,55.388-19.835c13.901-13.229,20.845-31.265,20.845-54.104C420.264,354.502,419.932,344.652,419.258,335.036
			z"
                    />
                  </svg>
                </button>
              </DropdownTrigger>
              <CustomerMenuContent />
            </Dropdown>
          </li>
        )}
        <li className={s.mobileMenu}>
          <Button
            className={s.item}
            aria-label="Menu"
            variant="naked"
            onClick={() => {
              setSidebarView('MOBILE_MENU_VIEW')
              openSidebar()
            }}
          >
            <Menu />
          </Button>
        </li>
      </ul>
    </nav>
  )
}

export default UserNav
