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
    <p class="text-subtitle1 q-ma-sm text-white">Recent searches:</p>
    <div class="row justify-center" v-for="i in 100" :key="i">
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
        <q-card-section>Hello</q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            style="border: black 2px solid"
            class="text-black bg-grey-3"
            round
            icon="arrow_right_alt"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
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
export default {
  // name: 'ComponentName',
  setup() {
    return {};
  },
};
</script>
