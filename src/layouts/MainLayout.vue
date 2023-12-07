<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="text-white"
      style="
        background-color: rgb(38, 40, 40);
        border-bottom: 1px solid rgb(42, 55, 55);
      "
    >
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          size="sm"
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->
        <q-toolbar-title> Image Search OCR </q-toolbar-title>
        <!-- <div>ocrs</div> -->
        <!-- <div>characters</div>
        <div>faces</div> -->
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      style="background-color: rgb(63, 83, 83); color: white"
    >
      <q-list>
        <div class="row justify-end">
          <q-btn
            class="q-mr-sm q-mt-sm"
            icon="close"
            dense
            rounded
            size="sm"
            flat
            @click="toggleLeftDrawer"
          />
        </div>
        <q-item-label header style="padding-top: 5px; color: white">
          Saved Folders</q-item-label
        >
        <q-separator style="background-color: rgb(137, 137, 137)" />
        <q-item-label header style="color: white">Saved Models</q-item-label>

        <- <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        /> -> nestedly commented
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
body {
  font-family: "Montserrat Alternates Regular";
  background-color: rgb(29, 32, 32);
  /* overflow: hidden; */
}

.q-drawer--left.q-drawer--bordered {
  border-right: 1px solid rgb(24, 32, 32);
}

::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-thumb {
  background: rgb(33, 43, 43);
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background: rgb(66, 68, 68);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #646464;
}

#button_main {
  background-color: rgb(42, 55, 55);
  color: white;
  border: 1px solid rgb(24, 32, 32);
}
</style>

<script>
import { defineComponent, ref } from "vue";

// import EssentialLink from "components/EssentialLink.vue";
// const linksList = [
//   {
//     title: "Docs",
//     caption: "quasar.dev",
//     icon: "school",
//     link: "https://quasar.dev",
//   },
//   {
//     title: "Github",
//     caption: "github.com/quasarframework",
//     icon: "code",
//     link: "https://github.com/quasarframework",
//   },
//   {
//     title: "Discord Chat Channel",
//     caption: "chat.quasar.dev",
//     icon: "chat",
//     link: "https://chat.quasar.dev",
//   },
//   {
//     title: "Forum",
//     caption: "forum.quasar.dev",
//     icon: "record_voice_over",
//     link: "https://forum.quasar.dev",
//   },
//   {
//     title: "Twitter",
//     caption: "@quasarframework",
//     icon: "rss_feed",
//     link: "https://twitter.quasar.dev",
//   },
//   {
//     title: "Facebook",
//     caption: "@QuasarFramework",
//     icon: "public",
//     link: "https://facebook.quasar.dev",
//   },
//   {
//     title: "Quasar Awesome",
//     caption: "Community Quasar projects",
//     icon: "favorite",
//     link: "https://awesome.quasar.dev",
//   },
// ];

export default defineComponent({
  name: "MainLayout",

  components: {
    // EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      // essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  mounted() {
    window.indexedDb = new Dexie("ImagesSearch");
    window.indexedDbTrainedData = new Dexie("keyval-store");
    // window.indexedDb.version(1).stores({
    //   imagesClassified:
    //     "++id, uuid, path, top_label, top_confidence, all_labels, all_confidence",
    //   modelsTrained: "++id, uuid, name, path",
    // });
    window.indexedDb.version(1).stores({
      pathsIndexed: "++id, uuid, processed_date, img_path, text_data",
      // modelsTrained: "++id, uuid, name, path",
    });
    // window.indexedDbTrainedData.version(1).stores({
    //   keyval: "Key, Value",
    //   // modelsTrained: "++id, uuid, name, path",
    // });

    // console.log(readAsArrayBuffer("./eng.traineddata"));
    // window.indexedDbTrainedData.keyval.add({
    //   Key: "./eng.traineddata"
    // })
  },
});
</script>
