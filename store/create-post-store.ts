import { create } from "zustand";

type CreatePostStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useCreatePostStore = create<CreatePostStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
