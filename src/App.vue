<template>
  <v-app dark id="app">
    <v-overlay :value="overlay">
     <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-overlay :value="overlayMessage">
      <v-card color="indigo darken-2 text-center"><v-icon class="mt-3" large>{{icon}}</v-icon><v-container>{{message}}</v-container>
        <div class="text-center mt-2">
          <v-btn icon v-if="closeBtnVisible" @click="overlayMessage = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-overlay>
    <v-container  class="fill-height" v-bind:class="colorPage"  fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" xs="12" sm="5" md="5" lg="5">
           <v-form v-model="valid">
                <div class="titlemoviebeforetext">Tytuł filmu: </div>
                <div class="titlemovie">{{title}}</div>
          <v-col cols="12" xs="12" sm="12" md="12">
            <!-- Wybór seansu godzinowego -->
            <v-select dark v-model="selectHour" :items="arrayHours" filled :rules="[v => !!v || 'Godzina jest obowiązkowa']" label="Godzina" required>
              <template slot="item" slot-scope="props">
                {{props.item | timeStampConverter}}
              </template>
              <template slot="selection" slot-scope="props">
                {{props.item | timeStampConverter}}
              </template>
            </v-select>
        <!-- podanie imienia i nazwiska -->
       <v-text-field
        filled
        dark
        :rules="requireRules"
        v-model="name"
        label="Imię i nazwisko"
        required
      ></v-text-field>
        <!-- podanie maila -->
      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="E-mail"
        filled
        dark
        required
      ></v-text-field>
        <!-- podanie numeru telefonu -->
       <v-text-field
        v-model="number"
        filled
        type="number"
        dark
        :rules="requireRules"
        label="Telefon"
        required
      ></v-text-field>        
        </v-col>
      </v-form>
      </v-col>
      <!-- Wybieranie miejsca-->
      <v-col xs="12" sm="6" md="4" lg="4">
      <div class="text-center mb-2 white--text">Wybierz miejsca</div>
      <v-layout column align-center>
      <v-row v-for="index in arrayPlaces">
       <v-btn :retain-focus-on-click="secondPage" v-if="refresh" :disabled="i[1] === 1" v-bind:class="{ activeClass: i['selected'] === 1}" @click="selectPlace(i,index)" v-for="i in index" class="placeincinema elevation-0"></v-btn>
     </v-row>
      <!-- podanie jeśli istnieje zniżki-->
    <v-select
     dark
     filled
     height="10"
     class="pt-5"
     v-model="discount"
     :rules="requireRules"
      required
     :items="arrayDiscount"
     label="Wybierz zniżkę">
     </v-select>
    </v-layout>
    </v-col>
    </v-col>
</v-row>
  <v-row justify="center">
        <v-col xs="12" sm="5" md="4" lg="4">
           <v-btn v-if="firstPage" :disabled="!valid" @click="orderPlace" rounded block color="white" light small>Zamów miejsca</v-btn>
           <v-btn v-if="secondPage" @click="orderPlaceConfirm" rounded block color="white" light small>Potwierdz</v-btn>
        </v-col>
  </v-row>
</v-container>
</v-app>
</template>

