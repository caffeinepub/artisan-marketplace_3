import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Item, UserProfile, ItemType, ArtistProfile } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        console.error('[useGetCallerUserProfile] Actor not available');
        throw new Error('Actor not available');
      }
      
      try {
        console.log('[useGetCallerUserProfile] Fetching user profile...');
        const profile = await actor.getCallerUserProfile();
        console.log('[useGetCallerUserProfile] Profile fetched:', profile ? 'exists' : 'null');
        return profile;
      } catch (error) {
        console.error('[useGetCallerUserProfile] Error fetching profile:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        console.error('[useSaveCallerUserProfile] Actor not available');
        throw new Error('Actor not available. Please try logging in again.');
      }

      console.log('[useSaveCallerUserProfile] Saving profile:', {
        name: profile.name,
        isArtist: profile.isArtist,
        bioLength: profile.bio.length,
      });

      try {
        await actor.saveCallerUserProfile(profile);
        console.log('[useSaveCallerUserProfile] Profile saved successfully');
      } catch (error) {
        console.error('[useSaveCallerUserProfile] Error saving profile:', {
          error,
          errorType: error?.constructor?.name,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          profileData: profile,
        });

        // Provide specific error messages based on error type
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();
          
          if (errorMsg.includes('unauthorized') || errorMsg.includes('permission')) {
            throw new Error('You do not have permission to create a profile. Please try logging in again.');
          } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
            throw new Error('Network error. Please check your internet connection and try again.');
          } else if (errorMsg.includes('timeout')) {
            throw new Error('Request timed out. Please try again.');
          } else if (errorMsg.includes('actor')) {
            throw new Error('Backend connection error. Please refresh the page and try again.');
          }
        }

        // Re-throw with more context if it's a generic error
        throw new Error(`Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`);
      }
    },
    onSuccess: () => {
      console.log('[useSaveCallerUserProfile] Invalidating profile queries');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('[useSaveCallerUserProfile] Mutation error:', error);
    },
  });
}

export function useCreateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      price: bigint;
      itemType: ItemType;
      blob: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        // Create item
        const itemId = await actor.createItem(
          params.title,
          params.description,
          params.price,
          params.itemType
        );
        
        // Upload image
        await actor.saveItemImage(itemId, params.blob);
        
        // Create NFT if item type is NFT
        if (params.itemType === ItemType.nft) {
          await actor.createNft(itemId);
        }
        
        return itemId;
      } catch (error) {
        console.error('[useCreateItem] Error creating item:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });

        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized')) {
            throw new Error('You do not have permission to create items');
          } else if (error.message.includes('network')) {
            throw new Error('Network error. Please check your connection and try again');
          }
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['myItems'] });
    },
    onError: (error) => {
      console.error('[useCreateItem] Mutation error:', error);
    },
  });
}

export function useGetItem(itemId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: async () => {
      if (!actor || !itemId) throw new Error('Actor or itemId not available');
      return actor.getItem(itemId);
    },
    enabled: !!actor && !actorFetching && !!itemId,
  });
}

export function usePurchaseItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseHistory'] });
    },
  });
}

export function useGetArtistProfile(artistPrincipal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ArtistProfile>({
    queryKey: ['artistProfile', artistPrincipal],
    queryFn: async () => {
      if (!actor || !artistPrincipal) throw new Error('Actor or artist principal not available');
      return actor.getArtistProfile(Principal.fromText(artistPrincipal));
    },
    enabled: !!actor && !actorFetching && !!artistPrincipal,
  });
}

export function useSetArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setArtistProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistProfile'] });
    },
  });
}

export function useGetNftOwner(itemId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal | null>({
    queryKey: ['nftOwner', itemId],
    queryFn: async () => {
      if (!actor || !itemId) throw new Error('Actor or itemId not available');
      return actor.getNftOwner(itemId);
    },
    enabled: !!actor && !actorFetching && !!itemId,
  });
}
