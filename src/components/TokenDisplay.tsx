import React from 'react'
import { Ticket, Users } from 'lucide-react'

interface TokenDisplayProps {
  tokenNumber: number
  peopleCount: number
  queuePosition: number
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ 
  tokenNumber, 
  peopleCount, 
  queuePosition 
}) => {
  const getOrdinalSuffix = (num: number) => {
    if (num === 1) return 'st'
    if (num === 2) return 'nd'
    if (num === 3) return 'rd'
    return 'th'
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <Ticket className="w-8 h-8 text-blue-600" />
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Your Token</p>
          <div className="text-6xl font-bold text-gray-900">
            #{tokenNumber}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
          </span>
        </div>

        {queuePosition > 0 && (
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-2xl font-bold text-blue-900">
              {queuePosition}{getOrdinalSuffix(queuePosition)}
            </p>
            <p className="text-sm text-blue-700 font-medium">
              in the queue
            </p>
          </div>
        )}
        
        {queuePosition === 0 && (
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xl font-bold text-green-900">
              ✨ You're next!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}