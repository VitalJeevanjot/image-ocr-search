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

    <div>
      <div class="row justify-center">
        <div
          class="q-mx-md q-my-md"
          v-for="(image, index) in imagesPaths"
          :key="index"
        >
          <q-img
            class="self-start"
            :src="thumbnails[index]"
            @click="openImage(image)"
            style="height: 20vh; width: 20vw; border: 2px solid #efefef"
          />
          <p
            style="width: 20vw; overflow-wrap: break-word"
            class="text-white q-pt-sm"
          >
            {{ image.split("\\").pop() }}
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { LocalStorage } from "quasar";
export default {
  name: "SearchFromImages",
  data() {
    return {
      search_text: "",
      imagesPerPage: 30,
      currentPage: 0,
      imagesPaths: [],
      imagesCount: 0,
      thumbnails: [],
    };
  },
  methods: {
    openImage(path) {
      window.imgSearchAPI.openImageInDefault(path);
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
        "current_uuid__££__image_ocr_search"
      );
      var data = await window.indexedDb.pathsIndexed
        .where("uuid")
        .equals(current_uuid)
        .offset(this.currentPage * this.imagesPerPage)
        .limit(this.imagesPerPage)
        .toArray();
      console.log(data);
      var length = data.length > 30 ? this.imagesPerPage : data.length;
      for (var i = 0; i < length; i++) {
        this.imagesPaths.push(data[i].img_path);
        this.thumbnails.push(
          await window.imgSearchAPI.getImageThumbnail(data[i].img_path)
        );
      }
    },
  },
  async mounted() {
    await this.getImagesData();
  },
};
</script>
