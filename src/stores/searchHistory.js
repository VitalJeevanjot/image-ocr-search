import { defineStore } from "pinia";

export const useSearchedHistoryStore = defineStore("counter", {
  state: () => ({
    searchedHistory: [],
  }),
});
