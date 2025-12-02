"use client"

import { useState, useEffect, useRef } from 'react'
import { ServiceCall } from '@/lib/types/service-calls'
import { Button } from '@/components/ui/button'
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone, AlertCircle, Users, Volume2, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { CallStatus } from '@/lib/types/service-calls'

interface ServiceCallRoomProps {
    serviceCall: ServiceCall
    onCallEnd: () => void
    onCallAccepted: () => void
    callStatus: CallStatus
    callDuration: number
    onRetry?: () => void
    retrying?: boolean
}

export function ServiceCallRoom({
    serviceCall,
    onCallEnd,
    onCallAccepted,
    callStatus,
    callDuration,
    onRetry,
    retrying = false
}: ServiceCallRoomProps) {
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [videoEnabled, setVideoEnabled] = useState(true)
    const [localCallStatus, setLocalCallStatus] = useState<CallStatus>(callStatus)
    const [showRingtoneControls, setShowRingtoneControls] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        setLocalCallStatus(callStatus)

        if (callStatus === 'connecting') {
            const timer = setTimeout(() => {
                onCallAccepted()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [callStatus, onCallAccepted])

    // Handle ringing sound
    useEffect(() => {
        if (localCallStatus === 'ringing') {
            try {
                audioRef.current = new Audio('/sounds/ringtone.mp3')
                audioRef.current.loop = true
                audioRef.current.volume = 0.3

                const playPromise = audioRef.current.play()

                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        setShowRingtoneControls(true)
                    })
                }
            } catch (error) {
                console.error('Error playing ringtone:', error)
                setShowRingtoneControls(true)
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            setShowRingtoneControls(false)
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [localCallStatus])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleEndCall = async () => {
        try {
            onCallEnd()
        } catch (error) {
            toast.error('Failed to end call. Please try again.')
            console.error('Error ending call:', error)
        }
    }

    const handleRetryCall = () => {
        if (onRetry) {
            onRetry()
        }
    }

    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled)
        toast.info(`Microphone ${!audioEnabled ? 'enabled' : 'muted'}`)
    }

    const toggleVideo = () => {
        setVideoEnabled(!videoEnabled)
        toast.info(`Camera ${!videoEnabled ? 'enabled' : 'disabled'}`)
    }

    const handlePlayRingtone = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setShowRingtoneControls(false))
                .catch(error => {
                    toast.error('Could not play ringtone. Please check your browser permissions.')
                    console.error('Ringtone play error:', error)
                })
        }
    }

    const getStatusIcon = () => {
        switch (localCallStatus) {
            case 'ringing':
                return <Phone className="w-14 h-14 text-white animate-pulse" />
            case 'connecting':
                return <RotateCw className="w-14 h-14 text-white animate-spin" />
            case 'connected':
                return <Users className="w-14 h-14 text-white" />
            case 'failed':
            case 'ended':
                return <AlertCircle className="w-14 h-14 text-white" />
            default:
                return <Phone className="w-14 h-14 text-white" />
        }
    }

    const getStatusColor = () => {
        switch (localCallStatus) {
            case 'ringing':
                return 'from-yellow-500 to-orange-500'
            case 'connecting':
                return 'from-blue-500 to-teal-500'
            case 'connected':
                return 'from-green-500 to-emerald-500'
            case 'failed':
                return 'from-red-500 to-pink-500'
            default:
                return 'from-gray-500 to-gray-700'
        }
    }

    return (
        <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl">
            <div className="h-[500px] flex flex-col items-center justify-center relative">
                {/* Call Status Header */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className={`flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border ${localCallStatus === 'connected' ? 'border-green-500/30' : 'border-gray-700'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${localCallStatus === 'connected' ? 'bg-green-500' :
                                localCallStatus === 'ringing' ? 'bg-yellow-500' :
                                    localCallStatus === 'connecting' ? 'bg-blue-500' :
                                        'bg-red-500'
                            }`} />
                        <span className="text-sm font-medium">
                            {localCallStatus === 'connected' ? `Connected • ${formatTime(callDuration)}` :
                                localCallStatus === 'ringing' ? 'Ringing...' :
                                    localCallStatus === 'connecting' ? 'Connecting...' :
                                        localCallStatus === 'failed' ? 'Connection Failed' :
                                            'Call Ended'}
                        </span>
                    </div>

                    <div className="text-sm bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700">
                        {serviceCall.serviceName}
                    </div>
                </div>

                {/* Main Call Content */}
                <div className="flex-1 w-full flex items-center justify-center p-8">
                    {localCallStatus === 'ringing' ? (
                        <div className="text-center max-w-md">
                            <div className="relative mx-auto mb-8">
                                <div className={`w-32 h-32 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center justify-center shadow-2xl`}>
                                    {getStatusIcon()}
                                </div>
                                <div className="absolute inset-0 rounded-full border-4 border-teal-300 animate-ping opacity-20"></div>
                                <div className="absolute inset-4 rounded-full border-4 border-teal-200 animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Calling {serviceCall.serviceName}</h3>
                            <p className="text-gray-300 mb-6">Please wait while we connect you to service staff</p>

                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="flex space-x-1">
                                    {[0, 0.1, 0.2, 0.3, 0.4].map(delay => (
                                        <div
                                            key={delay}
                                            className="w-1.5 h-6 bg-teal-400 rounded-full animate-bounce"
                                            style={{
                                                animationDelay: `${delay}s`,
                                                animationDuration: '0.8s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-teal-300 font-medium">Waiting for answer...</span>
                            </div>

                            {showRingtoneControls && (
                                <div className="mb-6 p-4 bg-black/30 rounded-lg">
                                    <p className="text-sm text-gray-300 mb-2">
                                        Ringtone blocked by browser. Click below to play:
                                    </p>
                                    <Button
                                        onClick={handlePlayRingtone}
                                        variant="outline"
                                        className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full"
                                    >
                                        <Volume2 className="w-4 h-4 mr-2" />
                                        Play Ringtone
                                    </Button>
                                </div>
                            )}

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={handleEndCall}
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 px-6"
                                >
                                    <PhoneOff className="w-4 h-4 mr-2" />
                                    Cancel Call
                                </Button>
                            </div>
                        </div>
                    ) : localCallStatus === 'connecting' ? (
                        <div className="text-center max-w-md">
                            <div className="relative mx-auto mb-8">
                                <div className="w-28 h-28 border-4 border-gray-600 border-t-teal-500 rounded-full animate-spin shadow-2xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RotateCw className="w-12 h-12 text-teal-400 animate-spin" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Connecting...</h3>
                            <p className="text-gray-300 mb-6">Establishing secure connection to {serviceCall.serviceName}</p>

                            <div className="space-y-3 text-sm text-gray-400 bg-black/30 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span>LiveKit Server</span>
                                    <span className="text-teal-400">✓ Connecting</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Audio Channel</span>
                                    <span className="text-green-400">✓ Ready</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Video Channel</span>
                                    <span className="text-green-400">✓ Ready</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Encryption</span>
                                    <span className="text-green-400">✓ E2E Secured</span>
                                </div>
                            </div>
                        </div>
                    ) : localCallStatus === 'connected' ? (
                        <div className="w-full h-full flex flex-col">
                            <div className="flex-1 rounded-lg overflow-hidden mb-4 border-2 border-gray-700">
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                                            <Users className="w-12 h-12 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold">Live Call Active</h3>
                                        <p className="text-gray-300 mt-2">Connected to {serviceCall.serviceName} staff</p>
                                        <div className="mt-4 text-3xl font-mono font-bold text-green-400">
                                            {formatTime(callDuration)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connection Info */}
                            <div className="bg-black/40 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="text-gray-400">Service</div>
                                        <div className="font-medium">{serviceCall.serviceName}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-400">Connection</div>
                                        <div className="font-medium text-green-400">Secure • LiveKit</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-400">Room</div>
                                        <div className="font-medium font-mono text-xs">{serviceCall.roomName}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-400">Status</div>
                                        <div className="font-medium">Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center max-w-md">
                            <div className={`w-24 h-24 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
                                {getStatusIcon()}
                            </div>

                            <h3 className="text-2xl font-bold mb-2">
                                {localCallStatus === 'failed' ? 'Call Failed' : 'Call Ended'}
                            </h3>
                            <p className="text-gray-300 mb-6">
                                {localCallStatus === 'failed'
                                    ? `Your call to ${serviceCall.serviceName} failed to connect`
                                    : `Your call to ${serviceCall.serviceName} has ended`
                                }
                            </p>

                            <div className="flex gap-3 justify-center">
                                {localCallStatus === 'failed' && (
                                    <Button
                                        onClick={handleRetryCall}
                                        disabled={retrying}
                                        className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                                    >
                                        {retrying ? (
                                            <>
                                                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                                                Retrying...
                                            </>
                                        ) : (
                                            <>
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call Again
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button
                                    onClick={handleEndCall}
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Control Bar */}
                {(localCallStatus === 'connected' || localCallStatus === 'ringing' || localCallStatus === 'connecting') && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={toggleAudio}
                            className={`rounded-full p-4 shadow-xl ${!audioEnabled
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-gray-700 hover:bg-gray-600 text-white backdrop-blur-sm"
                                }`}
                            title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
                        >
                            {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </Button>

                        {localCallStatus === 'connected' && (
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={toggleVideo}
                                className={`rounded-full p-4 shadow-xl ${!videoEnabled
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-gray-700 hover:bg-gray-600 text-white backdrop-blur-sm"
                                    }`}
                                title={videoEnabled ? "Turn off camera" : "Turn on camera"}
                            >
                                {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </Button>
                        )}

                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={handleEndCall}
                            className="rounded-full p-4 shadow-xl bg-red-600 hover:bg-red-700 backdrop-blur-sm"
                            title="End call"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}