<template>
  <q-page padding>
    <!-- content -->
    <div>hello</div>
  </q-page>
</template>

<script>
import { LocalStorage, SessionStorage } from "quasar";
import { useSearchedHistoryStore } from "stores/searchHistory";

export default {
  name: "searchHistory",
  data() {
    return {
      store: useSearchedHistoryStore,
    };
  },
  mounted() {
    let searchedHistory = LocalStorage.getItem("searchHistory");
    if (searchedHistory) {
      this.store.searchedHistory = searchedHistory;
    } else {
      this.store.searchedHistory = [];
    }
  },
};
</script>
