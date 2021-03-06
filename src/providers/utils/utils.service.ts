import { Injectable } from '@angular/core';
import { AlertController, Content, ToastController, ToastOptions } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { LoggerService } from '../logger/logger.service';

// 3rd party
//import * as moment from 'moment-timezone';

import { LanguageService } from '../language/language.service';
import { ErrorCaseService } from './../error-case/error-case.service';

//=============================================================================
// Standalone exports
// add here functions that can be used in classes not using the angular dependency injection (ex: models)

export const transfer_types_list = new Map<string, number>([
	[ "loyaltyPoints", 0 ],
	[ "cashless", 1 ]
  ]);

export const noop = () => { };

export function json2array(source: any): Array<any> {
	return source == undefined ? [] : Array.isArray(source) ? source : [source];
}

// Date mgmt

export function is_date_special(sDate: string): boolean {
	return sDate == undefined || sDate == 'not-a-date-time' || sDate == '+infinity' || sDate == '-infinity';
}

// return current date YYYY-MM-DD
export function today(): string {
	return new Date().toISOString().substr(0, 10);
}

export function toDate(dateString: string): string {
	var result = dateString.substr(6,2) + ' - ' + dateString.substr(4,2) + ' - ' + dateString.substr(0,4);

	return result;
}

// return index string into string parent
export function getValueFromString(str: string, paramName: string): string {
	var indexParam: number;
	var value = "";
	
	indexParam = str.search(new RegExp(paramName)) + paramName.length + 1;
	console.warn(indexParam);

	// param not found
	if(indexParam == -1)
		return value;

	let indexEndCharacter = str.indexOf(";", indexParam);
	console.warn(indexEndCharacter);

	// End charater not found
	if(indexParam == -1)
		return value;

	value = str.substring(indexParam, indexEndCharacter);


	return value;
}

/*export function date_utc_to_local_string(utc_date: string, timezone: string, seconds: boolean = false, with_sep:boolean = true): string {

	if (!utc_date) return utc_date;
	let sep = with_sep ? 'T' : ' ';
	return moment.tz(utc_date, "UTC").tz(timezone).format('YYYY-MM-DD'+sep+'HH:mm' + (seconds ? ':ss' : ''));
}
export function date_local_to_utc_string(local_date: string, timezone: string, seconds: boolean = false): string {

	if (!local_date) return local_date;
	return moment.tz(local_date, timezone).tz("UTC").format('YYYY-MM-DDTHH:mm' + (seconds ? ':ss' : ''));
}*/

//=============================================================================
// UTILS Service

@Injectable()
export class Utils {

	//=========================================================================
	// ATTRIBUTES
  	//=========================================================================
  
	TAG = "Utils";

	EVENT_DISMISS_ALERT = 5000;

  	//=========================================================================
	// CONSTRUCTOR
	//=========================================================================

	constructor(
		private alertCtrl: AlertController
		, private toastCtrl: ToastController

		, private langService: LanguageService
		, private errorService: ErrorCaseService 
		, private logger: LoggerService
	) {



	}

	//=========================================================================
	// FUNCTIONS
	//=========================================================================
	  
	public delay(timeMs: number) {
		return new Promise(resolve => setTimeout(resolve , timeMs));
	}

	leave_form_view(_form: NgForm, save_func: () => Promise<any>): Promise<any> {

		if (_form.dirty == false) {
			// nothing to save -> can leave directly
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {

			if (_form.valid) {
				this
					// display save box
					.alert_save()
					// save if requested by the user
					.then(bSave => bSave ? save_func() : true)
					// leave the page
					.then(() => resolve())
					// action cancelled or failed to save -> don't leave
					.catch(() => reject());
			}
			else {
				// invalid form -> only 2 options: leave without saving or don't leave.
				this
					.alert_confirm({ title: this.langService.get('PAGE_LEAVE') + " ?" })
					.then(bLeave => bLeave ? resolve() : reject());
			}
		});
	}

	alert_save(): Promise<boolean> {

		// resolve(save or not), reject(cancel)

		return new Promise((resolve, reject) => {

			let alert = this.alertCtrl.create({
				title: this.langService.get('SAVE_QUESTION'),
				//message: '',
				buttons: [
					{
						text: this.langService.get('SAVE'),
						handler: () => resolve(true)
					},
					{
						text: this.langService.get('SAVE_NO'),
						handler: () => resolve(false)
					},
					{
						text: this.langService.get('CANCEL'),
						role: 'cancel',
						handler: () => reject()
					},
				],
				enableBackdropDismiss: false,
				cssClass: 'alert-popup'
			});
			alert.present();
		})
	};

