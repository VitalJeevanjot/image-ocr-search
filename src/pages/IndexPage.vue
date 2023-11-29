<template>
  <q-page style="overflow: hidden">
    <div class="row q-ma-sm justify-center" id="container">
      <q-btn
        class="q-ma-sm q-px-sm"
        label="Search"
        dense
        flat
        icon="image_search"
        id="button_main"
        @click="$router.push('/filesSearch')"
      />
    </div>

    <div class="row justify-center">
      <SearchHistory />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import SearchHistory from "components/SearchHistory.vue";

export default defineComponent({
  name: "IndexPage",
  components: {
    SearchHistory,
  },
  methods: {
    // gotResult(error, results) {
    //   // Display error in the console
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     // The results are in an array ordered by confidence.
    //     console.log(results);
    //     console.log(`Label: ${results[0].label}`);
    //     console.log(`Confidence: ${results[0].confidence}`);
    //   }
    // },
  },
  mounted() {
    // let classifier, img;
    // img = new Image();
    // img.src = "male-red-bullfinch-bird.jpg";
    // console.log(classifier.);
    //canvas
    // let canvas = document.createElement("canvas");
    // canvas.width = 400;
    // canvas.height = 200;
    // document.getElementById("container").appendChild(canvas);
    // let canvas_ctx = canvas.getContext("2d");
    //on image load
    // img.onload = () => {
    //   // canvas_ctx.drawImage(img, 0, 0, 400, 200);
    // };
  },
});
</script>
