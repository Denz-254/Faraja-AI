import { useCallback, useEffect, useRef, useState } from 'react'
import { Conversation } from '@elevenlabs/client'
import {
  createVoiceSession,
  getVoiceStatus,
  type Mood,
  type VoiceMode,
  type VoiceStatus,
} from '../api/client'
import { useAuth } from '../hooks/useAuth'

export type TranscriptLine = {
  id: string
  role: 'user' | 'agent' | 'system'
  text: string
}

type UseFarajaVoiceOptions = {
  mode?: VoiceMode
  mood?: Mood
  comfortText?: string
}

export function useFarajaVoice(options: UseFarajaVoiceOptions = {}) {
  const { session } = useAuth()
  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(
    null,
  )
  const [status, setStatus] = useState<VoiceStatus | null>(null)
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'ended'>(
    'idle',
  )
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!session) return
    getVoiceStatus(session.token)
      .then(setStatus)
      .catch((err: Error) => setError(err.message))
  }, [session])

  const stop = useCallback(async () => {
    const current = conversationRef.current
    conversationRef.current = null
    setActive(false)
    setPhase('ended')
    if (current) {
      try {
        await current.endSession()
      } catch {
        // already closed
      }
    }
  }, [])

  const start = useCallback(async () => {
    if (!session) {
      setError('Please sign in first.')
      return
    }

    setError('')
    setTranscript([])
    setPhase('connecting')
    setActive(true)

    try {
      const voiceSession = await createVoiceSession(session.token, {
        mode: options.mode ?? 'proactive',
        mood: options.mood,
        comfort_text: options.comfortText,
      })

      setTranscript([
        {
          id: 'opening',
          role: 'system',
          text: 'Faraja is starting the conversation…',
        },
      ])

      const conversation = await Conversation.startSession({
        signedUrl: voiceSession.signed_url,
        connectionType: 'websocket',
        overrides: {
          agent: {
            prompt: {
              prompt: voiceSession.system_prompt,
            },
            firstMessage: voiceSession.first_message,
            language: 'en',
          },
        },
        onConnect: () => {
          setPhase('listening')
        },
        onDisconnect: () => {
          setActive(false)
          setPhase('ended')
          conversationRef.current = null
        },
        onError: (message) => {
          setError(typeof message === 'string' ? message : 'Voice connection error')
          setPhase('ended')
          setActive(false)
        },
        onModeChange: (payload) => {
          if (payload.mode === 'speaking') setPhase('speaking')
          if (payload.mode === 'listening') setPhase('listening')
        },
        onMessage: (message) => {
          const role = message.source === 'user' ? 'user' : 'agent'
          const text = message.message?.trim()
          if (!text) return
          setTranscript((prev) => [
            ...prev,
            {
              id: `${role}-${Date.now()}-${prev.length}`,
              role,
              text,
            },
          ])
        },
      })

      conversationRef.current = conversation
    } catch (err) {
      setActive(false)
      setPhase('idle')
      setError(err instanceof Error ? err.message : 'Could not start Faraja')
    }
  }, [session, options.mode, options.mood, options.comfortText])

  useEffect(() => {
    return () => {
      void stop()
    }
  }, [stop])

  return {
    status,
    phase,
    error,
    transcript,
    active,
    start,
    stop,
  }
}
