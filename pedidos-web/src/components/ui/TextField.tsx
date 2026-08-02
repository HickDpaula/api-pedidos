import type { InputHTMLAttributes } from 'react'

const INPUT_CLASS =
  'w-full rounded-lg border border-foody-border px-3 py-2.5 outline-none transition focus:border-foody-red focus:ring-2 focus:ring-foody-red/20'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function TextField({
  label,
  type = 'text',
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-foody-dark">
          {label}
        </label>
      )}
      <input type={type} className={`${INPUT_CLASS} ${className}`} {...props} />
    </div>
  )
}
