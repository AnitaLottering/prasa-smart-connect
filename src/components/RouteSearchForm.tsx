import { useState } from "react";
import { ArrowRightLeft, Search, MapPin, Clock } from "lucide-react";
import { STATIONS } from "@/data/prasa";

interface Props {
  initialFrom?: string;
  initialTo?: string;
  initialTime?: string;
  onSearch: (from: string, to: string, time: string) => void;
  compact?: boolean;
}

export function RouteSearchForm({ initialFrom = "", initialTo = "", initialTime = "", onSearch, compact }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [time, setTime] = useState(initialTime);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    onSearch(from, to, time);
  };

}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
