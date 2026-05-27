import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function LoadingState() {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center space-y-2 mb-8">
        <h3 className="font-serif text-xl font-medium">Crafting your quiz</h3>
        <p className="text-sm text-muted-foreground">This usually takes 15–30 seconds.</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full mt-4" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}
