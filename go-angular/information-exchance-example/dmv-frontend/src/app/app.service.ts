import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NG_APP_API_URL } from './environment/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    nicAccessToken = this.cookieService.get('nic-api-nic-service-auth');

    headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${this.nicAccessToken}`);

    getAuthorization() {
        return window.location.href = NG_APP_API_URL + '/authorize';
    }

    getNIC() {
        return this.http.get(NG_APP_API_URL + '/data', { 'headers': this.headers, withCredentials: true });
    }

}
