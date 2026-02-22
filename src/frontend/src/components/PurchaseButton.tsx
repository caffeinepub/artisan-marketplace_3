import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Item } from '../backend';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import PurchaseModal from './PurchaseModal';

interface PurchaseButtonProps {
  item: Item;
}

export default function PurchaseButton({ item }: PurchaseButtonProps) {
  const { identity } = useInternetIdentity();
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = !!identity;
  const isOwner = identity && item.artist.toString() === identity.getPrincipal().toString();
  const isSold = item.owner.toString() !== item.artist.toString();

  if (!isAuthenticated) {
    return (
      <Button disabled className="w-full gap-2">
        <ShoppingCart className="h-4 w-4" />
        Login to Purchase
      </Button>
    );
  }

  if (isOwner) {
    return (
      <Button disabled variant="outline" className="w-full">
        Your Item
      </Button>
    );
  }

  if (isSold) {
    return (
      <Button disabled variant="secondary" className="w-full">
        Sold Out
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="w-full gap-2">
        <ShoppingCart className="h-4 w-4" />
        Purchase Now
      </Button>
      <PurchaseModal 
        item={item} 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </>
  );
}
