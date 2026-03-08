import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Upload,
  Trash2,
  Edit3,
  BarChart2,
  LogOut,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName =
  | "ArrowLeft"
  | "ArrowRight"
  | "Check"
  | "CheckCircle"
  | "ChevronRight"
  | "Play"
  | "Pause"
  | "Volume2"
  | "VolumeX"
  | "Maximize"
  | "RotateCcw"
  | "Upload"
  | "Trash2"
  | "Edit3"
  | "BarChart2"
  | "LogOut"
  | "AlertTriangle"
  | "Info"
  | "Wifi"
  | "WifiOff";

const iconsMap: Record<IconName, LucideIcon> = {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Upload,
  Trash2,
  Edit3,
  BarChart2,
  LogOut,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff,
};

interface IconProps {
  name: IconName;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export default function Icon({ name, size = "md", className }: IconProps) {
  const SvgIcon = iconsMap[name];

  if (!SvgIcon) {
    console.error(`Invalid Icon name: ${name}`);
    return null;
  }

  const pixelSize = sizeMap[size];

  return <SvgIcon size={pixelSize} className={cn("shrink-0", className)} aria-hidden="true" />;
}
