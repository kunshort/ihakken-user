// components/service-call-modal.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useServiceCall } from "@/hooks/useServiceCall"
import { Service } from "@/lib/types/service-calls"
import { AlertCircle, CheckCircle, Clock, Phone, Shield, ShoppingCart, Users, Utensils, Wrench } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ServiceCallRoom } from "./service-call-room"

interface CallServiceModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    services?: Service[]
    defaultStaffUnitId?: string
    userInfo?: {
        userId: string
        userName: string
    }
}

const defaultServices: Service[] = [
    {
        id: "reception",
        name: "Reception",
        description: "Contact the front desk",
        icon: Users,
        color: "text-teal-600",
        bgColor: "bg-transparent",
        borderColor: "border-gray-300 hover:border-teal-500 hover:bg-teal-50"
    },
    {
        id: "room-service",
        name: "Room Service",
        description: "Order food and beverages",
        icon: Utensils,
        color: "text-teal-600",
        bgColor: "bg-transparent",
        borderColor: "border-gray-300 hover:border-teal-500 hover:bg-teal-50"
    },
    {
        id: "housekeeping",
        name: "Housekeeping",
        description: "Request cleaning or towels",
        icon: ShoppingCart,
        color: "text-teal-600",
        bgColor: "bg-transparent",
        borderColor: "border-gray-300 hover:border-teal-500 hover:bg-teal-50"
    },
    {
        id: "maintenance",
        name: "Maintenance",
        description: "Report maintenance issues",
        icon: Wrench,
        color: "text-teal-600",
        bgColor: "bg-transparent",
        borderColor: "border-gray-300 hover:border-teal-500 hover:bg-teal-50"
    },
    {
        id: "security",
        name: "Security",
        description: "Report security concerns",
        icon: Shield,
        color: "text-teal-600",
        bgColor: "bg-transparent",
        borderColor: "border-gray-300 hover:border-teal-500 hover:bg-teal-50"
    },
    {
        id: "janitorial",
        name: "Janitorial",
        description: "Request janitorial services",
        icon: ShoppingCart,
        color: "text-teal-600",
        bgColor: "bg-transparent",
        borderColor: "border-gray-300 hover:border-teal-500 hover:bg-teal-50"
    },
]

