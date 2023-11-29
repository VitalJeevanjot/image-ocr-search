<template>
  <div
    style="
      overflow-y: scroll;
      width: 72vw;
      height: 75vh;
      border: rgba(242, 242, 242, 0.8) 2px solid;
      border-radius: 10px;
    "
  >
    <div class="row justify-center" v-for="i in 100" :key="i">
      <q-card
        class="q-my-sm"
        style="
          min-width: 220px;
          min-height: 80px;
          width: 70vw;
          border-radius: 25px;
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
  background: rgb(16, 22, 22);
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background: rgb(113, 117, 117);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #adadad;
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
