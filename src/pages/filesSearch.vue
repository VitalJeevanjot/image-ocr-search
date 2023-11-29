<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center">
      <q-btn
        class="text-white self-center"
        dense
        flat
        icon="arrow_back"
        rounded
        @click="goBack"
      />
      <q-space />
      <q-btn
        icon="content_paste"
        round
        unelevated
        size="sm"
        class="self-center q-ml-sm text-grey-2"
        style="background-color: rgb(49, 49, 49)"
        @click="copyPickedPath(path)"
        ><q-tooltip>Copy Picked Path</q-tooltip></q-btn
      >
      <!-- <span class="self-center text-white text-title q-mr-lg">
        Image search
      </span>
      <q-space /> -->
    </div>
    <div class="row justify-center" id="container">
      <q-btn
        icon="search"
        id="button_main"
        round
        style="text-transform: capitalize"
        unelevated
        @click="selectSourceImageFile"
        ><q-tooltip>Pick image to search</q-tooltip></q-btn
      >
      <span class="text-caption self-center q-ml-sm text-grey"
        >Path: {{ selectImageToSearch }}</span
      >
    </div>
    <div
      class="row justify-center q-mt-sm"
      id="container"
      v-if="selectImageToSearch"
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
    </div>
    <div
      class="row justify-center q-mt-sm"
      id="container"
      v-for="path in selectFoldersToSearchFrom"
      :key="path"
    >
      <p class="text-caption self-center q-ml-sm text-grey">Path: {{ path }}</p>
    </div>
  </q-page>
</template>

<script>
import { Notify, copyToClipboard } from "quasar";

export default {
  name: "FilesSearch",
  data() {
    return {
      selectImageToSearch: "",
      selectFoldersToSearchFrom: "",
      searchedImages: 0,
    };
  },
  mounted() {},
  methods: {
    goBack() {
      this.$router.back();
    },
    async copyPickedPath(path) {
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
    async selectSourceImageFile() {
      this.selectImageToSearch = await window.imgSearchAPI.selectFile();
      this.searchImages();
    },
    // async selectFolderToSearchFromAndSearch() {
    //   const { filesPaths, folderPaths } =
    //     await window.imgSearchAPI.openFolder();
    //   this.selectFoldersToSearchFrom = folderPaths;
    //   window.totalSelectedPaths = filesPaths;
    //   this.searchImages(filesPaths);
    // },

    async searchImages() {
      // let canvas1 = document.createElement("canvas")
      // canvas1.
      // let imgSource;
      // imgSource = new Image();
      let imgDataUrlSource = await window.imgSearchAPI.openImage(
        this.selectImageToSearch
      );
      // imgSource.src = imgDataUrlSource;
      await this.processImage(imgDataUrlSource);
      // imgSource.onload = async () => {
      //   await this.processImage(paths, imgDataUrlSource);
      // };
    },
    async processImage(img) {
      const worker = await Tesseract.createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(img);
      console.log(text);
      await worker.terminate();
      // if (paths.length) {
      //   try {
      //     let val = paths.pop();
      //     const imgDataUrlTarget = await window.imgSearchAPI.openImage(val);
      //     console.log(
      //       pixelmatch(imgSource.data, imgTarget.data, {
      //         threshold: 0.1,
      //       })
      //     );
      //     imgDataUrlTarget;
      //     //   let imgTarget;
      //     //   imgTarget = new Image();
      //     //   imgTarget.src = imgDataUrlTarget;
      //     //   imgTarget.onload = async () => {
      //     //     // const src = cv.imread(imgSource);
      //     //     // const templ = cv.imread(imgTarget);
      //     //     // let dst = new cv.Mat();
      //     //     // let mask = new cv.Mat();
      //     //     const canvasSource = document.createElement("canvas");
      //     //     canvasSource.width = imgSource.width;
      //     //     canvasSource.height = imgSource.height;
      //     //     const canvas_ctx = canvasSource.getContext("2d");
      //     //     canvas_ctx.drawImage(
      //     //       imgSource,
      //     //       0,
      //     //       0,
      //     //       imgSource.width,
      //     //       imgSource.height
      //     //     );
      //     //     console.log(canvasSource.data);
      //     //     console.log(canvas_ctx.data);
      //     //     try {
      //     //       console.log(
      //     //         pixelmatch(imgSource.data, imgTarget.data, {
      //     //           threshold: 0.1,
      //     //         })
      //     //       );
      //     //       // cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask);
      //     //     } catch (err) {
      //     //       console.log(err);
      //     //     }
      //     //     // let result = cv.minMaxLoc(dst, mask);
      //     //     console.log(val);
      //     //     console.log(result);
      //     //     this.searchedImages = window.totalSelectedPaths - paths.length; // for showing the loading
      //     //     this.processImage(paths, imgSource);
      //     //   };
      //   } catch (err) {
      //     console.log(err);
      //     Notify.create({ message: err.toString() });
      //   }
      // }
    },
  },
};
</script>
