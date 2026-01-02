// lib/types/service-calls.ts
import { LucideIcon } from "lucide-react";

export interface ServiceCall {
  id: string;
  serviceId: string;
  serviceName: string;
  userId: string;
  userName: string;
  roomName: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  token?: string;
  serverUrl?: string;
  serviceType?: string;
}

export interface InitiateCallRequest {
  staff_unit_id: string;
  service_type?: string;
  metadata?: Record<string, any>;
}

export interface InitiateCallResponse {
  call_session_id: string;
  room_name: string;
  token: string;
  server_url: string;
  status: string;
  service_name?: string;
  service_type?: string;
  metadata?: Record<string, any>;
}

export interface EndCallRequest {
  call_session_id: string;
  reason?: string;
}

export interface EndCallResponse {
  success: boolean;
  message: string;
  ended_at?: string;
  call_duration?: number;
}

export interface CallStatusResponse {
  call_session_id: string;
  status:
    | "ringing"
    | "connecting"
    | "connected"
    | "ended"
    | "failed"
    | "active"
    | "ai_active"
    | "staffunit_active";
  participants?: Array<{
    user_id: string;
    user_name: string;
    joined_at: string;
  }>;
  duration?: number;
  started_at?: string;
  metadata?: Record<string, any>;
}

// Updated Service interface with API fields
export interface Service {
  id: string;
  name: string;
  description?: string;
  icon: string;
  isActive: boolean;
  branchService: string;
  branchId: string;
  branchServiceName: string;
  // For frontend compatibility
  color?: string;
  bgColor?: string;
  borderColor?: string;
  available?: boolean;
  staffUnitId?: string;
  status?: "active" | "inactive" | "offline";
  staffUnit?: {
    id: string;
    name: string;
    is_active: boolean;
    branch_service: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  erc: number;
  msg: string;
  total: number;
  next: string | null;
  data: T[];
}

export interface StaffUnit {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isActive: boolean;
  branchService: string;
  branchId: string;
  branchServiceName: string;
}

export type CallStatus =
  | "idle"
  | "ringing"
  | "connecting"
  | "ai_active"
  | "staffunit_active"
  | "connected"
  | "ended"
  | "failed";