export function CallServiceModal({
    open,
    onOpenChange,
    services = defaultServices,
    defaultStaffUnitId,
    userInfo
}: CallServiceModalProps) {
    const {
        activeCall,
        initiateCall,
        cancelCall,
        updateCallStatus,
        error,
        callStatus,
        isCalling,
        callDuration,
        retryCall
    } = useServiceCall()

    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [retrying, setRetrying] = useState(false)

    const formattedServices = useMemo(() => {
        return services.map(service => ({
            ...service,
            staffUnitId: service.staffUnitId || defaultStaffUnitId,
        }))
    }, [services, defaultStaffUnitId])

    const handleCall = async (serviceId: string, serviceName: string, staffUnitId?: string) => {
        if (!staffUnitId) {
            toast.error('Service is currently unavailable. Please try another service.')
            return
        }

        setSelectedService(serviceId)

        try {
            const metadata = {
                user_id: userInfo?.userId,
                user_name: userInfo?.userName,
                timestamp: new Date().toISOString(),
            }

            await initiateCall(serviceId, serviceName, staffUnitId, metadata)
        } catch (error) {
            console.error('Failed to initiate call:', error)
        } finally {
            setSelectedService(null)
        }
    }

    const handleClose = async () => {
        if (activeCall && callStatus !== 'ended') {
            if (confirm('You have an active call. Are you sure you want to end the call?')) {
                try {
                    await cancelCall()
                    onOpenChange(false)
                } catch (error) {
                    toast.error('Failed to end call properly')
                }
            }
        } else {
            onOpenChange(false)
        }
    }

    const handleCallEnd = async () => {
        try {
            await cancelCall()
            updateCallStatus('completed')
            toast.success('Call ended successfully')
        } catch (error) {
            toast.error('Failed to end call')
        }
    }

    const handleCallAccepted = () => {
        updateCallStatus('in-progress')
        toast.success('Call connected!', {
            description: 'You are now speaking with service staff.',
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        })
    }

    const handleRetry = async () => {
        if (!activeCall) return

        setRetrying(true)
        try {
            await retryCall()
            toast.info('Reconnecting call...')
        } catch (error) {
            toast.error('Failed to retry call')
        } finally {
            setRetrying(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'accepted': return 'bg-blue-100 text-blue-800'
            case 'in-progress': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-gray-100 text-gray-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                            <Phone className="w-5 h-5 text-teal-600" />
                            {activeCall ? 'Service Call' : 'Call a Service'}
                            {activeCall && (
                                <Badge variant="secondary" className={getStatusColor(activeCall.status)}>
                                    {activeCall.status.replace('-', ' ')}
                                </Badge>
                            )}
                        </DialogTitle>

                        {activeCall && callStatus === 'connected' && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono">{formatTime(callDuration)}</span>
                            </div>
                        )}
                    </div>

                    <DialogDescription>
                        {activeCall
                            ? `Connected to ${activeCall.serviceName} via secure video call`
                            : "Select a service to start a video/audio call"
                        }
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-red-800">Connection Error</p>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.reload()}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                        Refresh Page
                                    </Button>
                                    {activeCall && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleRetry}
                                            disabled={retrying}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            {retrying ? 'Retrying...' : 'Retry Call'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!activeCall ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {formattedServices.map((service) => {
                                const Icon = service.icon
                                const isCalling = selectedService === service.id
                                const hasStaffUnit = !!service.staffUnitId

                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => handleCall(service.id, service.name, service.staffUnitId)}
                                        disabled={isCalling || !hasStaffUnit}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${service.borderColor} ${service.bgColor} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 hover:shadow-md`}
                                        title={!hasStaffUnit ? "Service unavailable" : ""}
                                    >
                                        <div className={`p-3 rounded-full ${isCalling ? 'bg-teal-100 animate-pulse' : 'bg-gray-100'}`}>
                                            <Icon className={`w-6 h-6 ${service.color}`} />
                                        </div>

                                        <div className="space-y-1 text-center">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {service.name}
                                            </span>
                                            <span className="text-xs text-gray-600 leading-relaxed block">
                                                {service.description}
                                            </span>
                                        </div>

                                        {isCalling && (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-xs text-teal-600 font-medium">Connecting...</span>
                                            </div>
                                        )}

                                        {!hasStaffUnit && (
                                            <span className="text-xs text-red-500 font-medium mt-1">
                                                Unavailable
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {!defaultStaffUnitId && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                <p className="text-sm text-yellow-800">
                                    Please ensure you're logged in to make calls.
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield className="w-4 h-4 text-green-500" />
                                <span>All calls are encrypted end-to-end for your privacy and security.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-teal-50 border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-teal-600" />
                                        {activeCall.serviceName}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>Call ID:</span>
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            {activeCall.id.slice(0, 8)}...
                                        </code>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="secondary" className={getStatusColor(activeCall.status)}>
                                        {activeCall.status.replace('-', ' ')}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        LiveKit Room: {activeCall.roomName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <ServiceCallRoom
                            serviceCall={activeCall}
                            onCallEnd={handleCallEnd}
                            onCallAccepted={handleCallAccepted}
                            callStatus={callStatus}
                            callDuration={callDuration}
                            onRetry={handleRetry}
                            retrying={retrying}
                        />
                    </div>
                )}

                <DialogFooter className="pt-4 border-t">
                    {!activeCall ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                            <div className="text-xs text-gray-500 text-right">
                                {defaultStaffUnitId ? 'Ready to connect' : 'Authentication required'}
                            </div>
                        </>
                    ) : (
                        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-green-500" />
                                    <span>Secure • End-to-End Encrypted</span>
                                </div>
                                {activeCall.serverUrl && (
                                    <div className="mt-1 text-gray-400">
                                        Server: {new URL(activeCall.serverUrl).hostname}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {callStatus === 'failed' && (
                                    <Button
                                        variant="outline"
                                        onClick={handleRetry}
                                        disabled={retrying}
                                        className="border-teal-300 text-teal-700 hover:bg-teal-50"
                                    >
                                        {retrying ? 'Retrying...' : 'Retry Call'}
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={handleClose}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    End Call
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}