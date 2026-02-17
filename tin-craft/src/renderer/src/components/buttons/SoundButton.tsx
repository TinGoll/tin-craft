import { FC } from 'react'
import { soundManager } from '@renderer/utils/SoundManager'

type SoundButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  soundSrc?: string
  volume?: number
}

export const SoundButton: FC<SoundButtonProps> = ({ onClick, disabled, children, ...rest }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (disabled) {
      return
    }

    soundManager.playClick()
    onClick?.(e)
  }

  return (
    <button {...rest} disabled={disabled} onClick={handleClick}>
      {children}
    </button>
  )
}