<script>
import moment from 'moment'  // Bibilioteka od czasu
const axios = require('axios'); // Biblioteka od zapytań POST i GET
export default {
  name: 'SolvroApp',
  data: () => ({
    refresh:true,
    overlay:true, 
    overlayMessage:false,
    selectHour:null,
    message:"Już prawie gotowe. Sprawdz swoje dane i potwierdz przyciskiem.",
    firstPage:true,
    secondPage:false,
    arrayHours:[],
    arrayPlaces:[],
    arraySelectedPlaces:[],
    closeBtnVisible:true,
    arrayDiscount:["Brak zniżki","20 % dla studenta", "10 % dla rodzin z dziećmi"], // tablica zniżek
    colorPage:"indigo darken-2",  // kolor strony
    icon:"description", // ikona przy komunikacie
    number:'',
    email: '',
    title:'',
    name:'',
    discount:'', 
     valid:false,
      emailRules: [ // sprawdzanie poprawności maila
        v => !!v || 'E-mail jest wymagany',
        v => /.+@.+\..+/.test(v) || 'Nieprawidłowy E-mail',
      ],
       requireRules: [
        v => !!v || 'Musisz coś wybrać',
      ],
  }),
  mounted(){
    this.checkConnectionWithServer() // sprawdzanie połączenia z serwerm /ping
    this.getDataAboutFilms();       // pobranie danych z serwera /movie
    this.discount = this.arrayDiscount[0]; // wybranie domyslnej wartości dla zniżek ["bez zniżki"]
  },
  filters: {
    // Zamiana timeStampa na Format Daty
   timeStampConverter: function (value) {
    if (!value) return ''
    value = value.toString()
    return moment.unix(value).lang('pl').format('d MMMM YYYY, HH:mm');
  }
},
  methods:{
    // sprawdzanie połączenia z serwerm /ping
    checkConnectionWithServer(){
       axios.get('http://' + location.hostname + ':5000/ping')
    .then((response)=> {
      if(response.data !== 'pong!'){
        this.overlayMessage = true;
        this.message="Brak połączenia z serwerem."}
    }).catch(()=>{
      this.overlayMessage = true;
      this.icon="sync_disabled"
      this.closeBtnVisible = false;
      this.message="Brak połączenia z serwerem.";
    })
    },
    // pobranie danych z serwera /movie
    getDataAboutFilms(){
      axios.post('http://' + location.hostname + ':5000/movie', {
           movie : "78483421",
    })
    .then((response)=> {
      if(response.data.status === "success"){
      this.arrayHours = response.data.sessions
      this.arrayPlaces = response.data.arrangement
      this.title = response.data.title
      this.overlay = false;
      }
    }).catch(()=>{
       this.overlay = false;
        this.overlayMessage = true;
        this.closeBtnVisible = false;
        this.icon="sync_disabled"
        this.message="Brak połączenia z serwerem.";
    })
    },
    // Event odpowiadający wybraniu  jakiegoś miejsca
    // wstawianie i usuwanie do zmiennej tablicowej -arraySelectedPlaces-
    selectPlace(i,nr){
      if(i['selected']){i['selected'] = 0;
      let index = this.arraySelectedPlaces.indexOf(nr);
      if (index > -1) {
        this.arraySelectedPlaces.splice(index, 1);
      }
      }
      else{ i['selected'] = 1
      this.arraySelectedPlaces.push(i)
    }
    this.refresh=false;
    this.refresh=true;
    },
    // Przycisk wstępnego potwierdzenia zamówienia i przejścia do podsumowania
    orderPlace(){
      if(!this.arraySelectedPlaces[0]){
        this.icon="warning"
        this.message = "Nie wybrałeś żadnych miejsc.";
        this.overlayMessage = true;
      }else{
      this.overlay = true;
      setTimeout(()=>{
        this.overlay = false;
        this.colorPage = "green darken-3";
        this.firstPage = false;
        this.icon="description"
        this.message="Już prawie gotowe. Sprawdz swoje dane i potwierdz przyciskiem."
        this.secondPage = true;
       this.overlayMessage = true;},800);
    }
    },
    // Od przycisku potwierdzenia 
    orderPlaceConfirm(){
          this.overlay = true;
      setTimeout(()=>{
        this.message="Dziękujemy, Państwa numer zamówienia to: 35243";
        this.overlay = false;
        this.icon="done"
        this.colorPage = "green darken-3";
        this.firstPage = false;
        this.secondPage = true;
       this.overlayMessage = true;},800);
    }
  }
};
</script>

<style> 
.placeincinema{
  width: 20px !important;
  height:20px !important;
  padding: 0px !important;
  min-width: 0px !important;
  margin-left: 2px;
  margin-top: 5px;
}

.activeClass{
  background-color: rgba(100,200,100,1) !important;
}

.titlemoviebeforetext{
  color:rgba(255,255,255,0.4);
   font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
  text-align: center;
  margin-top: 20px;
}

.titlemovie{
  color:white;
  font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
  text-align: center;
}

.messagetext{
  color:white;
  text-align: center;
  background-color: rgba(0,0,255,0.9);
  padding:20px;
  box-shadow: 0px 0px 10px rgba(0,0,255,0.3);
}

</style>
