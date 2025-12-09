import { Card, CardContent } from "@/components/ui/card";

export interface InfoCardProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}

export default function InfoCard({
  label,
  value,
  icon,
}: InfoCardProps) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="flex flex-row items-center gap-2 justify-center">
          <div className="mb-2 flex justify-center">{icon}</div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
        </div>
        <p className=" text-lg">{value}</p>
      </CardContent>
    </Card>
  );
}
