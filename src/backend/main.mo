import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Nat32 "mo:core/Nat32";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Blob "mo:core/Blob";

actor {
  // User and authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  public type ItemType = { #digitalArt; #physicalProduct; #nft; #craftItem };
  public type PaymentStatus = { #pending; #completed; #failed };

  public type Item = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    artist : Principal;
    itemType : ItemType;
    blob : Blob;
    owner : Principal;
    purchaseHistory : [Purchase];
  };

  public type Purchase = {
    buyer : Principal;
    purchaseDate : Nat64;
    price : Nat;
    paymentStatus : PaymentStatus;
  };

  public type ArtistProfile = {
    artist : Principal;
    name : Text;
    gallery : [Item];
  };

  public type UserProfile = {
    name : Text;
    bio : Text;
    isArtist : Bool;
  };

  // State
  let items = Map.empty<Text, Item>();
  let artistProfiles = Map.empty<Principal, ArtistProfile>();
  let nfts = Map.empty<Text, Principal>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper modules
  module Item {
    public func compareById(a : Item, b : Item) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Any authenticated user (including guests) can view their own profile
    // This is needed for onboarding and profile loading
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Authorization: Can only view your own profile unless you're an admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Allow any user (including guests during initial signup) to save their profile
    // This is essential for the onboarding flow
    
    // Check if this is the first time the user is creating a profile
    let maybeExistingProfile = userProfiles.get(caller);

    // Save the profile first to ensure it succeeds
    userProfiles.add(caller, profile);

    // Log success messages (for debugging/monitoring, not user-facing)
    // Note: In production, use a proper logging system instead of these comments
    switch (maybeExistingProfile) {
      case (null) {
        // New user onboarding completed
        // Log: User onboarded as Artist or Buyer based on profile.isArtist
      };
      case (?existingProfile) {
        // Existing user profile updated
        if (existingProfile.isArtist != profile.isArtist) {
          // Log: User role changed from Artist to Buyer or vice versa
        };
      };
    };
  };

  // Item management
  public shared ({ caller }) func createItem(title : Text, description : Text, price : Nat, itemType : ItemType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create items");
    };

    let id = caller.toText() # "/" # title;
    let newItem : Item = {
      id;
      title;
      description;
      price;
      artist = caller;
      itemType;
      blob = Blob.empty();
      owner = caller;
      purchaseHistory = [];
    };

    items.add(id, newItem);
    id;
  };

  public query func getItem(id : Text) : async Item {
    // Public access - anyone can view items (including guests)
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
  };

  // Artist profiles
  public shared ({ caller }) func setArtistProfile(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set artist profiles");
    };

    let profile : ArtistProfile = {
      artist = caller;
      name;
      gallery = [];
    };

    artistProfiles.add(caller, profile);
  };

  public query func getArtistProfile(artist : Principal) : async ArtistProfile {
    // Public access - anyone can view artist profiles
    switch (artistProfiles.get(artist)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?profile) { profile };
    };
  };

  // NFT management
  public shared ({ caller }) func createNft(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create NFTs");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        // Verify caller owns the item
        if (item.artist != caller) {
          Runtime.trap("Unauthorized: Only the item artist can convert it to NFT");
        };
        nfts.add(itemId, caller);
      };
    };
  };

  public query func getNftOwner(itemId : Text) : async ?Principal {
    // Public access - anyone can check NFT ownership
    nfts.get(itemId);
  };

  // Blob management
  public shared ({ caller }) func saveItemImage(itemId : Text, blob : Blob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload images");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        // Verify caller is the artist who created the item
        if (item.artist != caller) {
          Runtime.trap("Unauthorized: Only the item artist can upload images");
        };

        let updatedItem : Item = {
          item with
          blob;
        };
        items.add(itemId, updatedItem);
      };
    };
  };

  // Payment system (mock)
  public shared ({ caller }) func purchaseItem(itemId : Text) : async () {
    // Anyone including guests can purchase (no permission check needed)
    // In production, you might want to require at least guest authentication

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        // Prevent artist from buying their own item
        if (item.artist == caller) {
          Runtime.trap("Cannot purchase your own item");
        };

        // Check if item is still available (owned by original artist)
        if (item.owner != item.artist) {
          Runtime.trap("Item already sold");
        };

        let purchase : Purchase = {
          buyer = caller;
          purchaseDate = 0;
          price = item.price;
          paymentStatus = #completed;
        };

        let updatedItem : Item = {
          item with
          owner = caller;
          purchaseHistory = item.purchaseHistory.concat([purchase]);
        };
        items.add(itemId, updatedItem);

        // Update NFT ownership if this is an NFT
        switch (nfts.get(itemId)) {
          case (?_) {
            nfts.add(itemId, caller);
          };
          case (null) {};
        };
      };
    };
  };
};
