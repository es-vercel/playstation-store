import React, { FC } from 'react'
import s from './Quantity.module.css'
import { Cross, Plus, Minus } from '@components/icons'
import cn from 'clsx'
export interface QuantityProps {
  value: number
  increase: () => any
  decrease: () => any
  handleRemove: React.MouseEventHandler<HTMLButtonElement>
  handleChange: React.ChangeEventHandler<HTMLInputElement>
  max?: number
}

const Quantity: FC<QuantityProps> = ({
  value,
  increase,
  decrease,
  handleChange,
  handleRemove,
  max = 6,
}) => {
  return (
    <div className="flex flex-row h-9">
      <button className={s.actions} onClick={handleRemove}>
        Rimuovi
      </button>
      <label className="w-full ml-2">
        <input
          className={s.input}
          // onChange={(e) =>
          //   Number(e.target.value) < max + 1 ? handleChange(e) : () => {}
          // }
          onChange={handleChange}
          value={value}
          type="string"
          // max={3000}
          // min="0"
          // readOnly
        />
      </label>
      <button
        type="button"
        onClick={decrease}
        className={s.actions}
        style={{ marginLeft: '1px' }}
        disabled={value <= 1}
      >
        <Minus width={18} height={18} />
      </button>
      <button
        type="button"
        onClick={increase}
        className={cn(s.actions)}
        style={{ marginLeft: '1px' }}
        disabled={value < 1}
      >
        <Plus width={18} height={18} />
      </button>
    </div>
  )
}

export default Quantity
