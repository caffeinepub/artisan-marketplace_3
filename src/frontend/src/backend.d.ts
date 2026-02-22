import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Item {
    id: string;
    title: string;
    owner: Principal;
    blob: Uint8Array;
    description: string;
    purchaseHistory: Array<Purchase>;
    itemType: ItemType;
    artist: Principal;
    price: bigint;
}
export interface Purchase {
    paymentStatus: PaymentStatus;
    purchaseDate: bigint;
    buyer: Principal;
    price: bigint;
}
export interface ArtistProfile {
    name: string;
    artist: Principal;
    gallery: Array<Item>;
}
export interface UserProfile {
    bio: string;
    isArtist: boolean;
    name: string;
}
export enum ItemType {
    nft = "nft",
    digitalArt = "digitalArt",
    craftItem = "craftItem",
    physicalProduct = "physicalProduct"
}
export enum PaymentStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createItem(title: string, description: string, price: bigint, itemType: ItemType): Promise<string>;
    createNft(itemId: string): Promise<void>;
    getArtistProfile(artist: Principal): Promise<ArtistProfile>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: string): Promise<Item>;
    getNftOwner(itemId: string): Promise<Principal | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    purchaseItem(itemId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveItemImage(itemId: string, blob: Uint8Array): Promise<void>;
    setArtistProfile(name: string): Promise<void>;
}
