// components/service-call-modal.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useServiceCall } from "@/hooks/useServiceCall"
import { useStaffUnits } from "@/hooks/useStaffUnits"
import { Service } from "@/lib/types/service-calls"
import { AlertCircle, CheckCircle, Clock, Loader2, LucideIcon, Phone, Shield, ShoppingCart, Users, Utensils, Wrench } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ServiceCallRoom } from "./service-call-room"

interface CallServiceModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    branchServiceId?: string
    services?: Service[]
    defaultStaffUnitId?: string
    userInfo?: {
        userId: string
        userName: string
    }
}

const fallbackIconComponents: Record<string, LucideIcon> = {
    Users,
    Utensils,
    ShoppingCart,
    Wrench,
    Shield,
    Phone,
    AlertCircle,
    CheckCircle,
    Clock
}

const getIconComponent = (icon: LucideIcon | string): LucideIcon => {
    if (typeof icon === 'string') {
        if (icon in fallbackIconComponents) {
            return fallbackIconComponents[icon];
        }
        return Users;
    }
    return icon
}

export function CallServiceModal({
    open,
    onOpenChange,
    branchServiceId,
    services: propServices,
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
        retryCall,
        clearError
    } = useServiceCall()

    const {
        services: fetchedServices,
        isLoading,
        error: fetchError,
        refetch,
        hasServices
    } = useStaffUnits(branchServiceId)

    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [retrying, setRetrying] = useState(false)

    const services = useMemo(() => {
        if (propServices && propServices.length > 0) {
            return propServices;
        }
        return fetchedServices;
    }, [propServices, fetchedServices])

    const formattedServices = useMemo(() => {
        return services.map(service => {
            const isAvailable = service.isActive === true;

            return {
                ...service,
                staffUnitId: service.staffUnitId || defaultStaffUnitId,
                available: isAvailable,
                status: service.status || (isAvailable ? 'active' : 'inactive'),
                icon: getIconComponent(service.icon)
            }
        })
    }, [services, defaultStaffUnitId])

    const handleCall = async (serviceId: string, serviceName: string, staffUnitId?: string, isAvailable?: boolean) => {
        if (!isAvailable) {
            toast.error('Service is currently unavailable. Please try another service.')
            return
        }

        if (!staffUnitId) {
            toast.error('Service not properly configured. Please contact support.')
            return
        }

        setSelectedService(serviceId)

        try {
            const metadata = {
                user_id: userInfo?.userId || `user-${Date.now()}`,
                user_name: userInfo?.userName || "User",
                branch_service_id: branchServiceId,
                timestamp: new Date().toISOString(),
            }

            await initiateCall(serviceId, serviceName, staffUnitId, metadata)
        } catch (error) {
            console.error('Failed to initiate call:', error)
            setSelectedService(null)

            // Show appropriate error message
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('Network')) {
                    toast.error('Network error. Please check your internet connection and try again.')
                } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
                    toast.error('Connection timeout. Please try again in a moment.')
                } else if (error.message.includes('Failed to fetch')) {
                    toast.error('Cannot connect to server. Please try again later.')
                } else {
                    toast.error(`Call failed: ${error.message}`)
                }
            } else {
                toast.error('Unable to initiate call. Please try again.')
            }
        }
    }

    const handleClose = async () => {
        if (activeCall && callStatus !== 'ended' && callStatus !== 'failed') {
            if (confirm('You have an active call. Are you sure you want to end the call?')) {
                try {
                    await cancelCall()
                    onOpenChange(false)
                } catch (error) {
                    console.error('Failed to end call:', error)
                    toast.error('Failed to end call properly. Please try again.')
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
            console.error('Error ending call:', error)

            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('Network')) {
                    toast.error('Network error. Call may not have ended properly.')
                } else {
                    toast.error(`Failed to end call: ${error.message}`)
                }
            } else {
                toast.error('Failed to end call. Please try again.')
            }
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
            console.error('Failed to retry call:', error)

            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('Network')) {
                    toast.error('Network error. Please check your connection.')
                } else {
                    toast.error(`Failed to retry call: ${error.message}`)
                }
            } else {
                toast.error('Failed to retry call. Please try again.')
            }
        } finally {
            setRetrying(false)
        }
    }

    // Helper function to get user-friendly error messages
    const getErrorMessage = (error: any): string => {
        if (!error) return "An unknown error occurred";

        if (typeof error === 'string') return error;

        if (error instanceof Error) {
            const msg = error.message.toLowerCase();

            if (msg.includes('network') || msg.includes('fetch')) {
                return "Network connection failed. Please check your internet connection.";
            }
            if (msg.includes('timeout')) {
                return "Request timed out. Please try again.";
            }
            if (msg.includes('404') || msg.includes('not found')) {
                return "Service endpoint not found. Please contact support.";
            }
            if (msg.includes('500') || msg.includes('internal server')) {
                return "Server error. Please try again later.";
            }
            if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized')) {
                return "Access denied. Please check your permissions.";
            }
            if (msg.includes('failed to initiate')) {
                return "Unable to start call. The service may be busy or unavailable.";
            }

            return error.message || "An error occurred";
        }

        if (typeof error === 'object' && error.message) {
            return error.message;
        }

        return "An unexpected error occurred. Please try again.";
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'in-progress': return 'bg-green-100 text-green-800 border-green-200'
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Clear error when modal closes
    useEffect(() => {
        if (!open) {
            clearError();
        }
    }, [open, clearError]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {/* Proper spacing with background, shadow, and rounded corners */}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white shadow-2xl rounded-2xl border border-gray-200 my-8">
                <DialogHeader className="shrink-0 px-6 pt-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Phone className="w-6 h-6 text-teal-600" />
                            {activeCall ? 'Staff Call' : 'Call a Staff'}
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

                    <DialogDescription className="text-gray-600">
                        {activeCall
                            ? `Connected to ${activeCall.serviceName} via secure video call`
                            : "Select a staff unit to start a call"
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Error Display */}
                {(error || fetchError) && (
                    <div className="shrink-0 bg-red-50 border border-red-200 rounded-lg p-4 mx-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-red-800">Connection Error</p>
                                <p className="text-sm text-red-600 mt-1">
                                    {getErrorMessage(error || fetchError)}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (branchServiceId) {
                                                refetch();
                                                toast.info('Retrying connection...');
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                        Try Again
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

                {/* Loading State */}
                {isLoading && !hasServices && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                            <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Loading services...</p>
                        <p className="text-sm text-gray-500 mt-2">Fetching available services for this branch</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {!activeCall ? (
                        <div className="space-y-6">
                            {/* Services Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {formattedServices.map((service) => {
                                    const Icon = service.icon
                                    const isCallingService = selectedService === service.id
                                    const isAvailable = service.available

                                    // ACTIVE SERVICE: Green theme
                                    const activeStyle = {
                                        border: "border-green-500",
                                        background: "bg-green-50 hover:bg-green-100",
                                        iconBackground: "bg-green-100",
                                        iconColor: "text-green-600",
                                        titleColor: "text-green-700",
                                        descriptionColor: "text-gray-600",
                                        shadow: "hover:shadow-md hover:shadow-green-100"
                                    }

                                    // INACTIVE SERVICE: Gray theme
                                    const inactiveStyle = {
                                        border: "border-gray-300",
                                        background: "bg-gray-50 hover:bg-gray-100",
                                        iconBackground: "bg-gray-100",
                                        iconColor: "text-gray-400",
                                        titleColor: "text-gray-500",
                                        descriptionColor: "text-gray-400",
                                        shadow: "hover:shadow-sm"
                                    }

                                    const style = isAvailable ? activeStyle : inactiveStyle

                                    return (
                                        <button
                                            key={service.id}
                                            onClick={() => handleCall(service.id, service.name, service.staffUnitId, service.available)}
                                            disabled={isCallingService || !isAvailable}
                                            className={`
                                                flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 
                                                ${style.border} ${style.background} ${style.shadow}
                                                disabled:opacity-50 disabled:cursor-not-allowed 
                                                hover:scale-[1.02] active:scale-95 
                                                relative min-h-[130px] w-full
                                            `}
                                            title={!isAvailable ? "Service currently unavailable" : `Call ${service.name}`}
                                        >
                                            <div className={`p-3 rounded-full ${isCallingService ? 'bg-teal-100 animate-pulse' : style.iconBackground}`}>
                                                <Icon className={`w-7 h-7 ${style.iconColor}`} />
                                            </div>

                                            <div className="space-y-1 text-center">
                                                <span className={`text-sm font-semibold ${style.titleColor}`}>
                                                    {service.name}
                                                </span>
                                                <span className={`text-xs ${style.descriptionColor} leading-relaxed block`}>
                                                    {service.description || `Contact ${service.name}`}
                                                </span>
                                            </div>

                                            {isCallingService && (
                                                <div className="flex flex-col items-center gap-2 mt-1">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                    <span className="text-xs text-teal-600 font-medium">Connecting...</span>
                                                </div>
                                            )}

                                            {!isAvailable && (
                                                <div className="flex flex-col items-center gap-1 mt-1">
                                                    <span className="text-xs font-medium text-red-500 px-2 py-0.5 bg-red-50 rounded">
                                                        Unavailable
                                                    </span>
                                                </div>
                                            )}

                                            {/* Branch Service Badge */}
                                            {service.branchServiceName && (
                                                <div className="absolute top-2 right-2">
                                                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {service.branchServiceName}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Empty State */}
                            {!isLoading && formattedServices.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Staff Units Available</h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                        No staff units are currently available for this branch. Please check back later or contact support.
                                    </p>
                                    {branchServiceId && (
                                        <Button
                                            variant="outline"
                                            onClick={() => refetch()}
                                            disabled={isLoading}
                                            className="border-gray-300 hover:bg-gray-50"
                                        >
                                            Check Again
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Service Stats - Only show when there are services */}
                            {formattedServices.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-700">Available</span>
                                            <span className="text-xl font-bold text-green-600">
                                                {formattedServices.filter(s => s.available).length}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">Ready for calls</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Total Services</span>
                                            <span className="text-xl font-bold text-gray-600">
                                                {formattedServices.length}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">For this branch</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-teal-50 border border-gray-200">
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
                                            <span className="text-gray-400">•</span>
                                            <span className="text-xs">
                                                {new Date(activeCall.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="secondary" className={getStatusColor(activeCall.status)}>
                                            {activeCall.status.replace('-', ' ')}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            Room: {activeCall.roomName}
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
                </div>

                <DialogFooter className="shrink-0 pt-4 border-t border-gray-200 px-6 pb-6">
                    {!activeCall ? (
                        <div className="w-full flex justify-end">
                            {/* Right side: Branch info only */}
                            <div className="text-right">
                                <div className="text-sm text-gray-600 font-medium">
                                    Ready to connect
                                </div>
                                {branchServiceId && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Branch: {formattedServices[0]?.branchServiceName || 'Unknown'}
                                    </div>
                                )}
                            </div>
                        </div>
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
                                    className="bg-red-600 hover:bg-red-700 text-white px-6"
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