"use client";

import { QrCode, RefreshCw } from "lucide-react";

interface SessionExpiredModalProps {
  isOpen: boolean;
}

export function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal content */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 py-8 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Session Expired
              </h2>
              <p className="text-white/80 text-sm">
                Your session has timed out for security reasons
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Please Scan the QR Code Again
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To continue using our services, please scan the QR code at your
                location to start a new session.
              </p>
            </div>

            {/* Visual divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Session Info
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Info box */}
            <div className="bg-muted/50 rounded-xl p-4 text-left">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Why did this happen?</span>
                <br />
                Sessions expire after a period of inactivity to keep your data
                secure. Simply scan the QR code to continue.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-6 h-6 rounded-md overflow-hidden">
                <img
                  src="/ih-logo.svg"
                  alt="ih Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span>Powered by ihakken</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
