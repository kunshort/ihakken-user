"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useServiceCall } from "@/hooks/useServiceCall"
import { useStaffUnits } from "@/hooks/useStaffUnits"
import { Service } from "@/lib/types/service-calls"
import { isApiError } from "@/lib/utils/apiError"
import { AlertCircle, CheckCircle, Clock, Loader2, LucideIcon, Phone, RefreshCw, Shield, ShoppingCart, Users, Utensils, Wrench } from "lucide-react"
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
    const [refreshing, setRefreshing] = useState(false)

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

    // Check if there are any staff units
    const hasStaffUnits = useMemo(() => {
        return formattedServices.length > 0
    }, [formattedServices])

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

            if (isApiError(error)) {
                toast.error(error.toUserFriendlyMessage(), {
                    description: error.code === 'UNAUTHORIZED'
                        ? 'Please refresh the page and try again.'
                        : undefined,
                    icon: <AlertCircle className="w-5 h-5" />,
                });
            } else {
                toast.error('Unable to initiate call. Please try again.', {
                    icon: <AlertCircle className="w-5 h-5" />,
                });
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

                    if (isApiError(error)) {
                        toast.error(error.toUserFriendlyMessage());
                    } else {
                        toast.error('Failed to end call properly. Please try again.');
                    }
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
            toast.success('Call ended successfully', {
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            })
        } catch (error) {
            console.error('Error ending call:', error)

            if (isApiError(error)) {
                toast.error(error.toUserFriendlyMessage(), {
                    description: error.code === 'NETWORK_ERROR'
                        ? 'Your call may not have ended properly on the server.'
                        : undefined,
                });
            } else {
                toast.error('Failed to end call. Please try again.');
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

            if (isApiError(error)) {
                toast.error(error.toUserFriendlyMessage());
            } else {
                toast.error('Failed to retry call. Please try again.');
            }
        } finally {
            setRetrying(false)
        }
    }

    const handleRefresh = async () => {
        if (!branchServiceId) return

        setRefreshing(true)
        try {
            await refetch()
            if (formattedServices.length === 0) {
                toast.info('Refreshed services list')
            }
        } catch (error) {
            console.error('Failed to refresh services:', error)
        } finally {
            setRefreshing(false)
        }
    }

    // Get user-friendly error message from any error
    const getErrorMessage = (error: any): string => {
        if (!error) return "An unknown error occurred";

        if (isApiError(error)) {
            return error.toUserFriendlyMessage();
        }

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

            return error.message || "An error occurred";
        }

        if (typeof error === 'object' && error.message) {
            return error.message;
        }

        return "An unexpected error occurred. Please try again.";
    }

    const getErrorSeverity = (error: any): 'low' | 'medium' | 'high' => {
        if (isApiError(error)) {
            switch (error.code) {
                case 'NETWORK_ERROR':
                case 'UNAUTHORIZED':
                case 'SERVICE_UNAVAILABLE':
                case 'SERVER_ERROR':
                    return 'high';
                case 'FORBIDDEN':
                case 'RATE_LIMIT':
                case 'TIMEOUT':
                    return 'medium';
                default:
                    return 'low';
            }
        }
        return 'medium';
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

    // Show toast for fetch errors
    useEffect(() => {
        if (fetchError && open) {
            const message = getErrorMessage(fetchError);
            const severity = getErrorSeverity(fetchError);

            const toastOptions = {
                duration: severity === 'high' ? 10000 : 5000,
                icon: <AlertCircle className="w-5 h-5" />,
            };

            if (severity === 'high') {
                toast.error(message, toastOptions);
            } else {
                toast.warning(message, toastOptions);
            }
        }
    }, [fetchError, open]);

    // Show toast for call errors
    useEffect(() => {
        if (error && open) {
            const message = getErrorMessage(error);
            const severity = getErrorSeverity(error);

            const toastOptions = {
                duration: severity === 'high' ? 10000 : 5000,
                icon: <AlertCircle className="w-5 h-5" />,
            };

            if (severity === 'high') {
                toast.error(message, toastOptions);
            } else {
                toast.warning(message, toastOptions);
            }
        }
    }, [error, open]);

    // Clear error when modal closes
    useEffect(() => {
        if (!open) {
            clearError();
        }
    }, [open, clearError]);

    // Don't render modal content if no staff units
    if (!hasStaffUnits && !activeCall) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
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

                    <div className="text-gray-600 text-sm mt-1">
                        {activeCall
                            ? `Connected to ${activeCall.serviceName} via secure video call`
                            : "Select a staff unit to start a call"
                        }
                    </div>
                </DialogHeader>

                {/* Error Display */}
                {(error || fetchError) && (
                    <div className={`
                        shrink-0 border rounded-lg p-4 mx-6 mb-4
                        ${getErrorSeverity(error || fetchError) === 'high'
                            ? 'bg-red-50 border-red-200'
                            : getErrorSeverity(error || fetchError) === 'medium'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-gray-50 border-gray-200'
                        }
                    `}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className={`
                                w-5 h-5 mt-0.5 flex-shrink-0
                                ${getErrorSeverity(error || fetchError) === 'high'
                                    ? 'text-red-500'
                                    : getErrorSeverity(error || fetchError) === 'medium'
                                        ? 'text-amber-500'
                                        : 'text-gray-500'
                                }
                            `} />
                            <div className="flex-1">
                                <p className={`
                                    font-medium mb-1
                                    ${getErrorSeverity(error || fetchError) === 'high'
                                        ? 'text-red-800'
                                        : getErrorSeverity(error || fetchError) === 'medium'
                                            ? 'text-amber-800'
                                            : 'text-gray-800'
                                    }
                                `}>
                                    {getErrorSeverity(error || fetchError) === 'high' ? 'Critical Error' :
                                        getErrorSeverity(error || fetchError) === 'medium' ? 'Warning' : 'Information'}
                                </p>
                                <p className={`
                                    text-sm mt-1
                                    ${getErrorSeverity(error || fetchError) === 'high'
                                        ? 'text-red-600'
                                        : getErrorSeverity(error || fetchError) === 'medium'
                                            ? 'text-amber-600'
                                            : 'text-gray-600'
                                    }
                                `}>
                                    {getErrorMessage(error || fetchError)}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRefresh}
                                        disabled={isLoading || refreshing}
                                        className={`
                                            ${getErrorSeverity(error || fetchError) === 'high'
                                                ? 'border-red-300 text-red-700 hover:bg-red-50'
                                                : getErrorSeverity(error || fetchError) === 'medium'
                                                    ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                        Try Again
                                    </Button>
                                    {activeCall && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleRetry}
                                            disabled={retrying}
                                            className={`
                                                ${getErrorSeverity(error || fetchError) === 'high'
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : getErrorSeverity(error || fetchError) === 'medium'
                                                        ? 'bg-amber-600 hover:bg-amber-700'
                                                        : 'bg-gray-600 hover:bg-gray-700'
                                                }
                                                text-white
                                            `}
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
