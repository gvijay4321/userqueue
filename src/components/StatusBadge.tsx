import React from 'react'
import { CheckCircle, Clock, Phone, MapPin, X, AlertCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    waiting: {
      icon: Clock,
      text: 'Waiting in Queue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text_color: 'text-blue-700',
      icon_color: 'text-blue-500'
    },
    called: {
      icon: Phone,
      text: 'You are being called!',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text_color: 'text-orange-700',
      icon_color: 'text-orange-500'
    },
    seated: {
      icon: MapPin,
      text: 'Please proceed to your table',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text_color: 'text-green-700',
      icon_color: 'text-green-500'
    },
    done: {
      icon: CheckCircle,
      text: 'Completed. Thank you!',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text_color: 'text-emerald-700',
      icon_color: 'text-emerald-500'
    },
    cancelled: {
      icon: X,
      text: 'Cancelled',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text_color: 'text-red-700',
      icon_color: 'text-red-500'
    },
    no_show: {
      icon: AlertCircle,
      text: 'Marked no-show',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text_color: 'text-gray-700',
      icon_color: 'text-gray-500'
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.icon_color}`} />
      <span className={`text-sm font-medium ${config.text_color}`}>
        {config.text}
      </span>
    </div>
  )
}