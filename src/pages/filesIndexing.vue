<template>
  <q-page padding>
    <!-- content -->
    <q-page-sticky position="top-left" :offset="[18, 18]">
      <q-btn
        class="text-white self-center"
        dense
        flat
        icon="arrow_back"
        rounded
        @click="stopAndGoBack"
      />
      <q-space />
      <!-- <span class="self-center text-white text-title q-mr-lg">
        Image search
      </span>
      <q-space /> -->
    </q-page-sticky>
    <div class="row justify-center" id="container">
      <q-btn
        v-if="!start_indexing"
        icon="folder_open"
        id="button_main"
        round
        style="text-transform: capitalize"
        unelevated
        @click="selectFolderToSearchFromAndSearch"
        ><q-tooltip>Pick folder to start indexing.</q-tooltip></q-btn
      >
      <q-btn
        icon="content_paste"
        round
        unelevated
        size="sm"
        class="self-center q-ml-sm text-grey-2"
        style="background-color: rgb(49, 49, 49)"
        v-if="selectedFoldersToSearchFrom"
        @click="copyPickedPath(selectedFoldersToSearchFrom)"
        ><q-tooltip>Copy Picked Path(s)</q-tooltip></q-btn
      >
    </div>
    <!-- <div
      class="row justify-center q-mt-sm"
      id="container"
      v-if="selectedImageToSearch"
    >
      <q-btn
        round
        icon="search"
        style="text-transform: capitalize"
        id="button_main"
        @click="selectFolderToSearchFromAndSearch"
      >
        <q-tooltip>Select folder to search from and Start search</q-tooltip>
      </q-btn>
    </div> -->
    <div class="row justify-center q-mt-lg" v-if="start_indexing">
      <q-btn
        dense
        round
        size="0.5rem"
        icon="close"
        class="bg-red-9 text-white"
        @click="stopAndGoBack"
        ><q-tooltip>Stop processing</q-tooltip></q-btn
      >
    </div>
    <div class="row justify-center q-mt-xs">
      <q-circular-progress
        show-value
        class="text-white q-ma-md"
        :value="progress_value"
        size="90px"
        :thickness="0.2"
        color="grey-7"
        center-color="grey-9"
        track-color="transparent"
      >
        {{ progress_value }}%
      </q-circular-progress>
    </div>
    <div class="row justify-center q-mt-sm" v-if="start_indexing">
      <q-spinner color="grey-8" size="1rem" />
    </div>
    <div class="row justify-center q-mt-sm">
      <p class="text-caption text-grey-7">
        {{ processed_files }} / {{ total_selected_files }}
      </p>
    </div>
    <div
      class="row justify-center q-mt-sm items-center"
      v-if="currentWorkers > 0"
    >
      <span class="text-caption text-grey-1"
        >Workers: {{ currentWorkers }}</span
      >
      <q-btn
        class="text-white bg-grey-10 q-ml-sm"
        dense
        icon="add"
        squared
        @click="increaseWorker"
      />
    </div>
    <div
      class="row justify-center q-mt-sm"
      id="container"
      v-for="path in selectedFoldersToSearchFrom"
      :key="path"
    >
      <p class="text-caption self-center q-ml-sm text-grey">Path: {{ path }}</p>
    </div>
  </q-page>
</template>

<script>
import { Notify, copyToClipboard, LocalStorage } from "quasar";

export default {
  name: "FilesSearch",
  data() {
    return {
      selectedFoldersToSearchFrom: null,
      selectedFilePaths: null,
      searchedImages: 0,
      progress_value: 0,
      processed_files: 0,
      total_selected_files: 0,
      start_indexing: false,
      currentWorkers: 0,
    };
  },
  async mounted() {
    await window.imgSearchAPI.terminateWorker();
    await this.getNumberOfWorkers();
  },
  methods: {
    async stopAndGoBack() {
      this.start_indexing = false;
      await window.imgSearchAPI.terminateWorker();
      this.$router.back();
    },
    async increaseWorker() {
      this.currentWorkers = await window.imgSearchAPI.increaseWorkerByOne();
    },
    async getNumberOfWorkers() {
      this.currentWorkers = await window.imgSearchAPI.getTotalNumberOfWorkers();
      // console.log(this.currentWorkers);
    },
    async copyPickedPath(path) {
      if (!path) {
        Notify.create({ message: "⚠️ Please select a path first" });
        return;
      }
      copyToClipboard(path)
        .then(() => {
          // success!
          Notify.create({ message: "📋 Copied to clipboard" });
        })
        .catch(() => {
          // fail
          Notify.create({ message: error?.toString() + " " + "❌" });
        });
    },
    // async selectSourceImageFile() {
    //   this.selectedImageToSearch = await window.imgSearchAPI.selectFile();
    //   this.searchImages();
    // },
    async selectFolderToSearchFromAndSearch() {
      const { filesPaths, folderPaths } =
        await window.imgSearchAPI.openFolder();
      // console.log(filesPaths);
      // console.log(folderPaths);
      this.selectedFoldersToSearchFrom = folderPaths;
      this.selectedFilePaths = filesPaths;
      if (filesPaths) {
        this.start_indexing = true;
        await window.imgSearchAPI.startWorker();
        await this.getNumberOfWorkers();
        this.startIndexing();
      }
      // this.searchImages(filesPaths);
    },

    async startIndexing() {
      this.total_selected_files = this.selectedFilePaths.length;
      this.progress_value = 0;
      var _uuid = crypto.randomUUID();
      var n_d = new Date();
      // uuid -> paths, name, date
      LocalStorage.set(
        _uuid.toString() + "__££__" + "image_ocr_search1",
        this.selectedFoldersToSearchFrom +
          "__££__" +
          " " +
          "__££__" +
          n_d.toLocaleString()
      );
      // initialize worker
      // const worker = await Tesseract.createWorker({
      //   langPath: "../../public/languageData",
      // });
      // await worker.load();
      // await worker.loadLanguage("eng");
      // await worker.initialize("eng");

      for (var i = 0; i < this.selectedFilePaths.length; i++) {
        if (this.start_indexing == false) {
          break;
        }
        // console.log("------------------");
        // console.log(i);
        // console.log("------------------");
        // const {
        //   data: { text },
        // } = await worker.recognize(imgDataUrlSource);
        var text = [];
        var paths = [];
        var leftover = this.selectedFilePaths.length - i;
        var current_workers =
          leftover > this.currentWorkers ? this.currentWorkers : leftover;
        for (var j = 0; j < current_workers; j++) {
          paths.push(this.selectedFilePaths[i + j]);
        }
        i = i + (current_workers - 1);
        text = await window.imgSearchAPI.processImg(paths);
        // console.log(text);
        console.log(text);
        for (var k = 0; k < current_workers; k++) {
          this.progress_value = parseInt(
            ((i + 1) / this.selectedFilePaths.length) * 100
          );
          var d = new Date();
          await window.indexedDb.pathsIndexed.add({
            uuid: _uuid,
            processed_date: d.toLocaleString(),
            img_path: paths[k],
            text_data: text[k],
          });
          this.processed_files = i + 1;
          // console.log(text[k]);
        }
        // console.log(text);
      }
      if (this.start_indexing == true) {
        this.start_indexing = false;
        await window.imgSearchAPI.terminateWorker();
      }
      // terminate worker
      // await worker.terminate();
    },
  },
};
</script>
