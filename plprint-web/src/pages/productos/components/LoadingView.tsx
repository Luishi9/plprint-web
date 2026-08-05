import { Icon } from '@/components/ui/Icon';

interface LoadingViewProps {
  message: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Icon name="progress_activity" size={32} className="animate-spin text-[#2e9e9b]" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
