export type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export type ProfileResponse = {
  user: {
    id: string;
    email: string | null;
  };
  profile: Profile | null;
};
