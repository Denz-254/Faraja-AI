import { useCallback, useEffect, useRef, useState } from 'react'
import { Conversation } from '@elevenlabs/client'
import {
  createVoiceSession,
  getVoiceStatus,
  type Mood,
  type VoiceMode,
  type VoiceSession,
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

function formatVoiceError(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.message
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    try {
      return JSON.stringify(value)
    } catch {
      return 'Voice connection error'
    }
  }
  return 'Voice connection error'
}

function resolveSessionCredentials(voiceSession: VoiceSession) {
  const token =
    voiceSession.conversation_token?.trim() ||
    (voiceSession as { conversationToken?: string }).conversationToken?.trim() ||
    ''
  const signedUrl =
    voiceSession.signed_url?.trim() ||
    (voiceSession as { signedUrl?: string }).signedUrl?.trim() ||
    ''
  const agentId = voiceSession.agent_id?.trim() || ''

  if (token) {
    return { kind: 'webrtc' as const, conversationToken: token, agentId }
  }
  if (signedUrl) {
    return { kind: 'websocket' as const, signedUrl, agentId }
  }
  if (agentId) {
    return { kind: 'agent' as const, agentId }
  }
  return null
}

export function useFarajaVoice(options: UseFarajaVoiceOptions = {}) {
  const { session } = useAuth()
  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(
    null,
  )
  const startingRef = useRef(false)
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

  const endConversation = useCallback(async (markEnded: boolean) => {
    const current = conversationRef.current
    conversationRef.current = null
    startingRef.current = false
    setActive(false)
    if (markEnded) setPhase('ended')
    if (current) {
      try {
        await current.endSession()
      } catch {
        // already closed
      }
    }
  }, [])

  const stop = useCallback(async () => {
    await endConversation(true)
  }, [endConversation])

  const start = useCallback(async () => {
    if (!session) {
      setError('Please sign in first.')
      return
    }
    if (startingRef.current || conversationRef.current) return

    startingRef.current = true
    setError('')
    setTranscript([
      {
        id: 'opening',
        role: 'system',
        text: 'Requesting microphone and connecting to Faraja…',
      },
    ])
    setPhase('connecting')
    setActive(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())

      const voiceSession = await createVoiceSession(session.token, {
        mode: options.mode ?? 'proactive',
        mood: options.mood,
        comfort_text: options.comfortText,
      })

      const creds = resolveSessionCredentials(voiceSession)
      if (!creds) {
        throw new Error(
          'Voice session response had no conversation token, signed URL, or agent id. Rebuild/restart the backend.',
        )
      }

      const contextBits = [
        options.mode === 'proactive' ? 'This is a proactive check-in started by Faraja.' : null,
        options.mood ? `User mood check-in: ${options.mood}.` : null,
        options.comfortText ? `Recent comfort note: ${options.comfortText}` : null,
      ].filter(Boolean)

      const sharedCallbacks = {
        onConnect: () => {
          setPhase('listening')
          setTranscript((prev) => [
            ...prev,
            {
              id: `connected-${Date.now()}`,
              role: 'system' as const,
              text: 'Live. Speak when ready — or wait for Faraja’s greeting.',
            },
          ])
        },
        onDisconnect: (details: unknown) => {
          conversationRef.current = null
          startingRef.current = false
          setActive(false)
          setPhase('ended')
          const reason =
            details && typeof details === 'object' && 'reason' in details
              ? String((details as { reason?: string }).reason ?? '')
              : ''
          if (reason && reason !== 'user') {
            setError((prev) => prev || `Call ended (${reason}). Try Start again.`)
          }
        },
        onError: (message: unknown) => {
          setError(formatVoiceError(message))
          setPhase('ended')
          setActive(false)
          startingRef.current = false
          conversationRef.current = null
        },
        onModeChange: (payload: { mode: string }) => {
          if (payload.mode === 'speaking') setPhase('speaking')
          if (payload.mode === 'listening') setPhase('listening')
        },
        onMessage: (message: { source?: string; message?: string }) => {
          const role = message.source === 'user' ? 'user' : 'agent'
          const text = message.message?.trim()
          if (!text) return
          setTranscript((prev) => [
            ...prev.filter((line) => line.role !== 'system'),
            {
              id: `${role}-${Date.now()}-${prev.length}`,
              role,
              text,
            },
          ])
        },
      }

      // No prompt/firstMessage overrides — those drop the call if not enabled on the agent.
      let conversation: Awaited<ReturnType<typeof Conversation.startSession>>

      if (creds.kind === 'webrtc') {
        setTranscript((prev) => [
          ...prev,
          {
            id: 'mode-webrtc',
            role: 'system',
            text: 'Using WebRTC voice connection…',
          },
        ])
        conversation = await Conversation.startSession({
          conversationToken: creds.conversationToken,
          connectionType: 'webrtc',
          ...sharedCallbacks,
        })
      } else if (creds.kind === 'websocket') {
        setTranscript((prev) => [
          ...prev,
          {
            id: 'mode-ws',
            role: 'system',
            text: 'Using WebSocket voice connection…',
          },
        ])
        conversation = await Conversation.startSession({
          signedUrl: creds.signedUrl,
          connectionType: 'websocket',
          ...sharedCallbacks,
        })
      } else {
        setTranscript((prev) => [
          ...prev,
          {
            id: 'mode-agent',
            role: 'system',
            text: 'Connecting with agent id…',
          },
        ])
        conversation = await Conversation.startSession({
          agentId: creds.agentId,
          connectionType: 'webrtc',
          ...sharedCallbacks,
        })
      }

      conversationRef.current = conversation
      startingRef.current = false

      if (contextBits.length) {
        try {
          conversation.sendContextualUpdate(contextBits.join(' '))
        } catch {
          // optional
        }
      }
    } catch (err) {
      startingRef.current = false
      setActive(false)
      setPhase('idle')
      const message = formatVoiceError(err)
      if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('not allowed')) {
        setError('Microphone permission is required. Allow the mic and try again.')
      } else {
        setError(message || 'Could not start Faraja')
      }
    }
  }, [session, options.mode, options.mood, options.comfortText])

  useEffect(() => {
    return () => {
      void endConversation(false)
    }
  }, [endConversation])

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
