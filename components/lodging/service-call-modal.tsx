"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useServiceCall } from "@/hooks/useServiceCall"
import { useStaffUnits } from "@/hooks/useStaffUnits"
import { Service } from "@/lib/types/service-calls"
import { isApiError } from "@/lib/utils/apiError"
import { CheckCircle, Loader2, Phone, RefreshCw, Shield } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ServiceCallRoom } from "./service-call-room"

// Import React Icons - only import what you need
import { BsPhone } from "react-icons/bs"
import { CgPhone } from "react-icons/cg"
import { FaAdn, FaHeadset, FaPhone, FaUserShield } from "react-icons/fa"
import { FiHeadphones, FiPhone } from "react-icons/fi"
import { HiPhone } from "react-icons/hi"
import { IoCall, IoHeadset } from "react-icons/io5"
import { MdAddCall, MdCall, MdHeadset, MdPhone } from "react-icons/md"
import { RiPhoneLine } from "react-icons/ri"
import { TbPhone } from "react-icons/tb"

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

// Helper function to get the correct icon component from React Icons
const getIconComponent = (iconName: any) => {
    // Handle cases where iconName might not be a string
    if (!iconName || typeof iconName !== 'string') {
        return MdPhone; // Default icon
    }

    // Clean the icon name (remove quotes if any)
    const cleanIconName = iconName.trim();

    // Check different icon libraries based on the prefix
    switch (cleanIconName) {
        // Material Design Icons
        case 'MdAddCall':
        case 'MdAddCall':
            return MdAddCall;
        case 'MdCall':
            return MdCall;
        case 'MdHeadset':
            return MdHeadset;
        case 'MdPhone':
            return MdPhone;

        // Font Awesome Icons
        case 'FaAdn':
            return FaAdn;
        case 'FaPhone':
            return FaPhone;
        case 'FaHeadset':
            return FaHeadset;
        case 'FaUserShield':
            return FaUserShield;

        // Feather Icons
        case 'FiPhone':
            return FiPhone;
        case 'FiHeadphones':
            return FiHeadphones;

        // Heroicons
        case 'HiPhone':
            return HiPhone;

        // Ionicons
        case 'IoCall':
            return IoCall;
        case 'IoHeadset':
            return IoHeadset;

        // Remix Icons
        case 'RiPhoneLine':
            return RiPhoneLine;

        // Tabler Icons
        case 'TbPhone':
            return TbPhone;

        // CoreUI Icons
        case 'CgPhone':
            return CgPhone;

        // Bootstrap Icons
        case 'BsPhone':
            return BsPhone;

        // Default to a phone icon
        default:
            console.warn(`Icon "${cleanIconName}" not found, using default`);
            return MdPhone;
    }
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
        updateCallStatusDirect,
        error,
        callStatus,
        isCalling,
        callDuration,
        retryCall,
        clearError,
        handleLiveKitConnected,
        handleLiveKitDisconnected
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
    const [isLocalLiveKitConnected, setIsLocalLiveKitConnected] = useState(false)
    const [callSessionId, setCallSessionId] = useState<string>('')

    const services = useMemo(() => {
        if (propServices && propServices.length > 0) {
            return propServices;
        }
        return fetchedServices;
    }, [propServices, fetchedServices])

    const formattedServices = useMemo(() => {
        // Filter services to only show those with a configured staffUnitId AND are active
        return services
            .filter(service => {
                // Service must have a staffUnitId (configured device) AND be active
                const hasStaffUnit = !!service.staffUnitId || !!defaultStaffUnitId;
                const isActive = service.isActive === true;
                return hasStaffUnit && isActive;
            })
            .map(service => {
                const isAvailable = service.isActive === true;

                return {
                    ...service,
                    staffUnitId: service.staffUnitId || defaultStaffUnitId,
                    available: isAvailable,
                    status: service.status || (isAvailable ? 'active' : 'inactive'),
                    iconComponent: getIconComponent(service.icon)
                }
            })
    }, [services, defaultStaffUnitId])

    // Check if there are any staff units
    const hasStaffUnits = useMemo(() => {
        return formattedServices.length > 0
    }, [formattedServices])

    // DEBUG: Log active call data when it changes
    useEffect(() => {
        if (activeCall) {
            console.log('🚀 DEBUG - Active Call Data:', {
                activeCall,
                hasActiveCall: !!activeCall,
                roomName: activeCall?.roomName,
                token: activeCall?.token,
                tokenPreview: activeCall?.token ? `${activeCall.token.substring(0, 20)}...` : 'No token',
                tokenLength: activeCall?.token?.length,
                callStatus,
                callDuration,
                serviceName: activeCall?.serviceName,
                userId: activeCall?.userId,
                callSessionId: activeCall?.callSessionId
            })

            // Extract callSessionId from activeCall
            if (activeCall?.callSessionId) {
                setCallSessionId(activeCall.callSessionId);
            }
        } else {
            setCallSessionId('');
        }
    }, [activeCall, callStatus, callDuration])

    // Reset local state when modal closes
    useEffect(() => {
        if (!open) {
            setIsLocalLiveKitConnected(false);
            setCallSessionId('');
            clearError();
        }
    }, [open, clearError]);

    // Reset selected service when call ends
    useEffect(() => {
        if (!activeCall && selectedService) {
            console.log('🔄 Call ended - resetting selected service');
            setSelectedService(null);
            setCallSessionId('');
        }
    }, [activeCall, selectedService]);

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

            console.log('📞 DEBUG - Initiating call with:', {
                serviceId,
                serviceName,
                staffUnitId,
                metadata
            })

            const result = await initiateCall(serviceId, serviceName, staffUnitId, metadata)

            // Extract callSessionId from the result if available
            if (result && result.callSessionId) {
                setCallSessionId(result.callSessionId);
            }

        } catch (error) {
            console.error('Failed to initiate call:', error)
            setSelectedService(null)
            setCallSessionId('')

            if (isApiError(error)) {
                toast.error(error.toUserFriendlyMessage(), {
                    description: error.code === 'UNAUTHORIZED'
                        ? 'Please refresh the page and try again.'
                        : undefined,
                });
            } else {
                toast.error('Unable to initiate call. Please try again.');
            }
        }
    }

    const handleClose = async () => {
        if (activeCall && callStatus !== 'ended' && callStatus !== 'failed') {
            if (confirm('You have an active call. Are you sure you want to end the call?')) {
                try {
                    await cancelCall()
                    setSelectedService(null)
                    setCallSessionId('')
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
            setSelectedService(null)
            setCallSessionId('')
            onOpenChange(false)
        }
    }

    const handleCallEnd = async () => {
        try {
            await cancelCall()
            updateCallStatus('completed')
            setIsLocalLiveKitConnected(false);
            setCallSessionId('')
            setSelectedService(null)
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
        console.log('✅ Call accepted handler called');
        updateCallStatus('in-progress')
        toast.success('Call accepted!', {
            description: 'Connecting to audio server...',
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

    // Show toast for fetch errors
    useEffect(() => {
        if (fetchError && open) {
            const errorMessage = isApiError(fetchError)
                ? fetchError.toUserFriendlyMessage()
                : 'Failed to load services. Please try again.';

            toast.error(errorMessage, {
                duration: 5000,
            });
        }
    }, [fetchError, open]);

    // Show toast for call errors
    useEffect(() => {
        if (error && open) {
            const errorMessage = isApiError(error)
                ? error.toUserFriendlyMessage()
                : 'Call failed. Please try again.';

            toast.error(errorMessage, {
                duration: 5000,
            });
        }
    }, [error, open]);

    // Handle LiveKit connection events
    const handleLiveKitConnection = () => {
        console.log('✅ LiveKit connected - updating parent state');
        setIsLocalLiveKitConnected(true);
        handleLiveKitConnected?.();
    }

    const handleLiveKitDisconnection = () => {
        console.log('🔌 LiveKit disconnected - updating parent state');
        setIsLocalLiveKitConnected(false);
        handleLiveKitDisconnected?.();
    }

    // Don't render modal content if no staff units
    if (!hasStaffUnits && !activeCall) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[calc(100%-4rem)] max-w-md mx-auto max-h-[90vh] overflow-hidden flex flex-col bg-white shadow-2xl rounded-2xl border border-gray-200 my-8">
                <DialogHeader className="shrink-0 px-4 pt-8">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Phone className="w-6 h-6 text-[#128C7E]" />
                            {activeCall ? 'Call' : 'Call a Staff'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Loading State */}
                {isLoading && !hasServices && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-[#128C7E] animate-spin" />
                            <div className="absolute inset-0 rounded-full border-4 border-[#128C7E]/20"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Loading services...</p>
                        <p className="text-sm text-gray-500 mt-2">Fetching available services for this branch</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {!activeCall ? (
                        <div className="space-y-6">
                            {/* Services Grid - Only shows configured and active services */}
                            {formattedServices.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        {formattedServices.map((service) => {
                                            const IconComponent = service.iconComponent
                                            const isCallingService = selectedService === service.id
                                            const isAvailable = service.available

                                            // All services here are configured and active
                                            const style = {
                                                border: "border-[#128C7E]",
                                                background: "bg-gradient-to-r from-[#128C7E]/5 to-[#25D366]/5 hover:from-[#128C7E]/10 hover:to-[#25D366]/10",
                                                iconBackground: "bg-gradient-to-r from-[#128C7E] to-[#25D366]",
                                                iconColor: "text-white",
                                                titleColor: "text-[#128C7E]",
                                                descriptionColor: "text-gray-600",
                                                shadow: "hover:shadow-lg hover:shadow-[#128C7E]/10"
                                            }

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
                                                    title={`Call ${service.name}`}
                                                >
                                                    <div className={`p-3 rounded-full ${isCallingService ? 'bg-[#128C7E] animate-pulse' : style.iconBackground}`}>
                                                        <IconComponent className={`w-7 h-7 ${style.iconColor}`} />
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
                                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                            </div>
                                                            <span className="text-xs text-white font-medium px-2 py-0.5 bg-[#128C7E] rounded-full">Connecting...</span>
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                // No configured services message
                                <div className="flex-1 flex flex-col items-center justify-center p-8">
                                    <div className="text-center">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                                            <Phone className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-gray-800">No Services Configured</h3>
                                        <p className="text-gray-600 mb-6 max-w-md">
                                            There are no call services configured for this branch yet.
                                            Please contact your administrator to set up call services.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={handleRefresh}
                                            disabled={refreshing}
                                            className="border-gray-300"
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                            Check Again
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* The ServiceCallRoom component */}
                            <ServiceCallRoom
                                serviceCall={activeCall}
                                onCallEnd={handleCallEnd}
                                onCallAccepted={handleCallAccepted}
                                callStatus={callStatus}
                                callDuration={callDuration}
                                onRetry={handleRetry}
                                retrying={retrying}
                                onLiveKitConnected={handleLiveKitConnection}
                                onLiveKitDisconnected={handleLiveKitDisconnection}
                                callSessionId={callSessionId}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="shrink-0 pt-4 border-t border-gray-200 px-8 pb-8">
                    {!activeCall ? (
                        <div className="w-full flex justify-between items-center">
                            {/* Right side: Branch info */}
                            <div className="text-right">
                                {branchServiceId && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formattedServices[0]?.branchServiceName || 'Unknown'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-[#128C7E]" />
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
                                        className="border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E]/10"
                                    >
                                        {retrying ? 'Retrying...' : 'Retry Call'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}