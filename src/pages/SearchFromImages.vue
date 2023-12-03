<template>
  <q-page padding>
    <q-page-sticky position="top-left" :offset="[18, 18]">
      <q-btn
        class="text-white self-center"
        dense
        flat
        icon="arrow_back"
        rounded
        @click="$router.back()"
      />
    </q-page-sticky>

    <div class="row justify-center">
      <q-input
        v-model="search_text"
        filled
        color="grey-8"
        dark
        dense
        style="min-width: 250px; width: 40vw"
      ></q-input>
      <q-btn icon="search" class="q-ml-sm bg-grey-8 text-white" round>
        <q-tooltip>Search text</q-tooltip>
      </q-btn>
    </div>

    <q-page-sticky
      position="top-right"
      :offset="[18, 18]"
      style="z-index: 10000"
    >
      <div
        style="
          background-color: rgb(42, 42, 42);
          padding: 5px;
          border-radius: 2px;
        "
      >
        <span class="text-white q-mr-md"
          >{{ currentPage + 1 }}
          <span v-if="totalResults > imagesPerPage">({{ imagesPerPage }})</span>
          / {{ totalPages }} ({{ totalResults }})</span
        >
        <q-btn
          class="text-white self-center bg-grey-10"
          dense
          icon="arrow_back"
          squared
          :disable="currentPage + 1 <= 1 ? true : false"
          @click="decrementPage"
        />
        <q-btn
          class="text-white self-center bg-grey-10"
          dense
          icon="arrow_forward"
          squared
          :disable="currentPage + 1 >= totalPages ? true : false"
          @click="incrementPage"
        />
      </div>
    </q-page-sticky>

    <div>
      <div class="row justify-center q-mt-lg">
        <div
          class="q-mx-md q-my-md"
          v-for="(path, index) in imagesPaths"
          :key="index"
        >
          <div class="container">
            <q-img
              class="self-start"
              :src="thumbnails[index]"
              @click="openImage(path)"
              style="height: 20vh; width: 20vw; border: 2px solid #efefef"
            />
            <q-btn
              class="text-white btn bg-grey-10"
              dense
              size="0.8rem"
              flat
              icon="info"
              rounded
              @click="openImageInfoDialog(index)"
            />
          </div>
          <p
            style="width: 20vw; overflow-wrap: break-word"
            class="text-white q-pt-sm"
          >
            {{ path.split("\\").pop() }}
          </p>
        </div>
      </div>
    </div>

    <q-dialog v-model="imageInfoDialog">
      <q-card dark style="min-width: 250px; width: 50vw">
        <q-card-section>
          <div class="row">
            <div class="text-subtitle1">Image text data.</div>
            <q-space />
            <q-btn
              flat
              round
              dense
              icon="close"
              color="grey-5 bg-grey-10"
              @click="closeImageInfoDialog"
            />
          </div>
        </q-card-section>
        <q-separator dark />
        <q-card-section class="q-pt-sm text-caption text-grey-6">
          {{ imagesPaths[currentIndex] }}
        </q-card-section>
        <q-separator dark />
        <q-card-section class="q-pt-md">
          <div class="row">
            <q-input
              v-model="search_local_text"
              @update:model-value="setTextStatus"
              ref="local_search"
              filled
              color="grey-8"
              dark
              dense
              style="min-width: 250px; width: 10vw"
            ></q-input>
            <q-btn
              class="q-ml-sm text-white bg-grey-10 self-center"
              dense
              size="0.8rem"
              flat
              :icon="searchingLocalText ? 'close' : 'search'"
              round
              @click="highlightSearchedText"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-pt-xs">
          {{ textData[currentIndex] }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.container {
  position: relative;
}
.container .btn {
  position: absolute;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
}
</style>

<script>
import { LocalStorage } from "quasar";
export default {
  name: "SearchFromImages",
  data() {
    return {
      search_text: "",
      search_local_text: "",
      imagesPerPage: 30,
      totalResults: 0,
      currentPage: 0,
      totalPages: 0,
      imagesPaths: [],
      imagesCount: 0,
      thumbnails: [],
      textData: [],
      currentIndex: null,
      imageInfoDialog: false,
      searchingLocalText: false,
    };
  },
  methods: {
    setTextStatus(newVal) {
      if (!newVal) {
        this.searchingLocalText = false;
        window.imgSearchAPI.stopSearchTextInApp();
      }
    },
    openImage(path) {
      window.imgSearchAPI.openImageInDefault(path);
    },
    openImageInfoDialog(index) {
      this.currentIndex = index;
      this.imageInfoDialog = true;
    },
    closeImageInfoDialog() {
      this.imageInfoDialog = false;
      this.searchingLocalText = false;
      window.imgSearchAPI.stopSearchTextInApp();
    },
    async highlightSearchedText() {
      if (!this.search_local_text || this.searchingLocalText == true) {
        window.imgSearchAPI.stopSearchTextInApp();
        this.searchingLocalText = false;
        return;
      }
      window.imgSearchAPI.searchTextInApp(this.search_local_text);
      this.searchingLocalText = true;
    },
    async incrementPage() {
      this.currentPage++;
      await this.getImagesData();
    },
    async decrementPage() {
      this.currentPage--;
      await this.getImagesData();
    },
    async getImagesData() {
      this.imagesPaths = [];
      this.thumbnails = [];
      var current_uuid = LocalStorage.getItem(
        "current_uuid__££__image_ocr_search2"
      );
      var data = await window.indexedDb.pathsIndexed
        .where("uuid")
        .equals(current_uuid)
        .offset(this.currentPage * this.imagesPerPage)
        .limit(this.imagesPerPage)
        .toArray();
      // console.log(data);
      var length = data.length > 30 ? this.imagesPerPage : data.length;
      for (var i = 0; i < length; i++) {
        this.imagesPaths.push(data[i].img_path);
        this.thumbnails.push(
          await window.imgSearchAPI.getImageThumbnail(data[i].img_path)
        );
        this.textData.push(data[i].text_data);
      }
      this.totalResults = await window.indexedDb.pathsIndexed
        .where("uuid")
        .equals(current_uuid)
        .count();
      this.totalPages =
        parseInt(this.totalResults / this.imagesPerPage) +
        (this.totalResults % this.imagesPerPage > 0)
          ? 1
          : 0;
      // console.log(this.totalPages);
    },
  },
  async mounted() {
    await this.getImagesData();
  },
};
</script>
