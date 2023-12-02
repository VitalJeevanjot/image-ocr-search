<template>
  <q-page padding>
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
          :data-id="index"
          v-intersection="onIntersection"
        >
          <div v-if="visible[index]">
            <q-img
              class="self-start"
              :src="thumbnails[index]"
              @click="openImage(image)"
              style="height: 20vh; width: 20vw; border: 2px solid #efefef"
            />
          </div>

          <div
            v-else
            @click="openImage(image)"
            style="height: 20vh; width: 20vw; border: 1px solid #efefef"
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
export default {
  name: "SearchFromImages",
  data() {
    return {
      search_text: "",
      imagesPaths: [],
      imagesCount: 0,
      thumbnails: [],
    };
  },
  methods: {
    openImage(path) {
      window.electronAPI.openImageInDefault(path);
    },
  },
  mounted() {},
};
</script>
