import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePurchaseItem } from '../hooks/useQueries';
import { Item } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseModalProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRANSACTION_FEE_PERCENT = 5;

export default function PurchaseModal({ item, open, onOpenChange }: PurchaseModalProps) {
  const navigate = useNavigate();
  const purchaseItem = usePurchaseItem();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const price = Number(item.price);
  const transactionFee = (price * TRANSACTION_FEE_PERCENT) / 100;
  const total = price;

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await purchaseItem.mutateAsync(item.id);
      toast.success('Purchase successful!');
      onOpenChange(false);
      navigate({ to: '/purchase-confirmation/$itemId', params: { itemId: item.id } });
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Confirm Purchase</DialogTitle>
          <DialogDescription>
            Review your purchase details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Item Price</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Transaction Fee ({TRANSACTION_FEE_PERCENT}%)</span>
              <span>${transactionFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
            <p>This is a mock payment for MVP testing. No real payment will be processed.</p>
            <p className="mt-1">The artist will receive ${(price - transactionFee).toFixed(2)} after the {TRANSACTION_FEE_PERCENT}% transaction fee.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPurchasing}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Purchase'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
