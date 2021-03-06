import { Component, OnInit } from '@angular/core';
import { SitioService } from '../sitios/sitios.service';
import { AlertController, ModalController } from '@ionic/angular';
import { Map, latLng, tileLayer, Layer, marker } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import 'leaflet-routing-machine';
import 'leaflet';
import 'leaflet.markercluster';
import { BuscarMapaPage } from '../modals/buscar-mapa/buscar-mapa.page';
declare let L;

@Component({
    selector: 'app-map',
    templateUrl: 'map.page.html',
})
export class MapPage implements OnInit {
    mapid: any;
    capa: any;
    selectedUnidadAcademica = null;
    mostrarUnidadAcademica = false;
    mostrarSitioInput = false;
    nombreSitio;
    public center = [-38.940629, -68.055402];
    modalBuscar: any;
    constructor(
        private sitioService: SitioService,
        public alertController: AlertController,
        private geolocation: Geolocation,
        private modalController: ModalController,
    ) {

    }

    ngOnInit() {

    }

    ionViewDidEnter() {
        this.geolocation.getCurrentPosition().then((resp) => {
            this.mapid = new Map('mapid', { attributionControl: false, scrollWheelZoom: false }).setView([-38.940629, -68.055402], 19);

            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                // tslint:disable-next-line
                attribution: `Map data &copy; <a
          href="https://www.openstreetmap.org/" > OpenStreetMap < /a> contributors, <a
          href="https://creativecommons.org/licenses/by-sa/2.0/" > CC - BY - SA < /a>, Imagery
            © < a href = "https://www.mapbox.com/" > Mapbox < /a>`,
                maxZoom: 18
            }).addTo(this.mapid);

            L.marker([resp.coords.latitude, resp.coords.longitude], {
                icon: new L.Icon({
                    iconUrl: '../../assets/leaflet/images/marker-icon-alt.png',
                    retinaUrl: '../../assets/leaflet/images/marker-icon-2x-alt.png',
                    shadowUrl: '../../assets/leaflet/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(this.mapid);

        }).catch((error) => {
            console.log('Error getting location', error);
        });
    }

    updateMapa(sitios) {
        this.mostrarSitioInput = false;
        this.selectedUnidadAcademica = null;
        this.nombreSitio = null;
        const markers = L.markerClusterGroup();
        for (const sitio of sitios) {
            const customPopup =
                `<div style="text-align: center;">
            <div style="color: #000 !important; font-size: 18px;">
              ${sitio.nombre}
            </div>
            <div style="color: #043345 !important; font-size: 15px;">
              <strong>${sitio.piso}</strong>
            </div>
        </div>`;

            // specify popup options
            const customOptions = {
                className: 'custom'
            };

            // create marker object, pass custom icon as option, pass content and options to popup, add to map
            markers.addLayer(L.marker([sitio.latitud, sitio.longitud], {
                icon: new L.Icon({
                    iconUrl: '../../assets/leaflet/images/marker-icon.png',
                    retinaUrl: '../../assets/leaflet/images/marker-icon-2x.png',
                    shadowUrl: '../../assets/leaflet/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).bindPopup(customPopup, customOptions));
        }

        this.capa = markers;
        this.mapid.addLayer(markers);
    }

    toggleUnidadAcademica() {
        this.mostrarUnidadAcademica = !this.mostrarUnidadAcademica;
        this.mostrarSitioInput = false;
    }

    toggleSitioInput() {
        this.mostrarSitioInput = !this.mostrarSitioInput;
        this.mostrarUnidadAcademica = false;
    }

    async modalBuscarMapa() {
        const modal = await this.modalController.create({
            component: BuscarMapaPage
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();

        if (data.result) {
            if (this.capa) {
                this.mapid.removeLayer(this.capa);
            }

            this.updateMapa(data.result);
        }
    }

    limpiarMapa() {
        if (this.capa) {
            this.mapid.removeLayer(this.capa);
        }
    }

}
