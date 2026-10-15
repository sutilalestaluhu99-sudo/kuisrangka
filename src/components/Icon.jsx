import {
  ArrowRight, ArrowUpRight, Bone, BookOpen, BookOpenCheck, Brain, ChartNoAxesCombined,
  Check, Circle, CircleAlert, CircleCheck, CircleHelp, CircleX, ClipboardCheck, Clock3,
  Database, DatabaseBackup, Download, Flame, Footprints, GraduationCap, Info, LayoutDashboard,
  Lightbulb, ListChecks, MapPin, MessageCircle, PartyPopper, Pause, Play, Puzzle, RotateCcw,
  Scan, Settings2, ShieldCheck, ShieldPlus, Sparkles, Star, Target, Timer, Trophy, Upload,
  UserRound, Volume2, Zap
} from 'lucide-react'

const icons = {
  ArrowRight, ArrowUpRight, Bone, BookOpen, BookOpenCheck, Brain, ChartNoAxesCombined,
  Check, Circle, CircleAlert, CircleCheck, CircleHelp, CircleX, ClipboardCheck, Clock3,
  Database, DatabaseBackup, Download, Flame, Footprints, GraduationCap, Info, LayoutDashboard,
  Lightbulb, ListChecks, MapPin, MessageCircle, PartyPopper, Pause, Play, Puzzle, RotateCcw,
  Scan, Settings2, ShieldCheck, ShieldPlus, Sparkles, Star, Target, Timer, Trophy, Upload,
  UserRound, Volume2, Zap
}

export function Icon({ name, size = 20, ...props }) {
  const IconComponent = icons[name] ?? Circle
  return <IconComponent size={size} strokeWidth={1.9} aria-hidden="true" {...props} />
}
