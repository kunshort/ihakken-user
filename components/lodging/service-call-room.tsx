"use client"

import { Button } from '@/components/ui/button'
import { ServiceCall } from '@/lib/types/service-calls'
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useParticipants,
} from '@livekit/components-react'
import '@livekit/components-styles'
import {
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    RotateCw,
    Volume2,
    User,
    Users,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Shield
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface ServiceCallRoomProps {
    serviceCall: ServiceCall
    onCallEnd: () => void
    onCallAccepted?: () => void
    callStatus: string
    callDuration: number
    onRetry?: () => void
    retrying?: boolean
    onLiveKitConnected?: () => void
    onLiveKitDisconnected?: () => void
}

const COLORS = {
    primary: '#128C7E', // WhatsApp green
    primaryDark: '#075E54',
    primaryLight: '#25D366',
    background: '#F0F2F5',
    card: '#FFFFFF',
    textPrimary: '#3B4A54',
    textSecondary: '#667781',
    border: '#E0E0E0',
    danger: '#F44336',
    warning: '#FF9800',
}

export function ServiceCallRoom({
    serviceCall,
    onCallEnd,
    onCallAccepted,
    callStatus,
    callDuration,
    onRetry,
    retrying = false,
    onLiveKitConnected,
    onLiveKitDisconnected
}: ServiceCallRoomProps) {
    // DEBUG: Log what we receive
    console.log('🎯 ServiceCallRoom DEBUG - Received props:', {
        callStatus,
        hasServiceCall: !!serviceCall,
        roomName: serviceCall?.roomName,
        token: serviceCall?.token ? '✓' : '✗',
    });

    // STATE
    const [localCallStatus, setLocalCallStatus] = useState<string>(callStatus)
    const [isLiveKitConnected, setIsLiveKitConnected] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(100)
    const [roomError, setRoomError] = useState<string | null>(null)
    const [reconnecting, setReconnecting] = useState(false)
    const [showConnectingUI, setShowConnectingUI] = useState(false)
    const [callTimer, setCallTimer] = useState(callDuration)

    const audioContextRef = useRef<AudioContext | null>(null)
    const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL

    // Timer management
    useEffect(() => {
        if (localCallStatus === 'connected' && isLiveKitConnected) {
            // Start timer when call is connected
            timerIntervalRef.current = setInterval(() => {
                setCallTimer(prev => prev + 1)
            }, 1000)

            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current)
                    timerIntervalRef.current = null
                }
            }
        } else {
            // Reset timer when not connected
            setCallTimer(callDuration)
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
                timerIntervalRef.current = null
            }
        }
    }, [localCallStatus, isLiveKitConnected, callDuration])

    // Update local status when prop changes
    useEffect(() => {
        console.log('📞 Call status prop changed:', { old: localCallStatus, new: callStatus });

        if (callStatus !== localCallStatus) {
            setLocalCallStatus(callStatus);

            // Handle state transitions
            if (callStatus === 'ringing') {
                console.log('🔔 Starting ringtone');
                startRingtone();

                // Auto-accept after 3 seconds for demo
                const timer = setTimeout(() => {
                    console.log('✅ Auto-accepting call (demo)');
                    onCallAccepted?.();
                }, 3000);

                return () => clearTimeout(timer);
            } else if (callStatus === 'connecting') {
                console.log('🔄 Connecting state received');
                setShowConnectingUI(true);
                stopAllSounds();

                // Set a timeout to prevent infinite connecting
                connectionTimeoutRef.current = setTimeout(() => {
                    if (!isLiveKitConnected) {
                        console.warn('⏰ Connection timeout - LiveKit failed to connect');
                        setRoomError('Connection timeout. Please try again.');
                        toast.error('Failed to connect to audio server');
                    }
                }, 10000); // 10 second timeout
            } else {
                stopAllSounds();

                // Clear connection timeout
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                }
            }
        }
    }, [callStatus, localCallStatus, onCallAccepted, isLiveKitConnected]);

    // SOUND MANAGEMENT
    const startRingtone = useCallback(() => {
        stopAllSounds();
        console.log('🔊 Starting ringtone');

        const playTone = () => {
            try {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
                }

                const oscillator = audioContextRef.current.createOscillator()
                const gainNode = audioContextRef.current.createGain()

                oscillator.connect(gainNode)
                gainNode.connect(audioContextRef.current.destination)

                oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
                oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime + 0.5)
                oscillator.type = 'sine'
                gainNode.gain.setValueAtTime(0.08, audioContextRef.current.currentTime)

                oscillator.start()
                oscillator.stop(audioContextRef.current.currentTime + 0.8)
            } catch (error: unknown) {
                console.log('Could not play ringtone:', error)
            }
        }

        // Play immediately
        playTone()

        // Repeat every 2 seconds
        ringtoneIntervalRef.current = setInterval(playTone, 2000)
    }, [])

    const stopAllSounds = useCallback(() => {
        console.log('🔇 Stopping all sounds');
        if (ringtoneIntervalRef.current) {
            clearInterval(ringtoneIntervalRef.current)
            ringtoneIntervalRef.current = null
        }

        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
    }, [])

    // CALL ACTIONS
    const handleEndCall = useCallback(() => {
        console.log('📴 Ending call - user initiated');

        // Clear any pending timers
        if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
        }

        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }

        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        onCallEnd();
    }, [onCallEnd])

    const handleRetry = useCallback(() => {
        console.log('🔄 Retrying call');
        if (onRetry) {
            onRetry();
        }
    }, [onRetry])

    // Handle LiveKit connection
    const handleLiveKitConnected = useCallback(() => {
        console.log('✅ LiveKit connected!');
        setIsLiveKitConnected(true);
        setShowConnectingUI(false);
        setRoomError(null);

        // Clear connection timeout
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }

        // Notify parent
        onLiveKitConnected?.();

        toast.success('Call connected', {
            description: 'Audio connection established'
        });
    }, [onLiveKitConnected]);

    // Handle LiveKit disconnection with grace period
    const handleLiveKitDisconnected = useCallback(() => {
        console.log('🔌 LiveKit disconnected');
        setIsLiveKitConnected(false);

        if (isLiveKitConnected) {
            console.log('⏱️ Setting auto-end timer (5 seconds)...');

            // Clear any existing timer
            if (disconnectTimerRef.current) {
                clearTimeout(disconnectTimerRef.current);
            }

            // Set a timer to automatically end call if reconnection fails
            disconnectTimerRef.current = setTimeout(() => {
                console.log('⏰ Auto-end timer expired - ending call');
                handleEndCall();
            }, 5000); // Give 5 seconds for reconnection

            setReconnecting(true);

            // Notify parent
            onLiveKitDisconnected?.();
        }
    }, [isLiveKitConnected, handleEndCall, onLiveKitDisconnected]);

    const handleLiveKitReconnected = useCallback(() => {
        console.log('✅ LiveKit reconnected');
        setReconnecting(false);

        // Clear the auto-end timer
        if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
        }
    }, []);

    // CLEANUP
    useEffect(() => {
        return () => {
            console.log('🧹 ServiceCallRoom cleanup');
            stopAllSounds();

            // Clear timers
            if (disconnectTimerRef.current) {
                clearTimeout(disconnectTimerRef.current);
                disconnectTimerRef.current = null;
            }

            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
                connectionTimeoutRef.current = null;
            }

            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, [stopAllSounds])

    // UTILITY FUNCTIONS
    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    // Check token validity
    const isTokenValid = useCallback((token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const isValid = expiry > now;

            console.log('🔍 Token validation:', {
                expiry: new Date(expiry).toISOString(),
                now: new Date(now).toISOString(),
                isValid,
                secondsRemaining: Math.floor((expiry - now) / 1000)
            });

            return isValid;
        } catch (error) {
            console.error('Failed to parse token:', error);
            return false;
        }
    }, []);

    // RENDER STATES
    const renderRinging = () => {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
                {/* Animated Ringing Indicator */}
                <div className="relative mb-10">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-r from-[#128C7E] to-[#25D366] flex items-center justify-center shadow-lg">
                        <Phone className="w-20 h-20 text-white" />
                    </div>
                    
                    {/* Ringing circles animation */}
                    <div className="absolute inset-0">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 rounded-full border-4 border-[#128C7E]/30"
                                style={{
                                    animation: `ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite`,
                                    animationDelay: `${i * 0.3}s`,
                                    transform: `scale(${1 + i * 0.2})`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Call Information */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Calling...</h2>
                    <p className="text-lg text-gray-600 mb-1">{serviceCall.serviceName}</p>
                    <p className="text-sm text-gray-500">Ringing...</p>
                </div>

                {/* Call Timer - Show 00:00 when ringing */}
                <div className="flex items-center gap-2 mb-10">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-lg font-mono font-medium text-gray-700">00:00</span>
                </div>

                {/* Call Controls */}
                <div className="flex gap-6">
                    <Button
                        onClick={handleEndCall}
                        className="rounded-full p-5 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        aria-label="End call"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        )
    }

    const renderConnecting = () => {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
                {/* Animated Connecting Indicator */}
                <div className="relative mb-10">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-r from-[#128C7E] to-[#25D366] flex items-center justify-center shadow-lg">
                        <div className="relative">
                            <RotateCw className="w-20 h-20 text-white animate-spin" />
                            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                        </div>
                    </div>
                    
                    {/* Connecting dots animation */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-[#128C7E] rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Connection Information */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Connecting...</h2>
                    <p className="text-lg text-gray-600 mb-1">{serviceCall.serviceName}</p>
                    <p className="text-sm text-gray-500">Establishing secure connection</p>
                </div>

                {/* Progress Bar */}
                <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mb-10">
                    <div className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] animate-pulse w-3/4"></div>
                </div>

                {/* Cancel Button */}
                <Button
                    onClick={handleEndCall}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            </div>
        )
    }

    const renderLiveKitRoom = () => {
        if (!serviceCall?.roomName || !serviceCall?.token) {
            return renderError("Missing connection credentials");
        }

        if (!LIVEKIT_WS_URL) {
            return renderError("Server configuration missing");
        }

        if (!isTokenValid(serviceCall.token)) {
            return renderError("Connection token has expired. Please hang up and call again.");
        }

        return (
            <div className="h-full flex flex-col">
                <LiveKitRoom
                    serverUrl={LIVEKIT_WS_URL}
                    token={serviceCall.token}
                    connect={true}
                    audio={true}
                    video={false}
                    onConnected={() => {
                        console.log('✅ LiveKitRoom onConnected callback');
                        handleLiveKitConnected();
                    }}
                    onDisconnected={() => {
                        console.log('🔌 LiveKitRoom onDisconnected callback');
                        handleLiveKitDisconnected();
                    }}
                    onError={(error: Error) => {
                        console.error('❌ LiveKit error:', error);
                        setRoomError(error.message);

                        if (error.message.includes('no permissions') ||
                            error.message.includes('Authentication failed')) {
                            toast.error('Authentication failed. Please hang up and call again.');
                            handleEndCall();
                        } else {
                            toast.error(`Connection error: ${error.message}`);
                        }
                    }}
                    className="h-full"
                >
                    {/* Only show ActiveCallUI when LiveKit is actually connected */}
                    {isLiveKitConnected ? (
                        <ActiveCallUI
                            isMuted={isMuted}
                            setIsMuted={setIsMuted}
                            volume={volume}
                            setVolume={setVolume}
                            serviceName={serviceCall.serviceName}
                            callDuration={callTimer}
                            formatTime={formatTime}
                            onEndCall={handleEndCall}
                            reconnecting={reconnecting}
                            onReconnected={handleLiveKitReconnected}
                        />
                    ) : (
                        // Show connecting overlay while LiveKit is connecting
                        <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
                            <RotateCw className="w-16 h-16 text-[#128C7E] animate-spin mx-auto mb-6" />
                                <h2 className="text-2xl font-bold mb-2 text-center">Finalizing connection...</h2>
                            <p className="text-gray-600 mb-6">Almost ready to start the call</p>
                            <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] animate-pulse w-3/4"></div>
                            </div>
                        </div>
                    )}
                </LiveKitRoom>
            </div>
        );
    }

    const renderError = (message: string) => {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-20 h-20 text-red-500" />
                </div>
                
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Call Failed</h2>
                    <p className="text-gray-600 mb-2">{message}</p>
                    <p className="text-sm text-gray-500">Could not establish audio connection</p>
                </div>

                <div className="flex gap-4">
                    {onRetry && (
                        <Button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="bg-[#128C7E] hover:bg-[#075E54] text-white"
                        >
                            {retrying ? (
                                <>
                                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                                    Retrying...
                                </>
                            ) : (
                                'Try Again'
                            )}
                        </Button>
                    )}
                    <Button onClick={handleEndCall} variant="outline" className="border-gray-300">
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    const renderEnded = () => {
        const isFailed = localCallStatus === 'failed';

        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-8 ${isFailed ? 'bg-red-100' : 'bg-green-100'}`}>
                    {isFailed ? (
                        <XCircle className="w-24 h-24 text-red-500" />
                    ) : (
                        <CheckCircle className="w-24 h-24 text-green-500" />
                    )}
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">
                        {isFailed ? 'Call Failed' : 'Call Ended'}
                    </h2>
                    <p className="text-gray-600 mb-2">
                        {isFailed
                            ? `Could not connect to ${serviceCall.serviceName}`
                            : `Call with ${serviceCall.serviceName} has ended`
                        }
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {formatTime(callDuration)}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    {isFailed && onRetry && (
                        <Button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="bg-[#128C7E] hover:bg-[#075E54] text-white"
                        >
                            {retrying ? (
                                <>
                                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                                    Retrying...
                                </>
                            ) : (
                                'Call Again'
                            )}
                        </Button>
                    )}
                    <Button
                        onClick={handleEndCall}
                        variant="outline"
                        className="border-gray-300"
                    >
                        Close
                    </Button>
                </div>
            </div>
        )
    }

    // MAIN RENDER LOGIC
    console.log('🎨 ServiceCallRoom Main Render:', {
        localCallStatus,
        isLiveKitConnected,
        showConnectingUI,
    });

    // DECISION: What to render based on state
    if (localCallStatus === 'ringing') {
        return (
            <div className="rounded-2xl overflow-hidden shadow-2xl h-[600px] border border-gray-200 bg-white">
                <div className="bg-[#128C7E] text-white text-xs p-3 font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>Calling {serviceCall.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs">End-to-End Encrypted</span>
                    </div>
                </div>
                <div className="h-full">
                    {renderRinging()}
                </div>
            </div>
        );
    }

    if (localCallStatus === 'failed' || localCallStatus === 'ended') {
        return (
            <div className="rounded-2xl overflow-hidden shadow-2xl h-[600px] border border-gray-200 bg-white">
                <div className="bg-gray-800 text-white text-xs p-3 font-medium flex items-center justify-between">
                    <span>Call {localCallStatus === 'failed' ? 'Failed' : 'Ended'}</span>
                    <Shield className="w-3 h-3" />
                </div>
                <div className="h-full">
                    {renderEnded()}
                </div>
            </div>
        );
    }

    // For 'connecting' or 'connected' states with valid serviceCall
    if (serviceCall?.roomName && serviceCall?.token) {
        return (
            <div className="rounded-2xl overflow-hidden shadow-2xl h-[600px] border border-gray-200 bg-white">
                <div className="bg-[#128C7E] text-white text-xs p-3 font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{isLiveKitConnected ? 'Call Connected' : 'Connecting...'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs">End-to-End Encrypted</span>
                    </div>
                </div>
                <div className="h-full">
                    {renderLiveKitRoom()}
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl h-[600px] border border-gray-200 bg-white">
            <div className="bg-[#128C7E] text-white text-xs p-3 font-medium">
                Audio Call
            </div>
            <div className="h-full">
                {renderConnecting()}
            </div>
        </div>
    );
}

// ACTIVE CALL UI COMPONENT
interface ActiveCallUIProps {
    isMuted: boolean
    setIsMuted: (muted: boolean) => void
    volume: number
    setVolume: (volume: number) => void
    serviceName: string
    callDuration: number
    formatTime: (seconds: number) => string
    onEndCall: () => void
    reconnecting: boolean
    onReconnected?: () => void
}

function ActiveCallUI({
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    serviceName,
    callDuration,
    formatTime,
    onEndCall,
    reconnecting,
    onReconnected
}: ActiveCallUIProps) {
    const { localParticipant } = useLocalParticipant()
    const participants = useParticipants()

    const toggleMicrophone = useCallback(async () => {
        if (!localParticipant) {
            console.error('No local participant found');
            return
        }

        try {
            if (isMuted) {
                await localParticipant.setMicrophoneEnabled(true)
                setIsMuted(false)
            } else {
                await localParticipant.setMicrophoneEnabled(false)
                setIsMuted(true)
            }
        } catch (error: unknown) {
            console.error('Error toggling microphone:', error)
        }
    }, [localParticipant, isMuted, setIsMuted])

    // Handle reconnection
    useEffect(() => {
        if (!reconnecting && localParticipant) {
            onReconnected?.();
        }
    }, [reconnecting, localParticipant, onReconnected]);

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#F0F2F5] to-white">
            {/* Reconnection overlay */}
            {reconnecting && (
                <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="relative inline-block mb-6">
                            <RotateCw className="w-16 h-16 text-[#128C7E] animate-spin" />
                            <div className="absolute inset-0 rounded-full border-4 border-[#128C7E]/20"></div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Reconnecting...</h3>
                        <p className="text-gray-600 mb-6">
                            Attempting to restore connection
                        </p>
                        <div className="flex space-x-2 justify-center">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-[#128C7E] rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* LiveKit renders all audio */}
            <RoomAudioRenderer />

            {/* Main Call UI */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Participant Avatar */}
                <div className="relative mb-12">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-r from-[#128C7E] to-[#25D366] flex items-center justify-center shadow-2xl">
                        <User className="w-32 h-32 text-white" />
                    </div>

                    {/* Speaking indicator */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
                            <div className="flex items-center gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse"
                                        style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                ))}
                            </div>
                            {/* <span className="text-sm font-medium text-gray-700">
                                {participants.length} participant{participants.length !== 1 ? 's' : ''}
                            </span> */}
                        </div>
                    </div>
                </div>

                {/* Call Information */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3 text-gray-800">{serviceName}</h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Clock className="w-5 h-5 text-[#128C7E]" />
                            <span className="text-xl font-mono font-bold text-gray-800">
                                {formatTime(callDuration)}
                            </span>
                        </div>
                    </div>
                    <p className="text-gray-500 mt-4">
                        {reconnecting ? 'Reconnecting...' : 'Secure audio connection active'}
                    </p>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-6">
                    {/* Mute Toggle */}
                    <Button
                        onClick={toggleMicrophone}
                        variant="outline"
                        className={`rounded-full p-5 h-auto ${isMuted ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                        disabled={reconnecting}
                    >
                        {isMuted ? (
                            <MicOff className="w-8 h-8 text-red-500" />
                        ) : (
                            <Mic className="w-8 h-8 text-gray-700" />
                        )}
                    </Button>

                    {/* End Call Button */}
                    <Button
                        onClick={onEndCall}
                        className="rounded-full p-5 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        disabled={reconnecting}
                    >
                        <PhoneOff className="w-8 h-8" />
                    </Button>
                </div>
            </div>
        </div>
    );
}