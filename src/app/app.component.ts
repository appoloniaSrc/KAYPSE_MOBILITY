import { Component, ViewChild } from '@angular/core';

import { Platform, Nav, IonicApp, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from "@ionic-native/push";
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/ApplicationPages/HomePages/home/home';
import { AccountPage } from '../pages/ApplicationPages/AccountPages/account/account';
import { SettingsPage } from '../pages/ApplicationPages/SettingsPages/settings/settings';

import { AuthentificationWebService } from './../providers/authentification/authentification.web.service';
import { LoggerService } from './../providers/logger/logger.service';
import { Utils } from './../providers/utils/utils.service';
 
@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  //=================================
	// ATTRIBUTES
	//=================================

  TAG = "MyApp";

  @ViewChild(Nav) nav: Nav;
  rootPage:any = "LoginPage";
  pages: Array<{title: string, component: any}>;

  solde = "120.00"

  timerLogout: any;

  //=================================
	// CONSTRUCTOR
	//=================================
 
  constructor (
    private platform: Platform
    , private statusBar: StatusBar
    , private splashScreen: SplashScreen
    , private alertCtrl: AlertController
    , private pref: Storage

    , private auth: AuthentificationWebService
    , private logger: LoggerService
    , private utils: Utils
    //,private push: Push
  ) {

    let self = this;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // Clear preferences
      this.auth.deletePref();

      // Set Site ID
      this.pref.set("SITE_ID", "00154");

      // When the app is put in the background
      platform.pause.subscribe(() => {
        this.timerLogout = setTimeout(() => {
          this.auth.deletePref()
            .then(() => {
              this.nav.setRoot('LoginPage')
            });
        }, 600000);
      }); 

      // When the app is put in the foreground
      platform.resume.subscribe(() => {
        clearTimeout(this.timerLogout);
      });

      // Override event BackButton on mobile
      platform.registerBackButtonAction(function(event) {
        let nav = self.nav;
        if(nav.getActive().component.name == "HomePage" || nav.getActive().component.name == "LoginPage"){
          var isCloseApp: boolean;
          utils.alert_confirm({title: "Quit", message: "Do you want to quit this application ?"})
            .then(result => isCloseApp = result);

          if(isCloseApp){
            auth.deletePref();
            platform.exitApp();
          }
        }
        else if(nav.getActive().component.name == "AccountPage" || nav.getActive().component.name == "SettingsPage"){
          nav.setRoot(HomePage);
        }
        else {
          nav.remove(nav.getActive().index);
        }
      })
    });

    //this.initPushNotification();

    // Array of pages
    this.pages = [
      { title: 'Home', component: HomePage }
      ,{ title: 'Account', component: AccountPage }
      ,{ title: 'Settings', component: SettingsPage }
    ];
  }

  //=================================
	// METHODS
  //=================================
  
  // Open the page passed as argument
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
      this.nav.setRoot(page.component);
  }

  /*private initPushNotification() {
    if (!this.platform.is('cordova')) {
      console.warn("Push notifications not initialized. Cordova is not available - Run in physical device");
      return;
    }
    const options: PushOptions = {
      android: {
        senderID: "889128944192"
        ,vibrate: true
        ,sound: true
        ,forceShow: true
      },
      ios: {
        alert: true,
        badge: true,
        sound: true
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      console.log("device token ->", data.registrationId);
      //TODO - send device token to server
    });

    pushObject.on('notification').subscribe((data: any) => {
      console.log('message', data.message);
      //if user using app and push notification comes
      if (data.additionalData.foreground) {
        // if application open, show popup
        let confirmAlert = this.alertCtrl.create({
          title: 'New Notification',
          message: data.message,
          buttons: [{
            text: 'Ignore',
            role: 'cancel'
          }, {
            text: 'View',
            handler: () => {
              //TODO: Your logic here
              this.nav.push(HomePage, {message: data.message});
            }
          }]
        });
        confirmAlert.present();
      } else {
        //if user NOT using app and push notification comes
        //TODO: Your logic on click of push notification directly
        this.nav.push(HomePage, {message: data.message});
        console.log("Push notification clicked");
      }
    });

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }*/
}