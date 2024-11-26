import { Clock } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [hours, setHours] = useState<string>('00')
  const [minutes, setMinutes] = useState<string>('00')

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      setHours(h.padStart(2, '0'))
      setMinutes(m.padStart(2, '0'))
    } else {
      setHours('00')
      setMinutes('00')
    }
  }, [value])

  const updateTime = (newHours: string, newMinutes: string): void => {
    const time = `${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`
    if (onChange) {
      onChange(time)
    }
  }

  const handleClick = (): void => {
    const elem = document.activeElement
    if (elem) {
      ;(elem as HTMLElement)?.blur()
    }
  }

  return (
    <div className="dropdown">
      <button tabIndex={0} className="btn btn-outline input-bordered w-32 justify-start">
        <Clock className="mr-2 h-4 w-4" />
        {value && (hours !== '00' || minutes !== '00') ? `${hours}:${minutes}` : 'Aeg'}
      </button>
      <div
        tabIndex={0}
        className="border-base dropdown-content z-10 w-48 rounded-box border bg-base-100 p-2"
      >
        <div className="flex space-x-2">
          <select
            className="select select-bordered w-full max-w-xs"
            value={hours}
            onChange={(e) => {
              const newHours = e.target.value
              setHours(newHours)
              updateTime(newHours, minutes)
            }}
          >
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <option key={hour} value={hour.toString().padStart(2, '0')}>
                {hour.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered w-full max-w-xs"
            value={minutes}
            onChange={(e) => {
              const newMinutes = e.target.value
              setMinutes(newMinutes)
              updateTime(hours, newMinutes)
            }}
          >
            {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
              <option key={minute} value={minute.toString().padStart(2, '0')}>
                {minute.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleClick} className="btn-base btn btn-sm mt-2 w-full">
          Salvesta
        </button>
      </div>
    </div>
  )
}

export default TimePicker
