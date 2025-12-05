import { Card, CardContent } from "@/components/ui/card";

export interface InfoCardProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

export default function InfoCard({ label, value, }: InfoCardProps) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className=" text-lg">{value}</p>
      </CardContent>
    </Card>
  );
}
