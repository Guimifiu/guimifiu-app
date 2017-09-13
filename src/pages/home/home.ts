import { Component } from '@angular/core';
import { NavController, Platform, ModalController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  CameraPosition,
  MarkerOptions,
  Marker,
  GoogleMapsAnimation,
} from '@ionic-native/google-maps'
import { Geofence } from '@ionic-native/geofence';
import { Geolocation } from '@ionic-native/geolocation';

import { GasStationService } from '../../providers/gas-station-service';
import { MapService } from '../../providers/map-service';
import { LoadingService } from '../../providers/loading-service';
import { GasStation } from '../../models/gas-station';
import { Place } from '../../models/place';
import { SearchPlacePage } from '../search-place/search-place';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  providers: [
    GoogleMaps,
    GasStationService,
    LoadingService,
    Geolocation,
    MapService,
    Geofence
  ]
})

export class HomePage {
    map: GoogleMap;

    constructor(
      public navCtrl: NavController,
      public platform: Platform,
      private googleMaps: GoogleMaps,
      private gasStationService: GasStationService,
      private loadingService: LoadingService,
      private geolocation: Geolocation,
      private modalController: ModalController,
      private mapService: MapService,
      private geofence: Geofence
    ){
      platform.ready().then(() => {
          this.loadMap()
      });
      geofence.initialize().then(
        // resolved promise does not return a value
        () => console.log('Geofence Plugin Ready'),
        (err) => console.log(err)
      )
      this.addGeofence();
    }

    ngOnInit(){
      if(this.map != null)
        this.map.setClickable(true);
      if(this.mapService.currentMap != null)
        this.getClosestGasStations();
    }

    getClosestGasStations() {
      this.mapService.currentMap.clear();
      this.loadingService.showLoading('Carregando Postos...');
      this.mapService
        .getCurrentPosition()
        .then(currentPosition => {
          let lat = currentPosition.latLng.lat
          let lng = currentPosition.latLng.lng
          this.gasStationService
          .getClosestGasStations(lat, lng)
          .then(gasStations => {
            this.plotGasStationsOnMap(gasStations);
            this.loadingService.dismissLoading()
          })
        }).catch(error => {
          console.log(JSON.stringify(error));
          this.loadingService.dismissLoading();
        });
      }

    plotGasStationsOnMap(gasStations) {
      for(var i in gasStations){
        let location = new LatLng(parseFloat(gasStations[i].latitude), parseFloat(gasStations[i].longitude));
        let markerOptions: MarkerOptions = {
          position: location,
          snippet: gasStations[i].vicinity,
          title: gasStations[i].name,
          icon: { url : 'assets/images/pump_map.png', size: { height: 40, width: 25 } },
          infoClick: () => {
            alert("Informações do posto");
          }
        };

        this.map.addMarker(markerOptions)
        .then((marker: Marker) => {

        });
      }
    }

    // getUserCurrentLocation(): Promise<LatLng> {
    //   return this.geolocation.
    //     getCurrentPosition().
    //     then((response) => {
    //       let location = new LatLng(response.coords.latitude, response.coords.longitude);
    //       return location;
    //     }).catch((error) => {
    //       console.log('Error getting location', error);
    //   });
    // }

    loadMap(){
      let mapOptions = {
        'backgroundColor': 'white',
        'controls': {
          'compass': true,
          'myLocationButton': true,
          'indoorPicker': true,
          'zoom': true
        },
        'gestures': {
          'scroll': true,
          'tilt': true,
          'rotate': true,
          'zoom': true
        }
      }

      let mapElement: HTMLElement = document.getElementById('map');
      this.map = new GoogleMap(mapElement, mapOptions);
      this.mapService.currentMap = this.map;
      this.getClosestGasStations();

      this.map.one(GoogleMapsEvent.MAP_READY)
      .then( () => {
        this.mapService.moveCameraToCurrentPosition();
      });
    }

    handleSearchPlaceInformation(searchedPlace) {
      if (searchedPlace.vicinity != '') {
        this.loadingService.showLoading('Buscando Postos...')
        this.mapService.currentMap.clear();
        this.mapService.getPositionFromAddress(searchedPlace.id)
        .then(place => {
          let position = new LatLng(parseFloat(place.latitude), parseFloat(place.longitude))
          this.mapService.moveCameraToPosition(position);
          this.mapService.addDestinationMarker(place, position);
          this.getGasStationsOnDirection(place);
        }).catch(error => console.log(JSON.stringify(error)))
      }
    }

    getGasStationsOnDirection(searchedPlace) {
      this.mapService
        .getCurrentPosition()
        .then(currentPosition => {
          this.mapService.
            getGasStationsOnDirection(
              currentPosition.latLng.lat,
              currentPosition.latLng.lng,
              searchedPlace.latitude,
              searchedPlace.longitude
            ).then(gasStations => {
              this.plotGasStationsOnMap(gasStations);
            }).then(() => this.loadingService.dismissLoading())
        }).catch(error => {
          this.loadingService.dismissLoading()
          console.log(JSON.stringify(error))
        })
    }
    private addGeofence() {
      //options describing geofence
      let fence = {
        id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdbc', //any unique ID
        latitude:       -16.013832, //center of geofence radius
        longitude:      -48.064837,
        radius:         100, //radius to edge of geofence in meters
        transitionType: 3, //see 'Transition Types' below
        notification: { //notification settings
            id:             789, //any unique ID
            title:          'You crossed a fence', //notification title
            text:           'You just arrived to Gliwice city center.', //notification body
            openAppOnClick: true //open app when notification is tapped
        }
      }
      this.geofence.addOrUpdate(fence).then(
         () => console.log('Geofence added'),
         (err) => console.log('Geofence failed to add')
       );
   }
}
