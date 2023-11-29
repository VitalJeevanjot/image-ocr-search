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
          height: 10vh;
          border-radius: 25px;
        "
      >
        <q-card-section>Hello</q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
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
export default {
  // name: 'ComponentName',
  setup() {
    return {};
  },
};
</script>
