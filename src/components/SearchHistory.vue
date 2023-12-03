<template>
  <div
    style="
      overflow-y: scroll;
      width: 72vw;
      height: 75vh;
      border: rgba(255, 255, 255, 0.5) 2px solid;
      border-radius: 10px;
      background-color: #111414;
    "
  >
    <p class="text-subtitle1 q-ma-sm text-white">
      Indexed paths ({{ stored_paths.length }}):
    </p>
    <div class="row justify-center" v-for="value in stored_paths" :key="value">
      <q-card
        class="q-ma-sm"
        style="
          min-width: 220px;
          min-height: 80px;
          width: 70vw;
          border-radius: 25px;
          background-color: #2a3737;
          color: white;
        "
      >
        <q-card-section
          >{{ value.name }}
          <q-btn
            dense
            round
            icon="edit"
            class="bg-grey-10 q-ml-sm"
            size="0.5rem"
            ><q-tooltip>Edit name</q-tooltip></q-btn
          ></q-card-section
        >
        <p class="q-ml-md text-grey-5 text-caption">
          {{ value.date }}
        </p>
        <q-card-actions align="right">
          <q-btn
            flat
            style="border: black 2px solid"
            class="text-black bg-grey-3"
            round
            @click="goToImageSearch(value)"
            icon="image_search"
          />
          <q-btn
            flat
            dense
            style="border: black 2px solid"
            class="text-white bg-red q-ml-md"
            round
            icon="remove"
            @click="askToRemoveIndexedData(value)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>

  <q-dialog v-model="askForDeletionDialog">
    <q-card dark style="min-width: 250px; width: 50vw">
      <q-card-section>
        <div class="row">
          <div class="text-subtitle1">Delete indexed data.</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-5 bg-grey-10"
            @click="closeAskForDeletionDialog"
          />
        </div>
      </q-card-section>
      <q-separator dark />
      <q-card-section class="q-pt-sm text-caption text-white">
        {{ uuidToDelete }}
      </q-card-section>
      <q-separator dark />
      <q-card-section
        class="q-pt-sm text-caption text-white"
        style="white-space: pre-line"
      >
        {{ pathsToDelete.replace(/,/gi, "\n") }}
      </q-card-section>
      <q-separator dark />
      <q-card-section>
        <div class="row">
          <q-space />
          <q-btn
            class="q-ml-sm text-white bg-red self-center"
            dense
            size="0.8rem"
            flat
            icon="delete"
            round
            @click="deleteUUID"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 15px;
}
::-webkit-scrollbar-thumb {
  background: #2a3737;
  border-radius: 5px;
}

::-webkit-scrollbar-track {
  background: rgb(113, 117, 117);
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #354444;
}

#button_main {
  background-color: rgb(42, 55, 55);
  color: white;
  border: 1px solid rgb(24, 32, 32);
}
</style>
<script>
import { LocalStorage, Notify } from "quasar";
export default {
  // name: 'ComponentName',
  data() {
    return {
      stored_paths: [],
      askForDeletionDialog: false,
      uuidToDelete: null,
      pathsToDelete: null,
    };
  },
  methods: {
    goToImageSearch(value) {
      LocalStorage.set("current_uuid__££__image_ocr_search2", value.uuid);
      this.$router.push("/filesSearch");
    },
    askToRemoveIndexedData(val) {
      this.uuidToDelete = val.uuid;
      this.pathsToDelete = val.paths;
      this.askForDeletionDialog = true;
    },
    closeAskForDeletionDialog() {
      this.askForDeletionDialog = false;
    },
    async deleteUUID() {
      try {
        await window.indexedDb.pathsIndexed
          .where("uuid")
          .equals(this.uuidToDelete)
          .delete();
        LocalStorage.remove(`${this.uuidToDelete}__££__image_ocr_search1`);
      } catch (err) {
        Notify.create({ message: "Error while deleting: " + err + " ❌" });
      }
      this.fetchData();
      this.askForDeletionDialog = false;
    },
    async fetchData() {
      var all_stored_paths = LocalStorage.getAll();
      var all_keys = Object.keys(all_stored_paths);

      this.stored_paths = [];
      // console.log(all_keys);
      for (var i = 0; i < all_keys.length; i++) {
        if (all_keys[i].split("__££__")[1] == "image_ocr_search1") {
          if (LocalStorage.getItem(all_keys[i]).split("__££__")[1] == " ") {
            this.stored_paths.push({
              paths: LocalStorage.getItem(all_keys[i]).split("__££__")[0],
              name: all_keys[i].split("__££__")[0],
              date: LocalStorage.getItem(all_keys[i]).split("__££__")[2],
              uuid: all_keys[i].split("__££__")[0],
            });
          } else {
            this.stored_paths.push({
              paths: LocalStorage.getItem(all_keys[i]).split("__££__")[0],
              name: LocalStorage.getItem(all_keys[i]).split("__££__")[1],
              date: LocalStorage.getItem(all_keys[i]).split("__££__")[2],
              uuid: all_keys[i].split("__££__")[0],
            });
          }
        }
      }
      this.stored_paths = this.stored_paths.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
