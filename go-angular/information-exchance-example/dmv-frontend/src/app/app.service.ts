import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NG_APP_API_URL } from './environment/environment';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    constructor(private http: HttpClient) { }

    rootURL = NG_APP_API_URL;

    headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    getNIC() {
        return this.http.get("http://localhost:8000" + '/authorize?redirectUrl=http://localhost:4200/token',);
    }

}
