"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AIChatRoomItem } from "@/components/shared/AiChatAssistant";
import { BedDouble, Wifi } from "lucide-react";

interface RoomCardProps {
  room: AIChatRoomItem;
  branchId: string;
  payload: string;
  className?: string;
}

export function RoomCard({ room, branchId, payload, className }: RoomCardProps) {
  const href = `/branch/${branchId}/services/lodging/${room.id}${payload ? `?payload=${payload}` : ""}`;

  return (
    <Link href={href} className="block">
      <Card className={cn("overflow-hidden shadow-md", className)}>
      <CardHeader className="p-0">
        {room.imageUrl && (
          <div className="relative w-full h-24">
            <Image
              src={room.imageUrl}
              alt={room.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-sm font-semibold truncate">
          {room.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1 h-8 overflow-hidden">
          {room.shortDescription}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-bold text-teal-600">
            {room.currencyCode} {room.price.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <Wifi className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
      </Card>
    </Link>
  );
}