	/**
	 * display a confirmation alert before executing some task
	 */
	alert_confirm(options: { title?: string, message?: string, on_confirm?: () => Promise<any> } = {}): Promise<boolean> {

		return new Promise((resolve, reject) => {

			let alert = this.alertCtrl.create({
				title: options.title,
				message: options.message,
				buttons: [
					{
						text: this.langService.get('NO'),
						handler: () => resolve(false)
					},
					{
						text: this.langService.get('YES'),
						handler: () => options.on_confirm ? options.on_confirm().catch(err => reject(err)) : resolve(true)
					}
				],
				enableBackdropDismiss: false,
				cssClass: 'alert-popup'
			});
			alert.present();
		})
	};

	alert_simple(title?: string, message?: string): Promise<any> {

		return new Promise((resolve, reject) => {
			let alert = this.alertCtrl.create({
				title: title,
				message: message,
				buttons: [{ text: 'OK', handler: () => resolve() }],
				enableBackdropDismiss: false,
				cssClass: 'alert-popup'
			});
			alert.present();
		})
	};

	alert_success_simple(label_message?: string) {
		
		let alert = this.alertCtrl.create({
			title: this.langService.get("SUCCESS"),
			subTitle: this.langService.get(label_message),
			buttons: ['OK'],
			enableBackdropDismiss: false,
			cssClass: 'alert-success'
		});
		alert.present();

		setTimeout(function() {
			alert.dismiss();
		}, this.EVENT_DISMISS_ALERT);
	}

	alert_warning_simple(label_message?: string) {
		
		let alert = this.alertCtrl.create({
			title: this.langService.get("WARNING"),
			subTitle: this.langService.get(label_message),
			buttons: ['OK'],
			enableBackdropDismiss: false,
			cssClass: 'alert-warning'
		});
		alert.present();

		setTimeout(function() {
			alert.dismiss();
		}, this.EVENT_DISMISS_ALERT);
	}

	alert_error_simple(label_message: string) {

		let message = this.langService.get(label_message)? this.langService.get(label_message) : this.langService.get("UNKNOWN_ERROR");

		let alert = this.alertCtrl.create({
			title: this.langService.get("ERR"),
			subTitle: message,
			buttons: ['OK'],
			enableBackdropDismiss: false,
			cssClass: 'alert-error'
		});
		alert.present();

		setTimeout(function() {
			alert.dismiss();
		}, this.EVENT_DISMISS_ALERT);
	}

	alert_error(error: string, errorString: string, typeTransfer?: number) {
		
		let labelError: string;
		let message: string;

		if(typeTransfer != undefined)
			labelError = this.errorService.getErrorTransfer(error, typeTransfer);
		else
			labelError = this.errorService.getError(error);

		if(labelError != error)
			 message = this.langService.get(labelError);
		else
			message = errorString;

		let alert = this.alertCtrl.create({
			title: this.langService.get("ERR") + ' "' + error + '"',
			subTitle: message,
			buttons: ['OK'],
			enableBackdropDismiss: false,
			cssClass: 'alert-error'
		});
		alert.present();

		setTimeout(function() {
			alert.dismiss();
		}, this.EVENT_DISMISS_ALERT);
	}

	json2array(source: any): Array<any> {
		return json2array(source);
	}
	is_date_special(sDate: string): boolean {
		return is_date_special(sDate);
	}
	today(): string {
		return today();
	}
	now_utc(): string {
		return new Date().toISOString();
	}
	/*date_utc_to_local_string(utc_date: string, timezone: string): string {
		return date_utc_to_local_string(utc_date, timezone);
	}
	date_local_to_utc_string(local_date: string, timezone: string): string {
		return date_local_to_utc_string(local_date, timezone);
	}*/

	show_notification(message: string, duration: number = 2000, position: string = 'bottom', options: ToastOptions = {}): Promise<any> {

		options.message = message;
		options.duration = duration;
		options.position = position;

		return this.toastCtrl.create(options).present();
	}

	reset_form_state(form: NgForm) {
		form.control.markAsPristine();
		form.control.markAsUntouched();
	}

	scrollToElement(content: Content, id: string, duration: number = 800) {

		var el = document.getElementById(id);
		var rect = el.getBoundingClientRect();
		// scrollLeft as 0px, scrollTop as "topBound"px, move in M milliseconds
		content.scrollTo(0, rect.top, 800);
	}
}